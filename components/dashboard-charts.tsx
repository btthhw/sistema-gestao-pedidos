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
  Legend
} from 'recharts'
import { useSalesByCategory, useMonthlySales } from '@/hooks/use-data'

// Dados de exemplo para vendas mensais (fallback)
const fallbackMonthlyData = [
  { month: 'Jan', vendas: 0 },
  { month: 'Fev', vendas: 0 },
  { month: 'Mar', vendas: 0 },
  { month: 'Abr', vendas: 0 },
  { month: 'Mai', vendas: 0 },
  { month: 'Jun', vendas: 0 },
]

export function DashboardCharts() {
  const { salesByCategory } = useSalesByCategory()
  const { monthlySales } = useMonthlySales()

  // Transformar dados para percentual se houver valores
  const categoryDataForChart = salesByCategory.length > 0 
    ? (() => {
        const total = salesByCategory.reduce((sum: number, cat: any) => sum + cat.value, 0)
        return salesByCategory.map((cat: any) => ({
          ...cat,
          displayValue: total > 0 ? Math.round((cat.value / total) * 100) : 0
        }))
      })()
    : [
        { name: 'Granitos', displayValue: 35, value: 0, color: '#57534e' },
        { name: 'Mármores', displayValue: 25, value: 0, color: '#78716c' },
        { name: 'Quartzitos', displayValue: 20, value: 0, color: '#a8a29e' },
        { name: 'Porcelanatos', displayValue: 15, value: 0, color: '#d6d3d1' },
        { name: 'Outros', displayValue: 5, value: 0, color: '#e7e5e4' },
      ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Vendas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales.length > 0 ? monthlySales : fallbackMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="#737373" />
                <YAxis 
                  stroke="#737373" 
                  domain={[0, 300000]}
                  ticks={[0, 75000, 150000, 225000, 300000]}
                  tickFormatter={(value) => 
                    value >= 1000000 ? `R$${value / 1000000}M` : `R$${value / 1000}k`
                  } 
                />
                <Tooltip 
                  formatter={(value: number) => [
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                    'Vendas'
                  ]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                />
                <Bar dataKey="vendas" fill="#57534e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendas por Categoria</CardTitle>
          {salesByCategory.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                salesByCategory.reduce((sum: number, cat: any) => sum + cat.value, 0)
              )}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDataForChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="displayValue"
                >
                  {categoryDataForChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Participação']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
