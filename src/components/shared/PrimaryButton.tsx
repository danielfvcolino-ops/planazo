import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PrimaryButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  variant?: 'solid' | 'outline' | 'whatsapp' | 'ghost'
  fullWidth?: boolean
  className?: string
  ariaLabel?: string
}

const VARIANT_STYLES: Record<NonNullable<PrimaryButtonProps['variant']>, string> = {
  solid:
    'bg-gradient-to-r from-blush-500 to-lavender-500 text-white shadow-lift disabled:shadow-none',
  outline:
    'bg-white/80 text-ink-600 ring-1 ring-inset ring-lavender-200 shadow-softer',
  whatsapp: 'bg-[#25D366] text-white shadow-lift disabled:shadow-none',
  ghost: 'bg-transparent text-ink-500 hover:bg-white/60',
}

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'solid',
  fullWidth = true,
  className = '',
  ariaLabel,
}: PrimaryButtonProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: reduceMotion ? 0.99 : 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 min-h-[52px]
        text-base font-semibold tracking-tight select-none
        transition-opacity
        disabled:opacity-40 disabled:pointer-events-none
        ${fullWidth ? 'w-full' : ''}
        ${VARIANT_STYLES[variant]}
        ${className}`}
    >
      {children}
    </motion.button>
  )
}
