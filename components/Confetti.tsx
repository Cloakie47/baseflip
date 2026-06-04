"use client";

import { useMemo } from "react";

const COLORS = [
  "var(--base-blue)",
  "var(--base-blue-2)",
  "var(--win)",
  "var(--gold)",
  "#ffffff",
];

export function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 180;
      const cx = Math.cos(angle) * dist;
      const cy = Math.sin(angle) * dist + 40; // slight downward bias
      const cr = (Math.random() * 720 - 360).toFixed(0) + "deg";
      const color = COLORS[i % COLORS.length];
      const delay = (Math.random() * 0.12).toFixed(2) + "s";
      return { cx, cy, cr, color, delay, i };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.i}
          className="confetti-piece animate-confetti"
          style={
            {
              background: p.color,
              animationDelay: p.delay,
              ["--cx" as string]: `${p.cx}px`,
              ["--cy" as string]: `${p.cy}px`,
              ["--cr" as string]: p.cr,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
