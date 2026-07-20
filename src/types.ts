/**
 * Forma serializada de una invitación, con claves cortas a propósito
 * para que el enlace generado no sea kilométrico.
 *
 * n  -> nombre de quien invita
 * p  -> nombre de la persona invitada
 * pl -> plan propuesto
 * f  -> fecha/hora del plan, en epoch ms
 * a  -> 1 si la invitación ya fue aceptada (opcional)
 */
export interface InviteData {
  n: string
  p: string
  pl: string
  f: number
  a?: 1
}

/** Datos del formulario de creación, antes de codificarlos. */
export interface InviteFormState {
  fromName: string
  toName: string
  plan: string
  date: Date | null
  time: string // "HH:mm"
}

export const PLAN_SUGGESTIONS: { emoji: string; label: string }[] = [
  { emoji: '🎬', label: 'Cine y palomitas' },
  { emoji: '🍕', label: 'Cena italiana' },
  { emoji: '🎢', label: 'Parque de atracciones' },
  { emoji: '☕', label: 'Café y postre' },
  { emoji: '🌅', label: 'Ver el atardecer' },
  { emoji: '🥾', label: 'Ruta de senderismo' },
]
