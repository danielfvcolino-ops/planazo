import { useId, type FormEvent } from 'react'
import Card from '../shared/Card'
import TextField from '../shared/TextField'
import Chip from '../shared/Chip'
import PrimaryButton from '../shared/PrimaryButton'
import { PLAN_SUGGESTIONS } from '../../types'
import type { useInviteForm } from '../../hooks/useInviteForm'

interface StepNamesPlanProps {
  form: ReturnType<typeof useInviteForm>
  onNext: () => void
}

export default function StepNamesPlan({ form, onNext }: StepNamesPlanProps) {
  const { state, setFromName, setToName, setPlan, step1Valid } = form
  const fromId = useId()
  const toId = useId()
  const planId = useId()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (step1Valid) onNext()
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">💌</div>
          <h1 className="text-2xl font-bold text-ink-700">Vamos a montar un planazo</h1>
          <p className="mt-1 text-sm text-ink-500">Cuéntanos quién invita, a quién, y a qué plan.</p>
        </div>

        <div className="space-y-4">
          <TextField
            id={fromId}
            label="¿Cómo te llamas?"
            placeholder="Tu nombre"
            value={state.fromName}
            onChange={(e) => setFromName(e.target.value)}
            maxLength={40}
            autoComplete="given-name"
          />
          <TextField
            id={toId}
            label="¿A quién quieres invitar?"
            placeholder="Su nombre"
            value={state.toName}
            onChange={(e) => setToName(e.target.value)}
            maxLength={40}
            autoComplete="off"
          />

          <div>
            <TextField
              id={planId}
              label="¿Cuál es el plan?"
              placeholder="Escribe tu plan o elige uno de abajo"
              value={state.plan}
              onChange={(e) => setPlan(e.target.value)}
              maxLength={60}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {PLAN_SUGGESTIONS.map((s) => {
                const value = `${s.emoji} ${s.label}`
                return (
                  <Chip
                    key={s.label}
                    emoji={s.emoji}
                    label={s.label}
                    selected={state.plan === value}
                    onClick={() => setPlan(value)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <PrimaryButton type="submit" disabled={!step1Valid}>
            Siguiente ➔
          </PrimaryButton>
        </div>
      </form>
    </Card>
  )
}
