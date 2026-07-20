import { useNavigate } from 'react-router-dom'
import Card from '../shared/Card'
import PrimaryButton from '../shared/PrimaryButton'
import { formatNaturalDateTime } from '../../lib/dateFormat'
import type { InviteData } from '../../types'

interface PastPlanStateProps {
  data: InviteData
}

export default function PastPlanState({ data }: PastPlanStateProps) {
  const navigate = useNavigate()
  const celebrated = data.a === 1

  return (
    <Card className="text-center">
      <div className="mb-3 text-4xl">{celebrated ? '🥂' : '💫'}</div>
      <h1 className="text-xl font-bold text-ink-700">
        {celebrated ? 'Este planazo ya pasó... ¡y fue un sí! 🎉' : 'Este planazo ya pasó 💫'}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        {data.pl} · {formatNaturalDateTime(data.f)}
      </p>
      <p className="mt-3 text-sm text-ink-500">
        {celebrated
          ? `Esperamos que ${data.n} y ${data.p} lo disfrutarais muchísimo.`
          : 'Parece que esta invitación ha llegado tarde. ¿Organizamos otro planazo?'}
      </p>
      <div className="mt-6">
        <PrimaryButton onClick={() => navigate('/')}>Crear un planazo nuevo ✨</PrimaryButton>
      </div>
    </Card>
  )
}
