import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type Order } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface RecentOrdersProps {
  orders: (Order & { customer: { name: string } | null })[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum pedido encontrado
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Pedido #{order.order_number}</p>
            <p className="text-sm text-muted-foreground">{order.customer?.name || 'Sem cliente'}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total_amount))}
            </p>
            <Badge className={ORDER_STATUS_COLORS[order.status]} variant="secondary">
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
