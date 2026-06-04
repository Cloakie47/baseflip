"use client";

const GLYPHS = [
  { ch: "₿", left: "8%", top: "12%", size: 56, delay: 0 },
  { ch: "◆", left: "82%", top: "18%", size: 48, delay: 1.6 },
  { ch: "₿", left: "78%", top: "62%", size: 64, delay: 0.8 },
  { ch: "◆", left: "12%", top: "70%", size: 52, delay: 2.4 },
  { ch: "₿", left: "44%", top: "84%", size: 40, delay: 3.1 },
  { ch: "◆", left: "60%", top: "8%", size: 36, delay: 4.0 },
];

// Animated aurora gradient mesh, drifting blue/cyan/violet blobs,
// floating coin glyphs and a fine grain overlay. Pure CSS so it costs
// nothing to render and respects prefers-reduced-motion.
export function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="aurora">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      {GLYPHS.map((g, i) => (
        <span
          key={i}
          className="coin-glyph"
          style={{
            left: g.left,
            top: g.top,
            fontSize: g.size,
            animation: `glyph-float ${14 + (i % 3) * 4}s ease-in-out ${g.delay}s infinite`,
          }}
        >
          {g.ch}
        </span>
      ))}
      <div className="grain" />
    </div>
  );
}
