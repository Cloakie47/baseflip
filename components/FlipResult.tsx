"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Confetti } from "./Confetti";
import { LottieBurst } from "./LottieBurst";
import { playLoseDeflate, playWinChime, vibrate } from "@/lib/sound";

type Props = {
  win: boolean;
  streak: number;
  onAgain: () => void;
  txUrl?: string;
};

export function FlipResult({ win, streak, onAgain, txUrl }: Props) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (win) {
      playWinChime();
      vibrate(40);
    } else {
      playLoseDeflate();
      vibrate([20, 40, 20]);
    }
  }, [win]);

  const bannerVariants = win
    ? ({
        initial: { opacity: 0, scale: 0.4, y: -10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: {
          type: "spring" as const,
          stiffness: 380,
          damping: 16,
          mass: 0.7,
        },
      } as const)
    : ({
        initial: { opacity: 0, scale: 1.4, y: -40, rotate: -6 },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          rotate: 0,
          x: reduce ? 0 : [0, -10, 9, -6, 5, -3, 0],
        },
        transition: { duration: 0.55, ease: "easeOut" as const },
      } as const);

  return (
    <div className="w-full flex flex-col items-center gap-4 mt-3 relative">
      {/* Layered effects */}
      {win && <Confetti />}
      <AnimatePresence>
        <motion.div
          key={win ? "win-lottie" : "lose-lottie"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LottieBurst kind={win ? "win" : "lose"} />
        </motion.div>
      </AnimatePresence>

      <motion.div
        className={`px-5 py-2 rounded-full font-display font-black tracking-wide text-2xl ${
          win ? "text-bg-deep" : "text-white"
        }`}
        style={{
          background: win ? "var(--win)" : "var(--lose)",
          boxShadow: win
            ? "0 12px 32px -10px rgba(44,214,115,0.65)"
            : "0 12px 32px -10px rgba(255,77,94,0.65)",
        }}
        initial={bannerVariants.initial}
        animate={bannerVariants.animate}
        transition={bannerVariants.transition}
      >
        {win ? "WIN" : "MISS"}
      </motion.div>

      <motion.div
        className={`text-base ${win ? "text-win" : "text-ink-dim"}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.32 }}
      >
        {win ? `${streak} in a row` : "Streak reset. Try again, you got this."}
      </motion.div>

      <motion.div
        className="flex gap-2 mt-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.32 }}
      >
        <motion.button
          className="btn btn-primary px-5"
          whileTap={reduce ? {} : { scale: 0.96 }}
          whileHover={reduce ? {} : { scale: 1.03 }}
          onClick={onAgain}
        >
          Flip again
        </motion.button>
        {txUrl && (
          <motion.a
            className="btn btn-ghost px-4"
            whileTap={reduce ? {} : { scale: 0.97 }}
            whileHover={reduce ? {} : { scale: 1.02 }}
            href={txUrl}
            target="_blank"
            rel="noreferrer"
          >
            View tx
          </motion.a>
        )}
      </motion.div>
    </div>
  );
}
