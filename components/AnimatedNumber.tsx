"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "motion/react";

type Props = {
  value: number | bigint;
  className?: string;
  format?: (n: number) => string;
};

function defaultFormat(n: number): string {
  return Math.round(n).toString();
}

// Count up to the target value with a soft spring, then a tiny pop scale
// when it lands. Honors prefers-reduced-motion.
export function AnimatedNumber({ value, className, format }: Props) {
  const reduce = useReducedMotion();
  const target = typeof value === "bigint" ? Number(value) : value;
  const fmt = format ?? defaultFormat;

  const mv = useMotionValue(target);
  const spring = useSpring(mv, {
    stiffness: 140,
    damping: 22,
    mass: 0.6,
  });

  const [display, setDisplay] = useState(fmt(target));

  useEffect(() => {
    if (reduce) {
      mv.jump(target);
      setDisplay(fmt(target));
    } else {
      mv.set(target);
    }
  }, [target, reduce, mv, fmt]);

  useMotionValueEvent(spring, "change", (n) => {
    setDisplay(fmt(n));
  });

  return (
    <motion.span
      className={`tnum ${className ?? ""}`}
      key={`pop-${target}`}
      initial={reduce ? false : { scale: 0.92 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 18 }}
    >
      {display}
    </motion.span>
  );
}
