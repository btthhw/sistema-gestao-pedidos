'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useProducts, useCustomers, useOrders, useMonthlyRevenue } from '@/hooks/use-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo, memo } from 'react'

// Lazy load dos componentes pesados
const DashboardCharts = dynamic(() => import('@/components/dashboard-charts').then(mod => ({ default: mod.DashboardCharts })), {
  loading: () => <Skeleton className="w-full h-80" />,
  ssr: false
})

const RecentOrders = dynamic(() => import('@/components/recent-orders').then(mod => ({ default: mod.RecentOrders })), {
  loading: () => <Skeleton className="w-full h-48" />,
  ssr: false
})

const LowStockAlert = dynamic(() => import('@/components/low-stock-alert').then(mod => ({ default: mod.LowStockAlert })), {
  loading: () => <Skeleton className="w-full h-48" />,
  ssr: false
})

// Stat card memoizado para evitar re-renders
const StatCard = memo(function StatCard({ title, value, description, icon: Icon, color }: {
  title: string
  value: string | number
  description: string
  icon: typeof Package
  color: string
}) {
  return (
    <Card className="transition-shadow duration-100 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
})

export default function DashboardPage() {
  const { products } = useProducts()
  const { customers } = useCustomers()
  const { orders } = useOrders()
  const { monthlyRevenue } = useMonthlyRevenue()

  // Calcular dados derivados com useMemo para evitar recalculos
  const lowStockProducts = useMemo(() => 
    products.filter((p: any) => p.stock_quantity <= p.min_stock),
    [products]
  )

  // Renda mensal (apenas do mês atual)
  const formattedMonthlyTotal = useMemo(() => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue),
    [monthlyRevenue]
  )

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Vendas do Mês - Destaque */}
      <Card className="bg-stone-800 text-white border-stone-700">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-stone-700">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-300">Renda Mensal</p>
              <p className="text-xs text-stone-400">Total de vendas aprovadas no período</p>
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight">{formattedMonthlyTotal}</div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Produtos"
          value={products.length}
          description="Total de produtos cadastrados"
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Clientes"
          value={customers.length}
          description="Clientes cadastrados"
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Estoque Baixo"
          value={lowStockProducts.length}
          description="Produtos com estoque baixo"
          icon={AlertTriangle}
          color="bg-amber-500"
        />
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos 5 pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={recentOrders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerta de Estoque</CardTitle>
            <CardDescription>Produtos com estoque abaixo do mínimo</CardDescription>
          </CardHeader>
          <CardContent>
            <LowStockAlert products={lowStockProducts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
