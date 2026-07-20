import Card from '../shared/Card'
import PrimaryButton from '../shared/PrimaryButton'
import { formatNaturalDateTime } from '../../lib/dateFormat'

interface ProposalStepProps {
  fromName: string
  plan: string
  dateTimeMs: number
  onContinue: () => void
}

export default function ProposalStep({ fromName, plan, dateTimeMs, onContinue }: ProposalStepProps) {
  return (
    <Card className="text-center">
      <div className="mb-3 text-4xl">✨</div>
      <p className="text-xl leading-relaxed font-semibold text-ink-700">
        <span className="font-bold text-blush-600">{fromName}</span> te propone un planazo:
      </p>
      <p className="mt-3 text-2xl font-extrabold text-ink-700">{plan}</p>
      <p className="mt-2 text-base font-medium text-lavender-600">{formatNaturalDateTime(dateTimeMs)}</p>

      <div className="mt-8">
        <PrimaryButton onClick={onContinue}>¿Qué le dices? 👀</PrimaryButton>
      </div>
    </Card>
  )
}
