'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function InitializeOrdersTable() {
  useEffect(() => {
    const initializeTable = async () => {
      try {
        const supabase = createClient()
        
        // Tenta fazer uma query simples para verificar se a tabela existe
        const { data, error } = await supabase
          .from('orders')
          .select('count', { count: 'exact' })
          .limit(1)

        if (error && error.message.includes('doesn\'t exist')) {
          console.log('[v0] Creating orders table...')
          
          // Tenta criar a tabela via RPC se disponível
          await supabase.rpc('create_orders_table').then(() => {
            console.log('[v0] Orders table created')
          }).catch((err) => {
            // Se RPC não existir, a tabela pode ser criada manualmente via Supabase dashboard
            console.log('[v0] RPC não disponível, crie a tabela manualmente no Supabase dashboard')
          })
        } else if (!error) {
          console.log('[v0] Orders table exists')
        }
      } catch (err) {
        console.error('[v0] Error initializing orders table:', err)
      }
    }

    initializeTable()
  }, [])

  return null
}
