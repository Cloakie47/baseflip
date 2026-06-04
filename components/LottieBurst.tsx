"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import winData from "@/lib/lottie/win.json";
import loseData from "@/lib/lottie/lose.json";

// lottie-react touches `window` on import, so load it only on the client.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type Props = {
  kind: "win" | "lose";
  size?: number;
};

// One-shot Lottie effect layered over the canvas confetti.
// TODO(rive): swap to a Rive mascot here with states "idle", "flip",
// "win", "lose" once the rive runtime is wired in. The component
// signature can stay the same.
export function LottieBurst({ kind, size = 320 }: Props) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const data = kind === "win" ? winData : loseData;

  return (
    <div
      className="pointer-events-none absolute inset-0 grid place-items-center"
      aria-hidden
    >
      <Lottie
        animationData={data}
        loop={false}
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
}
