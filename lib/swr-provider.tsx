'use client'

import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 5000, // Reduzido de 60000 para 5 segundos
        focusThrottleInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
