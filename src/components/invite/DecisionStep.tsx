import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Card from '../shared/Card'
import DodgeButton from './DodgeButton'

interface DecisionStepProps {
  toName: string
  onAccept: () => void
}

export default function DecisionStep({ toName, onAccept }: DecisionStepProps) {
  const yesRef = useRef<HTMLButtonElement | null>(null)
  // El "NO" debe esquivar toda la tarjeta (no solo el botón "SÍ"), para no
  // acabar tapando la pregunta al huir hacia una posición aleatoria.
  const cardWrapperRef = useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()

  return (
    <div ref={cardWrapperRef}>
      <Card className="text-center">
        <div className="mb-3 text-4xl">🤔</div>
        <h2 className="text-xl font-bold text-ink-700">
          Entonces, <span className="text-blush-600">{toName}</span>… ¿te apuntas?
        </h2>
        <p className="mt-1 text-sm text-ink-500">(Solo hay una respuesta correcta 😏)</p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <motion.button
            ref={yesRef}
            type="button"
            onClick={onAccept}
            whileTap={{ scale: reduceMotion ? 0.99 : 0.94 }}
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="min-h-[56px] w-full max-w-[220px] rounded-full bg-gradient-to-r from-blush-500 to-lavender-500 px-8 py-4 text-lg font-bold text-white shadow-lift"
          >
            SÍ 🎉
          </motion.button>

          <DodgeButton avoidRef={cardWrapperRef} />
        </div>
      </Card>
    </div>
  )
}
