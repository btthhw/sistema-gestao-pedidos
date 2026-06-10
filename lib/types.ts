export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'vendedor'
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  category_id: string | null
  unit: string
  purchase_price: number
  sale_price: number
  stock_quantity: number
  min_stock: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface StockMovement {
  id: string
  product_id: string
  user_id: string
  movement_type: 'entrada' | 'saida' | 'ajuste'
  quantity: number
  previous_stock: number
  new_stock: number
  notes: string | null
  created_at: string
  product?: Product
  profile?: Profile
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  cpf_cnpj: string | null
  address: string | null
  city: string | null
  state: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus = 'orcamento' | 'aprovado' | 'em_producao' | 'entregue' | 'cancelado'

export interface Order {
  id: string
  order_number: number
  customer_id: string | null
  user_id: string
  status: OrderStatus
  total_amount: number
  discount: number
  notes: string | null
  delivery_address: string | null
  delivery_date: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  profile?: Profile
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  orcamento: 'Orçamento',
  aprovado: 'Aprovado',
  em_producao: 'Em Produção',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  orcamento: 'bg-yellow-100 text-yellow-800',
  aprovado: 'bg-blue-100 text-blue-800',
  em_producao: 'bg-orange-100 text-orange-800',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800'
}
