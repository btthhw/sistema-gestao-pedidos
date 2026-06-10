'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'
import type { Order, Product } from '@/lib/types'

interface ReportsChartsProps {
  orders: Order[]
  products: (Product & { category: { name: string } | null })[]
}

export function ReportsCharts({ orders, products }: ReportsChartsProps) {
  // Agrupar vendas por mês
  const monthlyData: Record<string, number> = {}
  orders.forEach(order => {
    if (order.status !== 'cancelado' && order.status !== 'orcamento') {
      const month = new Date(order.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      monthlyData[month] = (monthlyData[month] || 0) + Number(order.total_amount)
    }
  })

  const monthlyChartData = Object.entries(monthlyData)
    .slice(-6)
    .map(([month, total]) => ({ month, total }))

  // Agrupar por status
  const statusData: Record<string, number> = {}
  orders.forEach(order => {
    const statusLabels: Record<string, string> = {
      orcamento: 'Orçamento',
      aprovado: 'Aprovado',
      em_producao: 'Em Produção',
      entregue: 'Entregue',
      cancelado: 'Cancelado'
    }
    statusData[statusLabels[order.status] || order.status] = (statusData[statusLabels[order.status] || order.status] || 0) + 1
  })

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({ name, value }))
  const statusColors = ['#eab308', '#3b82f6', '#f97316', '#22c55e', '#ef4444']

  // Produtos mais vendidos por valor em estoque
  const topProducts = [...products]
    .sort((a, b) => (Number(b.stock_quantity) * Number(b.sale_price)) - (Number(a.stock_quantity) * Number(a.sale_price)))
    .slice(0, 5)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      valor: Number(p.stock_quantity) * Number(p.sale_price)
    }))

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="month" stroke="#737373" />
                  <YAxis stroke="#737373" tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value: number) => [
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                      'Total'
                    ]}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#57534e" strokeWidth={2} dot={{ fill: '#57534e' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Pedidos']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Valor em Estoque por Produto (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" stroke="#737373" tickFormatter={formatCurrency} />
                  <YAxis type="category" dataKey="name" stroke="#737373" width={120} />
                  <Tooltip 
                    formatter={(value: number) => [
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                      'Valor'
                    ]}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                  />
                  <Bar dataKey="valor" fill="#57534e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
