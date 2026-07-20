import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import type { InviteData } from '../types'

const REQUIRED_STRING_KEYS: (keyof InviteData)[] = ['n', 'p', 'pl']

/** Comprime y codifica los datos de la invitación para meterlos en la URL. */
export function encodeInvite(data: InviteData): string {
  const json = JSON.stringify(data)
  return compressToEncodedURIComponent(json)
}

/**
 * Decodifica un string de la URL a InviteData, o null si el enlace está
 * ausente, corrupto o le faltan campos obligatorios. Nunca lanza.
 */
export function decodeInvite(raw: string | null | undefined): InviteData | null {
  if (!raw) return null
  try {
    const json = decompressFromEncodedURIComponent(raw)
    if (!json) return null
    const parsed: unknown = JSON.parse(json)
    return isValidInviteData(parsed) ? parsed : null
  } catch {
    return null
  }
}

function isValidInviteData(value: unknown): value is InviteData {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>

  for (const key of REQUIRED_STRING_KEYS) {
    if (typeof obj[key] !== 'string' || obj[key].trim().length === 0) {
      return false
    }
  }

  if (typeof obj.f !== 'number' || Number.isNaN(obj.f)) return false
  if (obj.a !== undefined && obj.a !== 1) return false

  return true
}

/** Construye la URL absoluta y compartible de la invitación. */
export function buildInviteUrl(data: InviteData): string {
  const encoded = encodeInvite(data)
  const base = window.location.origin + import.meta.env.BASE_URL
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}i?d=${encoded}`
}
