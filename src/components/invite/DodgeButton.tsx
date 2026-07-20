import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface DodgeButtonProps {
  /** Ref del área a evitar (normalmente toda la tarjeta, incluido el botón "SÍ"). */
  avoidRef: RefObject<HTMLElement | null>
}

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

const PROXIMITY_PX = 120
const MARGIN_PX = 16
const MIN_JUMP_PX = 90
const COOLDOWN_MS = 300
const TEASES = [
  '¡Casi! 😅',
  '¡Ni de broma! 😜',
  '¡Se ha escapado! 🙈',
  '¡Prueba otra vez! 😏',
  '¡Imposible! 🤭',
  '¡Otra vez será! 😆',
]

function elementRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }
}

function overlaps(a: Rect, b: Rect, pad: number): boolean {
  return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom)
}

function distanceToRect(px: number, py: number, r: Rect): number {
  const dx = Math.max(r.left - px, 0, px - r.right)
  const dy = Math.max(r.top - py, 0, py - r.bottom)
  return Math.hypot(dx, dy)
}

export default function DodgeButton({ avoidRef }: DodgeButtonProps) {
  const reduceMotion = useReducedMotion()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  const [roaming, setRoaming] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const lastDodgeAtRef = useRef(0)
  const [tease, setTease] = useState<string | null>(null)
  const teaseTimeoutRef = useRef<number | undefined>(undefined)

  function pickPosition(current: { x: number; y: number }): { x: number; y: number } {
    const { width, height } = sizeRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    const maxX = Math.max(MARGIN_PX, vw - width - MARGIN_PX)
    const maxY = Math.max(MARGIN_PX, vh - height - MARGIN_PX)
    const avoidEl = avoidRef.current
    const avoidRect = avoidEl ? elementRect(avoidEl) : null

    const isFree = (x: number, y: number) => {
      if (!avoidRect) return true
      const candidate: Rect = { left: x, top: y, right: x + width, bottom: y + height, width, height }
      return !overlaps(candidate, avoidRect, 24)
    }

    // 1) intentos aleatorios por todo el viewport, exigiendo además un salto
    //    mínimo respecto a la posición actual para que se note el movimiento.
    for (let i = 0; i < 20; i++) {
      const x = MARGIN_PX + Math.random() * Math.max(1, maxX - MARGIN_PX)
      const y = MARGIN_PX + Math.random() * Math.max(1, maxY - MARGIN_PX)
      if (!isFree(x, y)) continue
      if (Math.hypot(x - current.x, y - current.y) < MIN_JUMP_PX) continue
      return { x, y }
    }

    // 2) franjas fijas (esquinas y centros de los bordes) que casi siempre
    //    quedan libres del área a evitar, aunque no cumplan el salto mínimo.
    const edgeCandidates: { x: number; y: number }[] = [
      { x: MARGIN_PX, y: MARGIN_PX },
      { x: maxX, y: MARGIN_PX },
      { x: MARGIN_PX, y: maxY },
      { x: maxX, y: maxY },
      { x: vw / 2 - width / 2, y: MARGIN_PX },
      { x: vw / 2 - width / 2, y: maxY },
    ]
    for (const candidate of edgeCandidates) {
      if (isFree(candidate.x, candidate.y)) return candidate
    }

    // 3) último recurso: esquina opuesta a la posición actual. Nunca deja el
    //    botón fuera del viewport; en viewports extremadamente pequeños podría
    //    rozar el área a evitar, pero es un caso límite muy raro.
    return {
      x: current.x < vw / 2 ? maxX : MARGIN_PX,
      y: current.y < vh / 2 ? maxY : MARGIN_PX,
    }
  }

  function dodge(immediate = false) {
    const now = Date.now()
    if (!immediate && now - lastDodgeAtRef.current < COOLDOWN_MS) return
    lastDodgeAtRef.current = now

    const el = buttonRef.current
    if (!el) return
    sizeRef.current = { width: el.offsetWidth, height: el.offsetHeight }

    if (!roaming) {
      const rect = elementRect(el)
      const startPos = { x: rect.left, y: rect.top }
      setPos(startPos)
      setRoaming(true)
      requestAnimationFrame(() => setPos(pickPosition(startPos)))
    } else {
      setPos((current) => pickPosition(current))
    }
  }

  function triggerTease() {
    const msg = TEASES[Math.floor(Math.random() * TEASES.length)]
    setTease(msg)
    window.clearTimeout(teaseTimeoutRef.current)
    teaseTimeoutRef.current = window.setTimeout(() => setTease(null), 1100)
  }

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      const el = buttonRef.current
      if (!el) return
      const rect = elementRect(el)
      if (distanceToRect(e.clientX, e.clientY, rect) < PROXIMITY_PX) dodge()
    }

    function handleResize() {
      const el = buttonRef.current
      if (!el || !roaming) return
      sizeRef.current = { width: el.offsetWidth, height: el.offsetHeight }
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxX = Math.max(MARGIN_PX, vw - sizeRef.current.width - MARGIN_PX)
      const maxY = Math.max(MARGIN_PX, vh - sizeRef.current.height - MARGIN_PX)
      setPos((current) => ({ x: Math.min(current.x, maxX), y: Math.min(current.y, maxY) }))
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('resize', handleResize)
      window.clearTimeout(teaseTimeoutRef.current)
    }
  }, [roaming])

  const button = (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label="No"
      onPointerDown={(e) => {
        e.preventDefault()
        dodge(true)
      }}
      onClick={() => {
        dodge(true)
        triggerTease()
      }}
      style={
        roaming
          ? { position: 'fixed', left: 0, top: 0, zIndex: 50, touchAction: 'none' }
          : { position: 'relative' }
      }
      animate={roaming ? { x: pos.x, y: pos.y } : { x: 0, y: 0 }}
      transition={
        reduceMotion
          ? { type: 'tween', duration: 0.18, ease: 'easeOut' }
          : { type: 'spring', stiffness: 380, damping: 22, mass: 0.7 }
      }
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      className="min-h-[52px] w-full max-w-[220px] rounded-full bg-white px-8 py-3.5 text-base font-semibold text-ink-600 shadow-softer ring-1 ring-black/10"
    >
      No
    </motion.button>
  )

  const teaseTooltip = (
    <AnimatePresence>
      {tease && roaming && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          style={{ position: 'fixed', left: pos.x, top: Math.max(8, pos.y - 42), zIndex: 51 }}
          className="pointer-events-none rounded-full bg-ink-700 px-3 py-1.5 text-xs font-semibold text-white shadow-lift"
        >
          {tease}
        </motion.div>
      )}
    </AnimatePresence>
  )

  // `position: fixed` solo es relativo al viewport si ningún ancestro tiene
  // transform/filter/will-change (las transiciones de pantalla con Framer
  // Motion sí lo tienen). Por eso, en cuanto el botón empieza a "huir",
  // lo sacamos del árbol con un portal directo a <body> para que sus
  // coordenadas fixed sean siempre relativas al viewport real.
  if (!roaming) {
    return button
  }

  return createPortal(
    <>
      {button}
      {teaseTooltip}
    </>,
    document.body,
  )
}
