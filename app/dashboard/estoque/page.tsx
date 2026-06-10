'use client'

import { ProductsTable } from '@/components/products-table'
import { AddProductDialog } from '@/components/add-product-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts, useCategories } from '@/hooks/use-data'

export default function EstoquePage() {
  const { products } = useProducts()
  const { categories } = useCategories()

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
          <CardDescription>Lista de todos os produtos em estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsTable products={products} categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
