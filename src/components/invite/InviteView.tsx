import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ScreenShell from '../shared/ScreenShell'
import EnvelopeStep from './EnvelopeStep'
import ProposalStep from './ProposalStep'
import DecisionStep from './DecisionStep'
import FinalStep from './FinalStep'
import ErrorState from './ErrorState'
import PastPlanState from './PastPlanState'
import { decodeInvite, encodeInvite } from '../../lib/encode'
import type { InviteData } from '../../types'

type FlowStep = 'sobre' | 'propuesta' | 'decision' | 'final'

const fadeVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

interface InviteFlowProps {
  data: InviteData
}

function InviteFlow({ data }: InviteFlowProps) {
  const [step, setStep] = useState<FlowStep>(data.a === 1 ? 'final' : 'sobre')

  function handleAccept() {
    setStep('final')
    if (data.a === 1) return
    try {
      const encoded = encodeInvite({ ...data, a: 1 })
      const url = new URL(window.location.href)
      url.searchParams.set('d', encoded)
      window.history.replaceState(null, '', url.toString())
    } catch {
      // Best-effort: si esto falla, simplemente no persistimos el "aceptado" en la URL.
    }
  }

  return (
    <ScreenShell>
      <AnimatePresence mode="wait">
        {step === 'sobre' && (
          <motion.div
            key="sobre"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <EnvelopeStep fromName={data.n} onOpened={() => setStep('propuesta')} />
          </motion.div>
        )}

        {step === 'propuesta' && (
          <motion.div
            key="propuesta"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <ProposalStep
              fromName={data.n}
              plan={data.pl}
              dateTimeMs={data.f}
              onContinue={() => setStep('decision')}
            />
          </motion.div>
        )}

        {step === 'decision' && (
          <motion.div
            key="decision"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <DecisionStep toName={data.p} onAccept={handleAccept} />
          </motion.div>
        )}

        {step === 'final' && (
          <motion.div
            key="final"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <FinalStep data={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}

export default function InviteView() {
  const [searchParams] = useSearchParams()
  const raw = searchParams.get('d')
  const data = useMemo(() => decodeInvite(raw), [raw])

  if (!data) {
    return (
      <ScreenShell>
        <ErrorState />
      </ScreenShell>
    )
  }

  if (data.f < Date.now()) {
    return (
      <ScreenShell>
        <PastPlanState data={data} />
      </ScreenShell>
    )
  }

  return <InviteFlow key={raw ?? 'invite'} data={data} />
}
