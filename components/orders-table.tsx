'use client'

import { useState, useCallback, useMemo, memo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, ShoppingCart, Search, CheckCircle, Truck, XCircle, Clock } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type Order, type OrderStatus } from '@/lib/types'
import { useDebounce } from '@/hooks/use-debounce'
import { useOrders } from '@/hooks/use-data'

interface OrderWithRelations extends Omit<Order, 'customer' | 'profile'> {
  customer: { name: string } | null
  profile: { full_name: string } | null
}

interface OrdersTableProps {
  orders: OrderWithRelations[]
}

// Row component memoizado
const OrderRow = memo(function OrderRow({
  order,
  onDelete,
}: {
  order: OrderWithRelations
  onDelete: (id: string) => void
}) {
  const handleDelete = useCallback(() => onDelete(order.id), [order.id, onDelete])

  const statusIcon = {
    orcamento: <Clock className="h-4 w-4" />,
    aprovado: <CheckCircle className="h-4 w-4" />,
    em_producao: <ShoppingCart className="h-4 w-4" />,
    entregue: <Truck className="h-4 w-4" />,
    cancelado: <XCircle className="h-4 w-4" />,
  }

  return (
    <TableRow>
      <TableCell className="font-medium">#{order.order_number}</TableCell>
      <TableCell>{order.customer?.name || 'N/A'}</TableCell>
      <TableCell>R$ {Number(order.total_amount).toFixed(2)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {statusIcon[order.status as OrderStatus]}
          <Badge variant="secondary" className={ORDER_STATUS_COLORS[order.status as OrderStatus]}>
            {ORDER_STATUS_LABELS[order.status as OrderStatus]}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
})

export const OrdersTable = memo(function OrdersTable({ orders }: OrdersTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { mutate } = useOrders()
  const parentRef = useRef<HTMLDivElement>(null)
  
  // Debounce reduzido para feedback instantâneo
  const debouncedSearch = useDebounce(search, 100)

  const filteredOrders = useMemo(() => 
    orders.filter(order => {
      const matchesSearch = 
        order.order_number.toString().includes(debouncedSearch) ||
        order.customer?.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    }),
    [orders, debouncedSearch, statusFilter]
  )

  // Virtualizer - renderiza apenas itens visíveis
  const virtualizer = useVirtualizer({
    count: filteredOrders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  })

  const virtualItems = useMemo(
    () => virtualizer.getVirtualItems(),
    [virtualizer]
  )

  const totalSize = useMemo(
    () => virtualizer.getTotalSize(),
    [virtualizer]
  )

  const paddingTop = useMemo(
    () => (virtualItems.length > 0 ? virtualItems?.[0]?.start || 0 : 0),
    [virtualItems]
  )

  const paddingBottom = useMemo(
    () =>
      virtualItems.length > 0
        ? totalSize - (virtualItems?.[virtualItems.length - 1]?.end || 0)
        : 0,
    [virtualItems, totalSize]
  )

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return
    const supabase = createClient()
    await supabase.from('orders').delete().eq('id', id)
    await mutate()
  }, [mutate])

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">Nenhum pedido cadastrado ainda.</p>
        <p className="text-sm text-muted-foreground">Clique em "Novo Pedido" para começar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div
        ref={parentRef}
        className="overflow-y-auto h-96 border rounded-lg"
      >
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paddingTop > 0 && (
              <TableRow>
                <TableCell colSpan={5} style={{ height: paddingTop }} />
              </TableRow>
            )}
            {virtualItems.map((virtualItem) => {
              const order = filteredOrders[virtualItem.index]
              return (
                <OrderRow
                  key={virtualItem.key}
                  order={order}
                  onDelete={handleDelete}
                />
              )
            })}
            {paddingBottom > 0 && (
              <TableRow>
                <TableCell colSpan={5} style={{ height: paddingBottom }} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})
