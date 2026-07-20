export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** ms restantes; 0 si ya se alcanzó o superó la fecha objetivo. */
  totalMs: number
  isPast: boolean
}

export function getCountdownParts(targetMs: number, nowMs: number): CountdownParts {
  const rawDiff = targetMs - nowMs
  const isPast = rawDiff <= 0
  const totalMs = Math.max(0, rawDiff)

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60)
  const seconds = Math.floor((totalMs / 1000) % 60)

  return { days, hours, minutes, seconds, totalMs, isPast }
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}
