'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { preloadDashboardData } from '@/hooks/use-data'

const ROUTES = [
  '/dashboard',
  '/dashboard/estoque',
  '/dashboard/pedidos',
  '/dashboard/clientes',
  '/dashboard/relatorios',
]

/**
 * Aquece o cache assim que o dashboard abre:
 * - Busca os dados do Supabase de todas as páginas (SWR preload)
 * - Faz o prefetch dos bundles de todas as rotas (Next router)
 * Resultado: navegar pela sidebar é instantâneo.
 */
export function DataPrefetcher() {
  const router = useRouter()
  const hasPreloadedRef = useRef(false)

  useEffect(() => {
    // Garante que o preload só é executado uma única vez
    if (hasPreloadedRef.current) return
    hasPreloadedRef.current = true

    // Dispara o preload de dados e prefetch de rotas em paralelo
    preloadDashboardData()
    ROUTES.forEach((route) => {
      // Agenda o prefetch para não bloquear o render
      requestIdleCallback(() => router.prefetch(route))
    })
  }, []) // Dependência vazia - executa apenas na montagem

  return null
}
