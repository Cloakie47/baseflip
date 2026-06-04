"use client";

import { motion, useReducedMotion } from "motion/react";
import { Side } from "@/config/baseflip";

type Props = {
  onPick: (s: Side) => void;
  disabled: boolean;
  busyLabel?: string;
  lastChoice?: Side | null;
};

export function ChoiceButtons({
  onPick,
  disabled,
  busyLabel,
  lastChoice,
}: Props) {
  const reduce = useReducedMotion();
  const press = reduce ? {} : { scale: 0.95 };
  const hover = reduce ? {} : { scale: 1.03 };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <motion.button
        className="btn btn-btc text-lg h-16 font-display"
        whileTap={press}
        whileHover={hover}
        onClick={() => onPick(Side.BTC)}
        disabled={disabled}
        aria-pressed={lastChoice === Side.BTC}
      >
        <span className="text-2xl leading-none">₿</span>
        <span>
          {disabled && lastChoice === Side.BTC ? busyLabel ?? "Bitcoin" : "Bitcoin"}
        </span>
      </motion.button>
      <motion.button
        className="btn btn-eth text-lg h-16 font-display"
        whileTap={press}
        whileHover={hover}
        onClick={() => onPick(Side.ETH)}
        disabled={disabled}
        aria-pressed={lastChoice === Side.ETH}
      >
        <span className="text-2xl leading-none">◆</span>
        <span>
          {disabled && lastChoice === Side.ETH ? busyLabel ?? "Ethereum" : "Ethereum"}
        </span>
      </motion.button>
    </div>
  );
}
