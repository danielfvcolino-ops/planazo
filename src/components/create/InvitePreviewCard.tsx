import { formatNaturalDateTime } from '../../lib/dateFormat'

interface InvitePreviewCardProps {
  fromName: string
  toName: string
  plan: string
  dateTimeMs: number
}

/** Miniatura fiel de la tarjeta que verá la persona invitada (pantalla 4). */
export default function InvitePreviewCard({ fromName, toName, plan, dateTimeMs }: InvitePreviewCardProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-blush-100 via-lavender-100 to-peach-100 p-4 ring-1 ring-white/70 shadow-softer">
      <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-lavender-600">
        Así la verá {toName || 'tu invitado/a'}
      </p>
      <div className="rounded-2xl bg-white/90 p-5 text-center shadow-sm">
        <div className="mb-2 text-3xl">💌</div>
        <p className="text-base leading-snug font-semibold text-ink-700">
          <span className="text-blush-600">{fromName || 'Alguien'}</span> te propone un planazo:
        </p>
        <p className="mt-1.5 text-lg font-bold text-ink-700">{plan || '...'}</p>
        <p className="mt-1.5 text-sm text-ink-500">{formatNaturalDateTime(dateTimeMs)}</p>
      </div>
    </div>
  )
}
