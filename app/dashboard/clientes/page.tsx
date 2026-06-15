'use client'

import { AddCustomerDialog } from '@/components/add-customer-dialog'
import { CustomersTable } from '@/components/customers-table'
import { DatabaseInitializer } from '@/components/database-initializer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ClientesPage() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadCustomers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')

      if (error) {
        console.error('[v0] Erro ao carregar clientes:', error)
      } else {
        setCustomers(data || [])
      }
    } catch (err) {
      console.error('[v0] Erro ao carregar clientes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <div className="space-y-6">
      <DatabaseInitializer />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <AddCustomerDialog onCustomerAdded={loadCustomers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
          <CardDescription>Lista de todos os clientes ({customers?.length || 0})</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : (
            <CustomersTable customers={customers} onCustomerDeleted={loadCustomers} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
