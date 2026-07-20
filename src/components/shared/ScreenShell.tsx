import type { ReactNode } from 'react'

interface ScreenShellProps {
  children: ReactNode
}

/** Contenedor mobile-first común: centra el contenido y respeta el "notch". */
export default function ScreenShell({ children }: ScreenShellProps) {
  return (
    <div className="safe-top safe-bottom flex min-h-svh w-full flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
