import { motion, useReducedMotion } from 'framer-motion'

/**
 * Fondo decorativo fijo con manchas de color suaves y flotantes.
 * Se renderiza una única vez, detrás de toda la app.
 */
export default function GradientBackground() {
  const reduceMotion = useReducedMotion()

  const blobs = [
    { className: 'bg-blush-300/50 w-[70vw] h-[70vw] -top-[20vw] -left-[20vw]', duration: 22 },
    { className: 'bg-lavender-300/45 w-[60vw] h-[60vw] top-[35vh] -right-[25vw]', duration: 26 },
    { className: 'bg-peach-300/40 w-[55vw] h-[55vw] -bottom-[20vw] left-[5vw]', duration: 30 },
  ]

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blush-50 via-lavender-50 to-peach-50" />
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 20, -10, 0],
                  y: [0, -15, 10, 0],
                  scale: [1, 1.05, 0.98, 1],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: blob.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
      ))}
    </div>
  )
}
