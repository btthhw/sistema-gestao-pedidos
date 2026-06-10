'use client'

import { OrdersTable } from '@/components/orders-table'
import { NewOrderButton } from '@/components/new-order-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrders } from '@/hooks/use-data'

export default function PedidosPage() {
  const { orders } = useOrders()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pedidos e Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie seus pedidos e orçamentos</p>
        </div>
        <NewOrderButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>Todos os pedidos e orçamentos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
