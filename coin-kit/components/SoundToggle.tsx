'use client'

/**
 * SoundToggle.tsx — frosted icon button to mute/unmute.
 *
 * Controlled: parent owns `muted` and persists it (e.g. localStorage). Requires
 * lucide-react and the motion package (use 'framer-motion' if on the old pkg).
 *
 * Usage:
 *   const [muted, setMuted] = useState(false)
 *   <SoundToggle muted={muted} onToggle={() => setMuted(m => !m)} />
 */

import { motion, AnimatePresence } from 'motion/react'
import { Volume2, VolumeX } from 'lucide-react'

interface SoundToggleProps {
  muted: boolean
  onToggle: () => void
  size?: number
}

export default function SoundToggle({ muted, onToggle, size = 40 }: SoundToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      aria-pressed={muted}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      style={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        cursor: 'pointer',
        color: muted ? 'rgba(150,172,214,1)' : 'rgba(234,241,255,1)',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.25)',
        outline: 'none',
        padding: 0,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={muted ? 'off' : 'on'}
          initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          style={{ display: 'grid', placeItems: 'center' }}
        >
          {muted ? <VolumeX size={size * 0.5} /> : <Volume2 size={size * 0.5} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
