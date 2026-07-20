import { useMemo, useState } from 'react'
import Card from '../shared/Card'
import PrimaryButton from '../shared/PrimaryButton'
import InvitePreviewCard from './InvitePreviewCard'
import { buildInviteUrl } from '../../lib/encode'
import type { useInviteForm } from '../../hooks/useInviteForm'

interface StepShareLinkProps {
  form: ReturnType<typeof useInviteForm>
  onBack: () => void
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  try {
    document.execCommand('copy')
  } catch {
    // No hay más que podamos hacer si esto también falla.
  }
  document.body.removeChild(textarea)
}

export default function StepShareLink({ form, onBack }: StepShareLinkProps) {
  const { state, dateTimeMs } = form
  const [copied, setCopied] = useState(false)

  const url = useMemo(() => {
    if (!dateTimeMs) return ''
    return buildInviteUrl({
      n: state.fromName.trim(),
      p: state.toName.trim(),
      pl: state.plan.trim(),
      f: dateTimeMs,
    })
  }, [state.fromName, state.toName, state.plan, dateTimeMs])

  const whatsappMessage = `¡Hola ${state.toName}! 💌 Tengo un planazo para proponerte... ${url}`
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      fallbackCopy(url)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: 'Planazo 💌',
        text: `¡Hola ${state.toName}! Tengo un planazo para proponerte 💌`,
        url,
      })
    } catch {
      // El usuario canceló el share o el navegador no lo soporta: no hacemos nada.
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 -ml-1 text-sm font-medium text-ink-500 hover:text-ink-700"
      >
        ← Atrás
      </button>

      {dateTimeMs && (
        <InvitePreviewCard
          fromName={state.fromName}
          toName={state.toName}
          plan={state.plan}
          dateTimeMs={dateTimeMs}
        />
      )}

      <Card className="mt-4">
        <h2 className="mb-1 text-lg font-bold text-ink-700">Tu invitación mágica está lista ✨</h2>
        <p className="mb-4 text-sm text-ink-500">
          Copia el enlace o compártelo directamente. Todo el planazo va codificado dentro, no hace falta backend.
        </p>

        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Enlace de la invitación"
          className="mb-4 w-full rounded-2xl bg-blush-50 px-4 py-3.5 text-sm text-ink-600 shadow-softer ring-1 ring-black/5 outline-none"
        />

        <div className="space-y-3">
          <PrimaryButton onClick={handleCopy} variant={copied ? 'outline' : 'solid'}>
            {copied ? '¡Copiado! ✅' : 'Copiar Enlace 🔗'}
          </PrimaryButton>

          <PrimaryButton
            variant="whatsapp"
            onClick={() => window.open(whatsappHref, '_blank', 'noopener,noreferrer')}
          >
            Enviar por WhatsApp 💬
          </PrimaryButton>

          {canNativeShare && (
            <PrimaryButton variant="outline" onClick={handleNativeShare}>
              Compartir con... 📤
            </PrimaryButton>
          )}
        </div>
      </Card>
    </div>
  )
}
