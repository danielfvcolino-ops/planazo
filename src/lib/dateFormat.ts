import { format, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

/** "sábado 25 de julio a las 20:00" */
export function formatNaturalDateTime(timestampMs: number): string {
  const date = new Date(timestampMs)
  if (!isValid(date)) return ''
  const withDay = format(date, "EEEE d 'de' MMMM", { locale: es })
  const time = format(date, 'HH:mm', { locale: es })
  return `${capitalize(withDay)} a las ${time}`
}

/** "25 de julio de 2026" — sin hora, para contextos más compactos. */
export function formatNaturalDate(timestampMs: number): string {
  const date = new Date(timestampMs)
  if (!isValid(date)) return ''
  return capitalize(format(date, "d 'de' MMMM 'de' yyyy", { locale: es }))
}

export function formatTimeShort(timestampMs: number): string {
  const date = new Date(timestampMs)
  if (!isValid(date)) return ''
  return format(date, 'HH:mm', { locale: es })
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
