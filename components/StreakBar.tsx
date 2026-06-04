"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { BASEFLIP_ABI, BASEFLIP_ADDRESS } from "@/config/baseflip";
import { AnimatedNumber } from "./AnimatedNumber";

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

export function StreakBar() {
  const { address, isConnected } = useAccount();
  const { data, refetch } = useReadContract({
    chainId: base.id,
    address: BASEFLIP_ADDRESS,
    abi: BASEFLIP_ABI,
    functionName: "getPlayer",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  // Background poll so streaks stay roughly fresh even if invalidation misses.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 12_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (tick > 0) void refetch();
  }, [tick, refetch]);

  const p = (data as Player | undefined) ?? null;
  const current = p?.currentStreak ?? 0;
  const best = p?.bestStreak ?? 0;
  const weekly = p?.weeklyStreak ?? 0;
  const totalFlips = p?.totalFlips ?? 0n;
  const wins = p?.wins ?? 0n;

  return (
    <div className="glass p-4 grid grid-cols-3 gap-2 w-full">
      <Stat
        icon={<Flame active={current > 0} />}
        label="Current"
        value={current}
        accent="var(--gold)"
      />
      <Stat
        icon={<Trophy />}
        label="Best"
        value={best}
        accent="var(--base-cyan)"
      />
      <Stat
        icon={<Calendar />}
        label="Weekly"
        value={weekly}
        accent="var(--win)"
      />
      {isConnected && (
        <div className="col-span-3 text-xs text-ink-dim text-center pt-1 tnum">
          {totalFlips.toString()} flips, {wins.toString()} wins
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <div className="flex items-center gap-1 text-ink-dim text-[10px] uppercase tracking-widest">
        <span style={{ color: accent }}>{icon}</span>
        <span>{label}</span>
      </div>
      <AnimatedNumber
        value={value}
        className="font-display text-3xl font-black"
      />
      <style jsx>{`
        div :global(.tnum) {
          color: ${accent};
          text-shadow: 0 0 14px ${accent}55;
        }
      `}</style>
    </div>
  );
}

function Flame({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ filter: "drop-shadow(0 2px 6px rgba(255,203,69,0.55))" }}
      animate={
        active && !reduce
          ? { scale: [1, 1.18, 1], rotate: [0, -3, 3, 0] }
          : { scale: 1, rotate: 0 }
      }
      transition={{
        duration: 1.6,
        repeat: active && !reduce ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      <path d="M12 2c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-2 1-4-3 2-5 5-5 9a8 8 0 0 0 16 0c0-6-5-9-8-13z" />
    </motion.svg>
  );
}

function Trophy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 4h14v3a4 4 0 0 1-4 4h-1l-1 4h2v2H9v-2h2l-1-4H9a4 4 0 0 1-4-4V4zm2 2v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6H7zM8 20h8v2H8v-2z" />
    </svg>
  );
}

function Calendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm-1 8v10h12V10H6zm2 2h3v3H8v-3z" />
    </svg>
  );
}
