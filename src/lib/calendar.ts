interface CalendarEventInput {
  title: string
  description?: string
  startMs: number
  /** Duración por defecto del plan si no se especifica: 2 horas. */
  durationMinutes?: number
}

function toUtcStamp(date: Date): string {
  // YYYYMMDDTHHmmssZ
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export function buildGoogleCalendarUrl({
  title,
  description = '',
  startMs,
  durationMinutes = 120,
}: CalendarEventInput): string {
  const start = new Date(startMs)
  const end = new Date(startMs + durationMinutes * 60_000)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: description,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function buildIcsContent({
  title,
  description = '',
  startMs,
  durationMinutes = 120,
}: CalendarEventInput): string {
  const start = new Date(startMs)
  const end = new Date(startMs + durationMinutes * 60_000)
  const stamp = toUtcStamp(new Date())
  const uid = `planazo-${startMs}-${Math.round(Math.random() * 1e9)}@planazo.app`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planazo//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
  ]

  if (description) {
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`)
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}

export function downloadIcsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
