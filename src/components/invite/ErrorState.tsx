import { useNavigate } from 'react-router-dom'
import Card from '../shared/Card'
import PrimaryButton from '../shared/PrimaryButton'

export default function ErrorState() {
  const navigate = useNavigate()

  return (
    <Card className="text-center">
      <div className="mb-3 text-4xl">🧐</div>
      <h1 className="text-xl font-bold text-ink-700">Este enlace no funciona</h1>
      <p className="mt-2 text-sm text-ink-500">
        Puede que esté incompleto o dañado. Pídele a quien te lo envió que te lo comparta de nuevo, o crea tu propio
        planazo.
      </p>
      <div className="mt-6">
        <PrimaryButton onClick={() => navigate('/')}>Crear un planazo ✨</PrimaryButton>
      </div>
    </Card>
  )
}
