'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface Order {
  id: string
  customer_name: string
  total: number
  status: string
  created_at: string
  items_count: number
}

export default function PedidosPendentesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadOrders = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data as Order[])
      }
    } catch (err) {
      console.error('[v0] Erro ao carregar pedidos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleFinalize = async (orderId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'finalizado',
          finalized_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (!error) {
        alert('Pedido finalizado com sucesso!')
        loadOrders()
      } else {
        alert(`Erro ao finalizar: ${error.message}`)
      }
    } catch (err) {
      console.error('[v0] Erro ao finalizar pedido:', err)
      alert('Erro ao finalizar pedido')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pedidos Pendentes</h1>
        <p className="text-muted-foreground">Gerencie seus pedidos pendentes</p>
      </div>

      <Card className="bg-slate-950 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Pedidos Pendentes ({orders.length})</CardTitle>
          <CardDescription className="text-slate-400">Clique em "Finalizar" para marcar como concluído</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 bg-slate-800 rounded animate-pulse" />
              <div className="h-64 bg-slate-800 rounded animate-pulse" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhum pedido pendente
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 transition-all hover:border-slate-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-lg text-white">{order.customer_name}</h3>
                      <Badge className="bg-slate-700 text-slate-300">
                        {order.items_count || 0} itens
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                      <p>Total: <span className="text-emerald-400 font-semibold">R$ {(order.total_amount || 0).toFixed(2)}</span></p>
                      <p>Data: {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleFinalize(order.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
