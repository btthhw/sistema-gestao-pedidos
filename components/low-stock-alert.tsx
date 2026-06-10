import type { Product } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-muted-foreground">Todos os produtos com estoque adequado</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="p-2 rounded-full bg-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              Estoque: {product.stock_quantity} {product.unit} (mín: {product.min_stock})
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
