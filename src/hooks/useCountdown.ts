import { useEffect, useState } from 'react'
import { getCountdownParts, type CountdownParts } from '../lib/countdown'

/** Cuenta atrás en tiempo real hasta targetMs, actualizada cada segundo. */
export function useCountdown(targetMs: number): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(targetMs, Date.now()))

  useEffect(() => {
    setParts(getCountdownParts(targetMs, Date.now()))
    const id = window.setInterval(() => {
      setParts(getCountdownParts(targetMs, Date.now()))
    }, 1000)
    return () => window.clearInterval(id)
  }, [targetMs])

  return parts
}
