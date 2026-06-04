"use client";

// Tiny Web Audio API helper. Gated by a user toggle, persisted to localStorage.

const STORAGE_KEY = "baseflip:sound";

let ctx: AudioContext | null = null;
let enabled = true;
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "off") enabled = false;
    else if (v === "on") enabled = true;
  } catch {
    // ignore (storage blocked).
  }
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
  hydrated = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? "on" : "off");
    } catch {
      // ignore.
    }
  }
}

export function isSoundEnabled() {
  hydrate();
  return enabled;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(opts: {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  freqEnd?: number;
}) {
  hydrate();
  if (!enabled) return;
  const audio = getCtx();
  if (!audio) return;
  const t0 = audio.currentTime + (opts.delay ?? 0);
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.freqEnd && opts.freqEnd !== opts.freq) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, opts.freqEnd),
      t0 + opts.duration,
    );
  }
  const peak = opts.gain ?? 0.08;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + opts.duration + 0.05);
}

export function playTap() {
  tone({ freq: 540, duration: 0.06, type: "triangle", gain: 0.05 });
}

export function playFlipWhoosh() {
  tone({
    freq: 220,
    freqEnd: 660,
    duration: 0.45,
    type: "sawtooth",
    gain: 0.04,
  });
}

export function playWinChime() {
  tone({ freq: 660, duration: 0.18, type: "triangle", gain: 0.08, delay: 0 });
  tone({ freq: 880, duration: 0.22, type: "triangle", gain: 0.08, delay: 0.12 });
  tone({ freq: 1320, duration: 0.32, type: "triangle", gain: 0.08, delay: 0.24 });
}

export function playLoseDeflate() {
  tone({
    freq: 320,
    freqEnd: 80,
    duration: 0.55,
    type: "sawtooth",
    gain: 0.07,
  });
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}
