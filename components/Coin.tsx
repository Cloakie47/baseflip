'use client'

/**
 * Coin.tsx — Baseflip flip coin (image faces)
 *
 * Flips between two rendered coin faces: Bitcoin (front) and Ethereum (back).
 * Spins while a flip is pending, decelerates and lands on the onchain result,
 * floats idly otherwise. Win = green halo pulse. Lose = red flash + one jagged
 * crack (no X).
 *
 * Requires the `motion` package (Framer Motion). On the older `framer-motion`
 * package, change the import to 'framer-motion'.
 *
 * Assets: place btc-face.png and eth-face.png in public/coin/.
 *
 * Usage:
 *   <Coin result={result} isFlipping={isFlipping} outcome={outcome} size={300} />
 *   result:  'BTC' | 'ETH' | null  (decoded Flipped event: 0 -> 'BTC', 1 -> 'ETH')
 *   outcome: 'win' | 'lose' | null
 */

import { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  animate,
  useReducedMotion,
  type AnimationPlaybackControls,
} from 'motion/react'

export type Side = 'BTC' | 'ETH'

interface CoinProps {
  result: Side | null
  isFlipping: boolean
  outcome: 'win' | 'lose' | null
  size?: number
}

const BTC_FACE = '/coin/btc-face.png'
const ETH_FACE = '/coin/eth-face.png'
const faceAngle = (side: Side) => (side === 'ETH' ? 180 : 0)

export default function Coin({ result, isFlipping, outcome, size = 300 }: CoinProps) {
  const reduce = useReducedMotion()
  const rotateY = useMotionValue(0)
  const spin = useRef<AnimationPlaybackControls | null>(null)

  useEffect(() => {
    if (isFlipping && !reduce) {
      spin.current?.stop()
      spin.current = animate(rotateY, rotateY.get() + 360 * 20, {
        duration: 6,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      })
    } else {
      spin.current?.stop()
    }
    return () => spin.current?.stop()
  }, [isFlipping, reduce, rotateY])

  useEffect(() => {
    if (!result || isFlipping) return
    spin.current?.stop()
    const offset = faceAngle(result)
    const current = rotateY.get()
    if (reduce) {
      rotateY.set(offset)
      return
    }
    const target = Math.ceil((current + 720 - offset) / 360) * 360 + offset
    animate(rotateY, target, { duration: 1.25, ease: [0.16, 1, 0.3, 1] })
  }, [result, isFlipping, reduce, rotateY])

  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    objectFit: 'contain',
    userSelect: 'none',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.45))',
  }

  return (
    <div
      style={{ width: size, height: size, position: 'relative' }}
      role="img"
      aria-label={
        isFlipping
          ? 'Coin flipping'
          : result
          ? `Coin landed on ${result === 'BTC' ? 'Bitcoin' : 'Ethereum'}`
          : 'Coin'
      }
    >
      <motion.div
        style={{ width: '100%', height: '100%', position: 'relative' }}
        animate={reduce ? {} : isFlipping || result == null ? { y: [0, -10, 0] } : { y: 0 }}
        transition={
          isFlipping || result == null
            ? { duration: 3.2, ease: 'easeInOut', repeat: Infinity }
            : { duration: 0.4 }
        }
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            rotateY,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BTC_FACE} alt="" style={faceStyle} draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ETH_FACE}
            alt=""
            style={{ ...faceStyle, transform: 'rotateY(180deg)' }}
            draggable={false}
          />
        </motion.div>

        <WinGlow show={outcome === 'win' && !isFlipping} />
        <LoseEffect show={outcome === 'lose' && !isFlipping} />
      </motion.div>
    </div>
  )
}

function WinGlow({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: '-14%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(44,214,115,0.45) 0%, rgba(44,214,115,0) 62%)',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: [0, 1, 0.5, 0.8], scale: [0.85, 1.1, 1] }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
    />
  )
}

function LoseEffect({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <>
      <motion.div
        style={{
          position: 'absolute',
          inset: '-14%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,77,94,0.5) 0%, rgba(255,77,94,0) 60%)',
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      />
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <motion.path
          d="M104 30 L93 72 L114 96 L88 120 L101 148 L91 174"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="5.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        />
        <motion.path
          d="M104 30 L93 72 L114 96 L88 120 L101 148 L91 174"
          fill="none"
          stroke="#0b1326"
          strokeOpacity="0.8"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        />
        <motion.path
          d="M114 96 L138 102"
          fill="none"
          stroke="#0b1326"
          strokeOpacity="0.75"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut', delay: 0.16 }}
        />
      </svg>
    </>
  )
}
