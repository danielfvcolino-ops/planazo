import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'

interface CalendarProps {
  selected: Date | null
  onSelect: (date: Date) => void
}

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function monthIndex(d: Date): number {
  return d.getFullYear() * 12 + d.getMonth()
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export default function Calendar({ selected, onSelect }: CalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected ?? today))
  const [direction, setDirection] = useState(1)

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 })
    const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [viewMonth])

  const isPrevDisabled = monthIndex(viewMonth) <= monthIndex(today)

  function goPrevMonth() {
    if (isPrevDisabled) return
    setDirection(-1)
    setViewMonth((m) => subMonths(m, 1))
  }

  function goNextMonth() {
    setDirection(1)
    setViewMonth((m) => addMonths(m, 1))
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          disabled={isPrevDisabled}
          aria-label="Mes anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-ink-600 shadow-softer disabled:opacity-30 active:scale-90 transition-transform"
        >
          ‹
        </button>
        <p className="text-sm font-bold text-ink-700">{capitalize(format(viewMonth, 'MMMM yyyy', { locale: es }))}</p>
        <button
          type="button"
          onClick={goNextMonth}
          aria-label="Mes siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-ink-600 shadow-softer active:scale-90 transition-transform"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-500/70">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={format(viewMonth, 'yyyy-MM')}
          custom={direction}
          initial={{ x: direction > 0 ? 24 : -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -24 : 24, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((day) => {
            const inMonth = isSameMonth(day, viewMonth)
            const isPast = isBefore(day, today)
            const isSelected = selected !== null && isSameDay(day, selected)
            const isToday = isSameDay(day, today)
            const disabled = isPast || !inMonth

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(day)}
                className={`aspect-square rounded-xl text-sm font-medium transition-colors
                  ${!inMonth ? 'text-transparent pointer-events-none' : ''}
                  ${inMonth && isPast ? 'text-ink-500/25' : ''}
                  ${inMonth && !isPast && !isSelected ? 'text-ink-700 hover:bg-lavender-100' : ''}
                  ${isSelected ? 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-softer' : ''}
                  ${isToday && !isSelected ? 'ring-1 ring-inset ring-lavender-400' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
