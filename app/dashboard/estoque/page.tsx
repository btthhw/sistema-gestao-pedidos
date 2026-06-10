'use client'

import { ProductsTable } from '@/components/products-table-simple'
import { AddProductDialog } from '@/components/add-product-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts, useCategories } from '@/hooks/use-data'
import { useEffect, useState } from 'react'

export default function EstoquePage() {
  const { products } = useProducts()
  const { categories } = useCategories()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false)
    } else if (products !== undefined) {
      // Se products é undefined ou vazio após carregamento
      const timer = setTimeout(() => setIsLoading(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [products])

  console.log('[v0] EstoquePage - products:', products?.length, 'categories:', categories?.length)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
          <p className="text-muted-foreground">Gerencie seus produtos e estoque</p>
        </div>
        <AddProductDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
          <CardDescription>Lista de todos os produtos em estoque ({products?.length || 0})</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : (
            <ProductsTable products={products || []} categories={categories || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

