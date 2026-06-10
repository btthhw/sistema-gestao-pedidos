'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
              "h-9 w-9 rounded-lg transition-all duration-200",
              "hover:bg-stone-200 dark:hover:bg-stone-700",
              "focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            )}
            aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            <Sun className={cn(
              "h-4 w-4 transition-all duration-300",
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            )} />
            <Moon className={cn(
              "absolute h-4 w-4 transition-all duration-300",
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )} />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{isDark ? 'Modo claro' : 'Modo escuro'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Versão Switch estilo iPhone
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-6 w-11 rounded-full bg-stone-200 dark:bg-stone-700" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            role="switch"
            aria-checked={isDark}
            aria-label="Alternar tema"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2",
              isDark ? "bg-stone-600" : "bg-stone-300"
            )}
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300",
                isDark ? "translate-x-5" : "translate-x-0.5"
              )}
            >
              {isDark ? (
                <Moon className="h-3 w-3 text-stone-600" />
              ) : (
                <Sun className="h-3 w-3 text-amber-500" />
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{isDark ? 'Modo claro' : 'Modo escuro'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
