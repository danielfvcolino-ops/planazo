import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-[2rem] bg-white/85 backdrop-blur-sm shadow-soft ring-1 ring-white/60 p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  )
}
