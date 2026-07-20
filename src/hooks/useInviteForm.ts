import { useCallback, useMemo, useState } from 'react'
import type { InviteFormState } from '../types'

const initialState: InviteFormState = {
  fromName: '',
  toName: '',
  plan: '',
  date: null,
  time: '20:00',
}

/** Estado compartido de los 3 pasos del flujo de creación de la invitación. */
export function useInviteForm() {
  const [state, setState] = useState<InviteFormState>(initialState)

  const setFromName = useCallback((fromName: string) => {
    setState((s) => ({ ...s, fromName }))
  }, [])

  const setToName = useCallback((toName: string) => {
    setState((s) => ({ ...s, toName }))
  }, [])

  const setPlan = useCallback((plan: string) => {
    setState((s) => ({ ...s, plan }))
  }, [])

  const setDate = useCallback((date: Date | null) => {
    setState((s) => ({ ...s, date }))
  }, [])

  const setTime = useCallback((time: string) => {
    setState((s) => ({ ...s, time }))
  }, [])

  const step1Valid = useMemo(
    () =>
      state.fromName.trim().length > 0 &&
      state.toName.trim().length > 0 &&
      state.plan.trim().length > 0,
    [state.fromName, state.toName, state.plan],
  )

  const step2Valid = useMemo(
    () => state.date !== null && state.time.trim().length > 0,
    [state.date, state.time],
  )

  /** Fecha + hora combinadas en epoch ms, o null si aún faltan datos. */
  const dateTimeMs = useMemo(() => {
    if (!state.date) return null
    const [hours, minutes] = state.time.split(':').map((n) => Number.parseInt(n, 10))
    const combined = new Date(state.date)
    combined.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0)
    return combined.getTime()
  }, [state.date, state.time])

  return {
    state,
    setFromName,
    setToName,
    setPlan,
    setDate,
    setTime,
    step1Valid,
    step2Valid,
    dateTimeMs,
  }
}
