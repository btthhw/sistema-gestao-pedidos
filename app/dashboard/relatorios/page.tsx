import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportsCharts } from '@/components/reports-charts'
import type { Profile } from '@/lib/types'

export default async function RelatoriosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Verificar se é admin
  if ((profile as Profile)?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Buscar dados para relatórios
  const [
    { data: orders },
    { data: products },
    { data: stockMovements }
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase.from('products').select('*, category:categories(name)'),
    supabase
      .from('stock_movements')
      .select('*, product:products(name), profile:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(20)
  ])

  // Calcular estatísticas
  const totalVendas = orders?.filter(o => o.status !== 'cancelado' && o.status !== 'orcamento')
    .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

  const totalOrcamentos = orders?.filter(o => o.status === 'orcamento').length || 0
  const totalPedidos = orders?.filter(o => o.status !== 'cancelado' && o.status !== 'orcamento').length || 0

  const valorEstoque = products?.reduce((sum, p) => 
    sum + (Number(p.stock_quantity) * Number(p.sale_price)), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Análises e estatísticas do negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVendas)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Fechados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPedidos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orçamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrcamentos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorEstoque)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ReportsCharts orders={orders || []} products={products || []} />

      {/* Stock Movements History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>Últimas 20 movimentações de estoque</CardDescription>
        </CardHeader>
        <CardContent>
          {stockMovements && stockMovements.length > 0 ? (
            <div className="space-y-3">
              {stockMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{movement.product?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.profile?.full_name} - {new Date(movement.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${
                      movement.movement_type === 'entrada' ? 'text-green-600' :
                      movement.movement_type === 'saida' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {movement.movement_type === 'entrada' ? '+' : 
                       movement.movement_type === 'saida' ? '-' : '='} {movement.quantity}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {movement.previous_stock} → {movement.new_stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação registrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
