import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
}

export default function TextField({ label, id, ...inputProps }: TextFieldProps) {
  return (
    <label htmlFor={id} className="block text-left">
      <span className="mb-1.5 block text-sm font-semibold text-ink-500">{label}</span>
      <input
        id={id}
        {...inputProps}
        className="w-full rounded-2xl border-none bg-white/80 px-4 py-3.5 text-base text-ink-700
          shadow-softer ring-1 ring-black/5 placeholder:text-ink-500/40
          outline-none focus:ring-2 focus:ring-lavender-400 transition-shadow"
      />
    </label>
  )
}
