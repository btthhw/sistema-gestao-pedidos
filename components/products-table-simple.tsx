'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Package } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditProductDialog } from '@/components/edit-product-dialog'
import type { Product, Category } from '@/lib/types'

interface ProductsTableProps {
  products: (Product & { categories?: { id: string; name: string } | null })[]
  categories: Category[]
  onProductUpdated?: () => void
}

export function ProductsTable({ products = [], categories = [], onProductUpdated }: ProductsTableProps) {
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<(Product & { categories?: { id: string; name: string } | null }) | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.categories?.name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  const handleEditClick = useCallback((product: Product & { categories?: { id: string; name: string } | null }) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }, [])

  const handleEditClose = useCallback(() => {
    setIsEditDialogOpen(false)
    setEditingProduct(null)
  }, [])

  const handleEditSuccess = useCallback(() => {
    handleEditClose()
    onProductUpdated?.()
  }, [handleEditClose, onProductUpdated])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ height: '70vh' }} id="products-table-scroll">
        <div className="overflow-x-auto overflow-y-auto h-full">
          <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium">Produto</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Categoria</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Preço</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Estoque</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const stockStatus =
                  product.stock_quantity === 0 ? 'Sem Estoque' :
                  product.stock_quantity <= (product.min_stock || 10) ? 'Baixo Estoque' :
                  'Em Estoque'

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm">{product.categories?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      R$ {(product.sale_price || product.price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{product.stock_quantity || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant={
                          stockStatus === 'Sem Estoque' ? 'destructive' :
                          stockStatus === 'Baixo Estoque' ? 'outline' :
                          'secondary'
                        }
                      >
                        {stockStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="mr-2 h-4 w-4" />
                            Movimentar Estoque
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Nenhum produto encontrado
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          categories={categories}
          open={isEditDialogOpen}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
