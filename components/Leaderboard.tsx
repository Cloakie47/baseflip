"use client";

import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { useAccount, usePublicClient } from "wagmi";
import { base } from "wagmi/chains";
import { BASEFLIP_ABI, BASEFLIP_ADDRESS } from "@/config/baseflip";
import { useDisplayName } from "@/hooks/useDisplayName";

type Player = {
  totalFlips: bigint;
  wins: bigint;
  currentStreak: number;
  bestStreak: number;
  weeklyStreak: number;
  lastFlipWeek: number;
  lastFlipAt: bigint;
  exists: boolean;
};

type Row = { address: Address; player: Player };

type Metric = "best" | "weekly" | "wins";

const FETCH_PAGE = 100n;
const PAGE_SIZE = 10;

// Comparator that works for both number and bigint, descending.
function cmpDesc(a: bigint | number, b: bigint | number): number {
  if (a > b) return -1;
  if (a < b) return 1;
  return 0;
}

function compareRows(a: Row, b: Row, metric: Metric): number {
  if (metric === "best") {
    const c1 = cmpDesc(a.player.bestStreak, b.player.bestStreak);
    if (c1 !== 0) return c1;
    const c2 = cmpDesc(a.player.wins, b.player.wins);
    if (c2 !== 0) return c2;
    return cmpDesc(a.player.totalFlips, b.player.totalFlips);
  }
  if (metric === "wins") {
    const c1 = cmpDesc(a.player.wins, b.player.wins);
    if (c1 !== 0) return c1;
    return cmpDesc(a.player.bestStreak, b.player.bestStreak);
  }
  // weekly
  const c1 = cmpDesc(a.player.weeklyStreak, b.player.weeklyStreak);
  if (c1 !== 0) return c1;
  return cmpDesc(a.player.bestStreak, b.player.bestStreak);
}

function valueLabel(p: Player, m: Metric): string {
  if (m === "best") return String(p.bestStreak);
  if (m === "weekly") return String(p.weeklyStreak);
  return p.wins.toString();
}

function valueSuffix(m: Metric): string {
  if (m === "wins") return "wins";
  if (m === "weekly") return "week";
  return "best";
}

export function Leaderboard() {
  const { address: me } = useAccount();
  const publicClient = usePublicClient({ chainId: base.id });

  const playersQuery = useQuery<Row[]>({
    queryKey: ["baseflip", "players", BASEFLIP_ADDRESS],
    enabled: Boolean(publicClient),
    staleTime: 10_000,
    queryFn: async () => {
      if (!publicClient) return [];
      const count = (await publicClient.readContract({
        address: BASEFLIP_ADDRESS,
        abi: BASEFLIP_ABI,
        functionName: "playerCount",
      })) as bigint;
      const out: Row[] = [];
      for (let start = 0n; start < count; start += FETCH_PAGE) {
        const remaining = count - start;
        const take = remaining > FETCH_PAGE ? FETCH_PAGE : remaining;
        const [addrs, players] = (await publicClient.readContract({
          address: BASEFLIP_ADDRESS,
          abi: BASEFLIP_ABI,
          functionName: "getPlayers",
          args: [start, take],
        })) as readonly [readonly Address[], readonly Player[]];
        for (let i = 0; i < addrs.length; i++) {
          out.push({ address: addrs[i], player: players[i] });
        }
      }
      return out;
    },
  });

  const rows = playersQuery.data ?? [];
  const loading = playersQuery.isLoading;

  const [metric, setMetric] = useState<Metric>("best");
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the active metric changes.
  useEffect(() => {
    setPage(1);
  }, [metric]);

  const sorted = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => compareRows(a, b, metric));
    return r;
  }, [rows, metric]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(startIdx, startIdx + PAGE_SIZE);

  const myRank = useMemo(() => {
    if (!me) return null;
    const lower = me.toLowerCase();
    const i = sorted.findIndex((r) => r.address.toLowerCase() === lower);
    return i >= 0 ? i + 1 : null;
  }, [sorted, me]);

  return (
    <div className="glass p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm uppercase tracking-widest text-ink-dim font-display">
          Leaderboard
        </div>
        <LayoutGroup id="lb-tabs">
          <div className="flex gap-1 text-xs">
            <Tab on={metric === "best"} onClick={() => setMetric("best")}>
              Best
            </Tab>
            <Tab on={metric === "weekly"} onClick={() => setMetric("weekly")}>
              Weekly
            </Tab>
            <Tab on={metric === "wins"} onClick={() => setMetric("wins")}>
              Wins
            </Tab>
          </div>
        </LayoutGroup>
      </div>

      {myRank !== null && (
        <div className="text-xs text-ink-dim mb-2">
          Your rank: <span className="text-ink font-bold tnum">#{myRank}</span>
          <span className="opacity-60 tnum"> of {sorted.length}</span>
        </div>
      )}

      {loading && rows.length === 0 && (
        <div className="text-ink-dim text-sm py-6 text-center">Loading...</div>
      )}
      {!loading && sorted.length === 0 && (
        <div className="text-ink-dim text-sm py-6 text-center">
          No players yet. Be the first.
        </div>
      )}

      <LayoutGroup id="lb-rows">
        <motion.ul layout className="flex flex-col gap-1">
          <AnimatePresence initial={false} mode="popLayout">
            {pageRows.map((row, i) => {
              const rank = startIdx + i + 1;
              return (
                <LeaderRow
                  key={row.address}
                  rank={rank}
                  row={row}
                  metric={metric}
                  index={i}
                  isMe={me?.toLowerCase() === row.address.toLowerCase()}
                />
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>

      {sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-3 text-xs">
          <button
            className="btn btn-ghost h-8 px-3 text-xs"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <div className="text-ink-dim tnum">
            Page <span className="text-ink font-bold">{safePage}</span> of{" "}
            {totalPages}
          </div>
          <button
            className="btn btn-ghost h-8 px-3 text-xs"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function LeaderRow({
  rank,
  row,
  metric,
  index,
  isMe,
}: {
  rank: number;
  row: Row;
  metric: Metric;
  index: number;
  isMe: boolean;
}) {
  const reduce = useReducedMotion();
  const { name } = useDisplayName(row.address);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <motion.li
      layout
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
        delay: reduce ? 0 : index * 0.035,
      }}
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl ${
        isMe
          ? "bg-base-blue/20 ring-1 ring-base-blue/50"
          : "bg-white/[0.025] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 text-right text-ink-dim font-mono tnum">
          {medal ?? `#${rank}`}
        </div>
        <div className="truncate font-medium">{name}</div>
        {isMe && (
          <span className="text-[10px] uppercase text-base-blue-2 font-bold">
            you
          </span>
        )}
      </div>
      <div className="font-display font-black text-gold tnum">
        {valueLabel(row.player, metric)}
        <span className="text-ink-dim text-xs ml-1 font-medium">
          {valueSuffix(metric)}
        </span>
      </div>
    </motion.li>
  );
}

function Tab({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-1 rounded-full transition-colors font-display ${
        on ? "text-white" : "text-ink-dim hover:text-ink"
      }`}
    >
      {on && (
        <motion.span
          layoutId="lb-tab-active"
          className="absolute inset-0 rounded-full tab-active"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
