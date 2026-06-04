"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sound";

// Frosted round speaker. Waves pulse softly when on. When off, the whole
// button softly fades to a dimmed, lower-opacity state.
export function SoundToggle() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOn(isSoundEnabled());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setSoundEnabled(next);
  };

  const live = mounted && on;

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute sound" : "Unmute sound"}
      aria-pressed={!on}
      title={on ? "Sound on" : "Sound off"}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 520, damping: 26 }}
      className="relative grid place-items-center h-11 w-11 rounded-full select-none"
      animate={{
        opacity: live ? 1 : 0.45,
        filter: live ? "saturate(1)" : "saturate(0.4)",
      }}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 65%, rgba(10,21,48,0.55))",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        boxShadow: live
          ? "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 22px rgba(70,226,255,0.22), 0 8px 18px -10px rgba(0,82,255,0.65)"
          : "inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 14px -8px rgba(0,0,0,0.55)",
        transition: "box-shadow 240ms ease",
      }}
    >
      {/* Inner gradient highlight when on. */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: live
            ? "radial-gradient(circle at 30% 25%, rgba(70,226,255,0.18), transparent 65%)"
            : "transparent",
          transition: "background 240ms ease",
        }}
      />

      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="relative"
      >
        <path
          d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z"
          fill="rgba(234,241,255,1)"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />

        <AnimatePresence initial={false}>
          {live && (
            <motion.g
              key="waves"
              initial={{ opacity: 0, x: -2 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -2 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.path
                d="M14.2 9.2c1.6 1.2 1.6 5.4 0 6.6"
                stroke="var(--base-cyan)"
                strokeWidth="1.6"
                strokeLinecap="round"
                animate={reduce ? undefined : { opacity: [0.65, 1, 0.65] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M16.8 7c2.6 1.9 2.6 8.1 0 10"
                stroke="var(--base-cyan)"
                strokeWidth="1.6"
                strokeLinecap="round"
                animate={reduce ? undefined : { opacity: [0.25, 0.85, 0.25] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.22,
                }}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </motion.button>
  );
}
