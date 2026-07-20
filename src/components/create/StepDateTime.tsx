import Card from '../shared/Card'
import PrimaryButton from '../shared/PrimaryButton'
import Calendar from './Calendar'
import type { useInviteForm } from '../../hooks/useInviteForm'

interface StepDateTimeProps {
  form: ReturnType<typeof useInviteForm>
  onNext: () => void
  onBack: () => void
}

export default function StepDateTime({ form, onNext, onBack }: StepDateTimeProps) {
  const { state, setDate, setTime, step2Valid } = form

  return (
    <Card>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 -ml-1 text-sm font-medium text-ink-500 hover:text-ink-700"
      >
        ← Atrás
      </button>

      <h1 className="mb-6 text-xl font-bold leading-snug text-ink-700">
        ¡Genial! ¿Qué día vas a llevar a{' '}
        <span className="text-lavender-600">{state.toName || 'esa persona'}</span> a{' '}
        <span className="text-blush-600">{state.plan || 'ese plan'}</span>?
      </h1>

      <Calendar selected={state.date} onSelect={setDate} />

      <div className="mt-5">
        <label className="block text-left">
          <span className="mb-1.5 block text-sm font-semibold text-ink-500">¿A qué hora?</span>
          <input
            type="time"
            value={state.time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-2xl bg-white/80 px-4 py-3.5 text-base text-ink-700 shadow-softer ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-lavender-400 transition-shadow"
          />
        </label>
      </div>

      <div className="mt-8">
        <PrimaryButton onClick={onNext} disabled={!step2Valid}>
          Generar Invitación Mágica ✨
        </PrimaryButton>
      </div>
    </Card>
  )
}
