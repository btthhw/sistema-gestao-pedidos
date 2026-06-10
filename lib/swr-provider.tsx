'use client'

import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 60000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
