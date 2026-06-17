'use client'

import useSWR, { preload } from 'swr'
import { createClient } from '@/lib/supabase/client'

const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 600000, // 10 minutos - evita requisições duplicadas por mais tempo
  focusThrottleInterval: 1000000,
  errorRetryCount: 0,
  keepPreviousData: true,
}

// Keys centralizadas para permitir preload e dedupe global
export const SWR_KEYS = {
  products: 'products-with-category',
  categories: 'categories-list',
  customers: 'customers-list',
  orders: 'orders-with-relations',
  stockMovements: 'stock-movements-list',
  salesByCategory: 'sales-by-category',
  monthlyRevenue: 'monthly-revenue-current',
  monthlySales: 'monthly-sales-all-months',
} as const

// Fetchers nomeados (reutilizados no preload e nos hooks)
const fetchers = {
  [SWR_KEYS.products]: async () => {
    try {
      const supabase = createClient()
      
      // Buscar todos os produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (productsError || !productsData) {
        console.error('[v0] Erro ao buscar produtos:', productsError?.message)
        return []
      }
      
      console.log('[v0] Produtos carregados:', productsData.length)
      
      // Buscar todas as categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
      
      const categoryMap = new Map(categoriesData?.map(c => [c.id, c]) || [])
      
      // Enriquecer produtos com categorias
      const enrichedProducts = productsData.map(p => ({
        ...p,
        categories: p.category_id ? categoryMap.get(p.category_id) : null
      }))
      
      return enrichedProducts
    } catch (err) {
      console.error('[v0] Erro em useProducts:', err)
      return []
    }
  },
  [SWR_KEYS.categories]: async () => {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    return data || []
  },
  [SWR_KEYS.customers]: async () => {
    const supabase = createClient()
    const { data } = await supabase.from('customers').select('*').order('name')
    return data || []
  },
  [SWR_KEYS.orders]: async () => {
    const supabase = createClient()
    console.log('[v0] Fetching orders...')
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[v0] Erro ao buscar pedidos:', error.message)
      return []
    }
    
    console.log('[v0] Pedidos carregados:', data?.length || 0, data)
    
    // Buscar clientes e usuários separadamente para evitar erro na junção
    if (!data || data.length === 0) return []
    
    const customerIds = [...new Set(data.map((o: any) => o.customer_id).filter(Boolean))]
    const userIds = [...new Set(data.map((o: any) => o.user_id).filter(Boolean))]
    
    let customers: any[] = []
    let users: any[] = []
    
    if (customerIds.length > 0) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('id, name')
        .in('id', customerIds)
      customers = customerData || []
    }
    
    if (userIds.length > 0) {
      const { data: userData } = await supabase
        .from('auth.users')
        .select('id, user_metadata')
        .in('id', userIds)
      users = userData || []
    }
    
    // Mapear os dados
    const customerMap = new Map(customers.map((c: any) => [c.id, c]))
    const userMap = new Map(users.map((u: any) => [u.id, { full_name: u.user_metadata?.full_name || u.email }]))
    
    const enrichedData = data.map((order: any) => ({
      ...order,
      customer: order.customer_id ? customerMap.get(order.customer_id) : null,
      profile: order.user_id ? userMap.get(order.user_id) : null
    }))
    
    return enrichedData
  },
  [SWR_KEYS.stockMovements]: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('stock_movements')
      .select('*, product:product_id(name), user:user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(50)
    return data || []
  },
  [SWR_KEYS.salesByCategory]: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('order_items')
      .select('quantity, unit_price, product:product_id(id, name, category:category_id(id, name))')
      .order('created_at', { ascending: false })
    
    if (!data) return []

    // Agrupar por categoria e calcular totais
    const grouped: Record<string, { name: string; value: number; color: string }> = {}
    const colors = ['#57534e', '#78716c', '#a8a29e', '#d6d3d1', '#e7e5e4']
    let colorIndex = 0

    data.forEach((item: any) => {
      const categoryName = item.product?.category?.name || 'Sem Categoria'
      
      if (!grouped[categoryName]) {
        grouped[categoryName] = {
          name: categoryName,
          value: 0,
          color: colors[colorIndex % colors.length]
        }
        colorIndex++
      }
      
      // Calcular o total: quantidade × preço unitário
      const total = (item.quantity || 0) * (item.unit_price || 0)
      grouped[categoryName].value += total
    })

    return Object.values(grouped)
  },
  [SWR_KEYS.monthlyRevenue]: async () => {
    const supabase = createClient()
    
    // Pegar primeiro e último dia do mês atual
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Buscar pedidos finalizados do mês atual e somar total_amount
    const { data } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'finalizado')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString())
    
    if (!data) return 0
    
    // Calcular total do mês
    const total = data.reduce((sum: number, order: any) => {
      return sum + (order.total_amount || 0)
    }, 0)
    
    return total
  },
  [SWR_KEYS.monthlySales]: async () => {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('order_items')
      .select('quantity, unit_price, order:order_id(created_at)')
      .order('order.created_at', { ascending: true })
    
    if (!data) return []
    
    // Agrupar por mês
    const grouped: Record<string, number> = {}
    
    data.forEach((item: any) => {
      if (!item.order?.created_at) return
      
      const date = new Date(item.order.created_at)
      const monthKey = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = 0
      }
      
      grouped[monthKey] += (item.quantity || 0) * (item.unit_price || 0)
    })
    
    // Converter para array com os últimos 6 meses
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    const result = monthsNames.map(month => ({
      month,
      vendas: grouped[month] || 0
    }))
    
    return result
  },
}

// Dispara o fetch de todos os dados e popula o cache do SWR.
// Chamado uma vez quando o dashboard abre, deixando todas as
// páginas prontas instantaneamente ao navegar.
export function preloadDashboardData() {
  Object.entries(fetchers).forEach(([key, fetcher]) => {
    preload(key, fetcher)
  })
}

export const useProducts = () => {
  const { data, mutate } = useSWR(SWR_KEYS.products, fetchers[SWR_KEYS.products], swrConfig)
  return { products: data || [], mutate }
}

export const useCategories = () => {
  const { data, mutate } = useSWR(SWR_KEYS.categories, fetchers[SWR_KEYS.categories], swrConfig)
  return { categories: data || [], mutate }
}

export const useCustomers = () => {
  const { data, mutate } = useSWR(SWR_KEYS.customers, fetchers[SWR_KEYS.customers], swrConfig)
  return { customers: data || [], mutate }
}

export const useOrders = () => {
  const { data, mutate } = useSWR(SWR_KEYS.orders, fetchers[SWR_KEYS.orders], swrConfig)
  return { orders: data || [], mutate }
}

export const useStockMovements = () => {
  const { data, mutate } = useSWR(SWR_KEYS.stockMovements, fetchers[SWR_KEYS.stockMovements], swrConfig)
  return { movements: data || [], mutate }
}

export const useSalesByCategory = () => {
  const { data, mutate } = useSWR(SWR_KEYS.salesByCategory, fetchers[SWR_KEYS.salesByCategory], swrConfig)
  return { salesByCategory: data || [], mutate }
}

export const useMonthlyRevenue = () => {
  const { data, mutate } = useSWR(SWR_KEYS.monthlyRevenue, fetchers[SWR_KEYS.monthlyRevenue], swrConfig)
  return { monthlyRevenue: data || 0, mutate }
}

export const useMonthlySales = () => {
  const { data, mutate } = useSWR(SWR_KEYS.monthlySales, fetchers[SWR_KEYS.monthlySales], swrConfig)
  return { monthlySales: data || [], mutate }
}
