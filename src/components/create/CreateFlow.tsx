import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ScreenShell from '../shared/ScreenShell'
import ProgressDots from '../shared/ProgressDots'
import StepNamesPlan from './StepNamesPlan'
import StepDateTime from './StepDateTime'
import StepShareLink from './StepShareLink'
import { useInviteForm } from '../../hooks/useInviteForm'

type Step = 0 | 1 | 2

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

export default function CreateFlow() {
  const [step, setStep] = useState<Step>(0)
  const [direction, setDirection] = useState(1)
  const form = useInviteForm()

  function goNext() {
    setDirection(1)
    setStep((s) => (s < 2 ? ((s + 1) as Step) : s))
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s))
  }

  return (
    <ScreenShell>
      <ProgressDots total={3} current={step} />
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {step === 0 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: 'easeInOut' }}
          >
            <StepNamesPlan form={form} onNext={goNext} />
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: 'easeInOut' }}
          >
            <StepDateTime form={form} onNext={goNext} onBack={goBack} />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: 'easeInOut' }}
          >
            <StepShareLink form={form} onBack={goBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}
