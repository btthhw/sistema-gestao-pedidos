'use client'

import { ProductsTable } from '@/components/products-table-simple'
import { AddProductDialog } from '@/components/add-product-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EstoquePage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const supabase = createClient()
        
        // Buscar produtos
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('name')
        
        // Buscar categorias
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name')
        
        const categoryMap = new Map(categoriesData?.map(c => [c.id, c]) || [])
        
        // Enriquecer produtos com categorias
        const enrichedProducts = (productsData || []).map(p => ({
          ...p,
          categories: p.category_id ? categoryMap.get(p.category_id) : null
        }))
        
        setProducts(enrichedProducts)
      } catch (err) {
        console.error('[v0] Erro ao carregar produtos:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProducts()
  }, [])

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
            <ProductsTable products={products || []} categories={[]} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

