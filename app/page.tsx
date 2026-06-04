"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useAccount, useChainId } from "wagmi";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ChoiceButtons } from "@/components/ChoiceButtons";
import Coin from "@/components/Coin";
import { ConnectWallet } from "@/components/ConnectWallet";
import { FlipResult } from "@/components/FlipResult";
import { Leaderboard } from "@/components/Leaderboard";
import { SoundToggle } from "@/components/SoundToggle";
import { StreakBar } from "@/components/StreakBar";
import { SwitchChainButton } from "@/components/SwitchChainButton";
import { Side } from "@/config/baseflip";
import { useFlip } from "@/hooks/useFlip";
import { playFlipWhoosh, playTap } from "@/lib/sound";

export default function Page() {
  const reduce = useReducedMotion();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { flip, reset, phase, outcome, error, isBusy, isWrongChain } =
    useFlip();
  const [lastChoice, setLastChoice] = useState<Side | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [winVignette, setWinVignette] = useState(false);
  const [loseVignette, setLoseVignette] = useState(false);

  // Fire the page-level vignettes and shake when an outcome lands.
  useEffect(() => {
    if (phase !== "done" || !outcome) return;
    if (outcome.win) {
      setWinVignette(true);
      const t = setTimeout(() => setWinVignette(false), 700);
      return () => clearTimeout(t);
    }
    setLoseVignette(true);
    setShakeKey((k) => k + 1);
    const t = setTimeout(() => setLoseVignette(false), 700);
    return () => clearTimeout(t);
  }, [phase, outcome]);

  // Map our flip state into the Coin's props.
  const isFlipping = phase === "awaiting-wallet" || phase === "confirming";
  const coinResult =
    phase === "done" && outcome
      ? outcome.result === Side.BTC
        ? "BTC"
        : "ETH"
      : null;
  const coinOutcome: "win" | "lose" | null =
    phase === "done" && outcome ? (outcome.win ? "win" : "lose") : null;

  const handlePick = (s: Side) => {
    if (isBusy) return;
    setLastChoice(s);
    playTap();
    playFlipWhoosh();
    void flip(s);
  };

  const handleAgain = () => {
    reset();
    setLastChoice(null);
  };

  const busyLabel = useMemo(() => {
    if (phase === "awaiting-wallet") return "Confirm...";
    if (phase === "confirming") return "Onchain...";
    return undefined;
  }, [phase]);

  const explorerBase = "https://basescan.org/tx/";

  return (
    <div className="relative min-h-[100dvh] app-stage overflow-hidden">
      {/* Animated aurora + grain fill the full surround. */}
      <AuroraBackground />

      {/* Vignettes (full-viewport overlays). */}
      <div className={`vignette-win ${winVignette ? "on" : ""}`} />
      <div className={`vignette-lose ${loseVignette ? "on" : ""}`} />

      <motion.main
        key={shakeKey}
        animate={
          shakeKey > 0 && !reduce
            ? { x: [0, -10, 9, -6, 5, -3, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.45 }}
        className="relative z-10 mx-auto max-w-[440px] px-4 pt-5 pb-10 flex flex-col gap-4"
      >
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl overflow-hidden ring-1 ring-white/15"
              style={{ boxShadow: "0 10px 24px -10px rgba(0,82,255,0.6)" }}
            >
              <Image
                src="/icon.png"
                alt="Baseflip"
                width={40}
                height={40}
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-xl tracking-tight">
                Baseflip
              </div>
              <div className="text-[10px] text-ink-dim uppercase tracking-[0.18em]">
                Free flips on Base
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SoundToggle />
            <ConnectWallet />
          </div>
        </header>

        {/* Streak bar */}
        <StreakBar />

        {/* Coin stage */}
        <section className="glass p-5 flex flex-col items-center gap-4">
          <div className="h-[280px] grid place-items-center w-full">
            <Coin
              result={coinResult}
              isFlipping={isFlipping}
              outcome={coinOutcome}
              size={240}
            />
          </div>

          {!isConnected && (
            <div className="text-ink-dim text-sm text-center">
              Sign in with Base to flip. You will pay your own gas, just a
              few cents per flip.
            </div>
          )}

          {isConnected && isWrongChain && (
            <div className="w-full flex flex-col gap-2">
              <div className="text-ink-dim text-sm text-center">
                Wallet is on chain {chainId}. Flips require Base.
              </div>
              <SwitchChainButton />
            </div>
          )}

          {isConnected && !isWrongChain && phase !== "done" && (
            <>
              <ChoiceButtons
                onPick={handlePick}
                disabled={isBusy}
                busyLabel={busyLabel}
                lastChoice={lastChoice}
              />
              <div className="text-xs text-ink-dim text-center">
                Pick a side. Tap to flip.
              </div>
            </>
          )}

          {isConnected && !isWrongChain && phase === "done" && outcome && (
            <FlipResult
              win={outcome.win}
              streak={outcome.currentStreak}
              onAgain={handleAgain}
              txUrl={`${explorerBase}${outcome.txHash}`}
            />
          )}

          {phase === "error" && error && (
            <div className="text-lose text-sm text-center max-w-[320px]">
              {error}
            </div>
          )}
        </section>

        {/* Leaderboard */}
        <Leaderboard />

        <footer className="text-center text-[11px] text-ink-dim pt-2 pb-4">
          Built on Base. Every flip is a real onchain transaction.
        </footer>
      </motion.main>
    </div>
  );
}
