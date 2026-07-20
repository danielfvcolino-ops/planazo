interface ChipProps {
  emoji: string
  label: string
  selected?: boolean
  onClick: () => void
}

export default function Chip({ emoji, label, selected = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap
        transition-colors active:scale-95 transition-transform
        ${
          selected
            ? 'bg-lavender-500 border-lavender-500 text-white shadow-softer'
            : 'bg-white/70 border-black/5 text-ink-600 hover:bg-white hover:border-lavender-200'
        }`}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </button>
  )
}
