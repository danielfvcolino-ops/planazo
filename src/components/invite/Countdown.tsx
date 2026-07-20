import { AnimatePresence, motion } from 'framer-motion'
import { useCountdown } from '../../hooks/useCountdown'
import { pad2 } from '../../lib/countdown'

interface CountdownProps {
  targetMs: number
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/90 shadow-softer ring-1 ring-black/5 sm:h-16 sm:w-16">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute text-xl font-extrabold text-ink-700 sm:text-2xl"
          >
            {pad2(value)}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1.5 text-[11px] font-semibold tracking-wide text-ink-500/70 uppercase">{label}</span>
    </div>
  )
}

export default function Countdown({ targetMs }: CountdownProps) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(targetMs)

  if (isPast) {
    return <p className="text-center text-base font-semibold text-lavender-600">¡Es ahora mismo! 🎉</p>
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <Unit value={days} label="días" />
      <Unit value={hours} label="horas" />
      <Unit value={minutes} label="min" />
      <Unit value={seconds} label="seg" />
    </div>
  )
}
