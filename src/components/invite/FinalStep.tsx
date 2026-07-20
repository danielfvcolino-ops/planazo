import { useEffect, useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import Card from '../shared/Card'
import Countdown from './Countdown'
import { fireCelebrationConfetti } from '../../lib/confetti'
import { buildGoogleCalendarUrl, buildIcsContent, downloadIcsFile } from '../../lib/calendar'
import { formatNaturalDateTime } from '../../lib/dateFormat'
import type { InviteData } from '../../types'

interface FinalStepProps {
  data: InviteData
}

export default function FinalStep({ data }: FinalStepProps) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    fireCelebrationConfetti(Boolean(reduceMotion))
    // Solo queremos disparar el confeti una vez, al montar esta pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const googleUrl = useMemo(
    () =>
      buildGoogleCalendarUrl({
        title: `${data.pl} con ${data.n}`,
        description: 'Planazo organizado con Planazo 💌',
        startMs: data.f,
      }),
    [data.pl, data.n, data.f],
  )

  function handleDownloadIcs() {
    const content = buildIcsContent({
      title: `${data.pl} con ${data.n}`,
      description: 'Planazo organizado con Planazo 💌',
      startMs: data.f,
    })
    downloadIcsFile(content, 'planazo.ics')
  }

  return (
    <Card className="text-center">
      <div className="mb-2 text-5xl">🎉</div>
      <h1 className="text-2xl font-bold text-ink-700">¡Cita confirmada!</h1>
      <p className="mt-1 text-sm text-ink-500">
        {data.pl} · {formatNaturalDateTime(data.f)}
      </p>

      <div className="mt-6">
        <Countdown targetMs={data.f} />
      </div>

      <div className="mt-8 space-y-3">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blush-500 to-lavender-500 px-6 py-3.5 text-base font-semibold text-white shadow-lift"
        >
          Añadir a Google Calendar 🗓️
        </a>
        <button
          type="button"
          onClick={handleDownloadIcs}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white/80 px-6 py-3.5 text-base font-semibold text-ink-600 shadow-softer ring-1 ring-black/5"
        >
          Descargar .ics (Apple/Outlook) 📥
        </button>
      </div>
    </Card>
  )
}
