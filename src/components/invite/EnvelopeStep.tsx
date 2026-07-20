import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { fireEnvelopeConfetti } from '../../lib/confetti'

interface EnvelopeStepProps {
  fromName: string
  onOpened: () => void
}

export default function EnvelopeStep({ fromName, onOpened }: EnvelopeStepProps) {
  const [opening, setOpening] = useState(false)
  const reduceMotion = useReducedMotion()

  function handleOpen() {
    if (opening) return
    setOpening(true)
    fireEnvelopeConfetti(Boolean(reduceMotion))
    window.setTimeout(onOpened, reduceMotion ? 250 : 750)
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="mb-10 text-lg font-medium text-ink-600">
        Tienes una invitación de <span className="font-bold text-blush-600">{fromName}</span>…
      </p>

      <motion.button
        type="button"
        onClick={handleOpen}
        aria-label="Abrir invitación"
        className="relative"
        whileHover={reduceMotion ? undefined : { y: -4 }}
        whileTap={{ scale: 0.96 }}
        animate={opening ? { scale: 1.08, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.6, delay: opening ? 0.25 : 0, ease: 'easeIn' }}
      >
        <div className="relative h-36 w-52 sm:h-40 sm:w-60" style={{ perspective: 800 }}>
          <div className="absolute inset-0 rounded-2xl bg-white shadow-lift" />
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-blush-200), var(--color-lavender-200))',
              clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)',
            }}
          />
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 origin-top rounded-t-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-blush-400), var(--color-lavender-400))',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transformStyle: 'preserve-3d',
            }}
            animate={opening ? { rotateX: -170 } : { rotateX: 0 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: 'easeIn' }}
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center text-3xl">💌</div>
        </div>
      </motion.button>

      <p className="mt-10 text-sm text-ink-500/70">Toca el sobre para abrirlo</p>
    </div>
  )
}
