'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Order {
  id: string
  customer_name: string
  total: number
  status: string
  created_at: string
  finalized_at?: string
  items_count: number
}

export default function PedidosFinalizadosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadOrders = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'finalizado')
        .order('finalized_at', { ascending: false, nullsLast: true })

      if (!error && data) {
        setOrders(data as Order[])
      }
    } catch (err) {
      console.error('[v0] Erro ao carregar pedidos finalizados:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  // Calcular renda mensal (apenas do mês atual)
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const monthlyRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= firstDay && orderDate <= lastDay
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0)
  
  const currentMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    return orderDate >= firstDay && orderDate <= lastDay
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Histórico de Pedidos Finalizados</h1>
        <p className="text-muted-foreground">Visualize todos os pedidos finalizados</p>
      </div>

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Renda Mensal - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</CardTitle>
          <CardDescription className="text-slate-400">Total de pedidos finalizados neste mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-emerald-400">
            R$ {monthlyRevenue.toFixed(2)}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {currentMonthOrders.length} pedido{currentMonthOrders.length !== 1 ? 's' : ''} finalizado{currentMonthOrders.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-950 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Pedidos Finalizados - Este Mês ({currentMonthOrders.length})</CardTitle>
          <CardDescription className="text-slate-400">Pedidos concluídos neste período</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 bg-slate-800 rounded animate-pulse" />
              <div className="h-64 bg-slate-800 rounded animate-pulse" />
            </div>
          ) : currentMonthOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhum pedido finalizado neste mês
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[70vh]">
              {currentMonthOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border border-slate-700 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 transition-all hover:border-slate-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-medium text-lg text-white">{order.customer_name}</h3>
                        <Badge className="bg-emerald-600 text-white">Finalizado</Badge>
                        <Badge className="bg-slate-700 text-slate-300">
                          {order.items_count || 0} itens
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p>Total: <span className="font-semibold text-emerald-400">R$ {(order.total_amount || 0).toFixed(2)}</span></p>
                        <p>Criado em: {new Date(order.created_at).toLocaleDateString('pt-BR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        {order.finalized_at && (
                          <p>Finalizado em: {new Date(order.finalized_at).toLocaleDateString('pt-BR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
