'use client'

import { usePathname } from 'next/navigation'

/**
 * Anima a entrada do conteúdo a cada mudança de rota.
 * A key={pathname} força o React a remontar o wrapper na
 * navegação, disparando a animação de fade + slide.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  )
}
