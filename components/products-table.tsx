'use client'

import { useState, useCallback, useMemo, memo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Package, Search } from 'lucide-react'
import { EditProductDialog } from '@/components/edit-product-dialog'
import { StockMovementDialog } from '@/components/stock-movement-dialog'
import { useDebounce } from '@/hooks/use-debounce'
import { useProducts } from '@/hooks/use-data'
import type { Product, Category } from '@/lib/types'

interface ProductsTableProps {
  products: (Product & { category: { id: string; name: string } | null })[]
  categories: Category[]
}

// Row component memoizado - renderiza apenas quando product muda
const ProductRow = memo(function ProductRow({
  product,
  onEdit,
  onMovement,
}: {
  product: Product & { category: { id: string; name: string } | null }
  onEdit: (p: Product) => void
  onMovement: (p: Product) => void
}) {
  const handleEdit = useCallback(() => onEdit(product), [product, onEdit])
  const handleMovement = useCallback(() => onMovement(product), [product, onMovement])

  return (
    <TableRow>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{product.category?.name || '-'}</TableCell>
      <TableCell className="text-right">
        R$ {Number(product.sale_price).toFixed(2)}
      </TableCell>
      <TableCell className="text-right">{product.stock_quantity}</TableCell>
      <TableCell>
        {product.stock_quantity <= product.min_stock ? (
          <Badge variant="destructive">Baixo</Badge>
        ) : (
          <Badge variant="secondary">Normal</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMovement}>
              <Package className="mr-2 h-4 w-4" />
              Movimentar Estoque
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
})

export const ProductsTable = memo(function ProductsTable({ products, categories }: ProductsTableProps) {
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [movementProduct, setMovementProduct] = useState<Product | null>(null)
  const { mutate } = useProducts()
  const parentRef = useRef<HTMLDivElement>(null)
  
  // Debounce reduzido para feedback instantâneo
  const debouncedSearch = useDebounce(search, 100)

  // Filtrar produtos
  const filteredProducts = useMemo(() => 
    products.filter(product =>
      product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [products, debouncedSearch]
  )

  // Virtualizer - renderiza apenas itens visíveis
  const virtualizer = useVirtualizer({
    count: filteredProducts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  })

  const virtualItems = useMemo(
    () => virtualizer.getVirtualItems(),
    [virtualizer]
  )

  const totalSize = useMemo(
    () => virtualizer.getTotalSize(),
    [virtualizer]
  )

  const paddingTop = useMemo(
    () => (virtualItems.length > 0 ? virtualItems?.[0]?.start || 0 : 0),
    [virtualItems]
  )

  const paddingBottom = useMemo(
    () =>
      virtualItems.length > 0
        ? totalSize - (virtualItems?.[virtualItems.length - 1]?.end || 0)
        : 0,
    [virtualItems, totalSize]
  )

  // Handlers memoizados
  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product)
  }, [])

  const handleMovement = useCallback((product: Product) => {
    setMovementProduct(product)
  }, [])

  const handleEditClose = useCallback(() => {
    setEditingProduct(null)
    mutate()
  }, [mutate])

  const handleMovementClose = useCallback(() => {
    setMovementProduct(null)
    mutate()
  }, [mutate])

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div
          ref={parentRef}
          className="overflow-y-auto h-96 border rounded-lg"
        >
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell colSpan={6} style={{ height: paddingTop }} />
                </TableRow>
              )}
              {virtualItems.map((virtualItem) => {
                const product = filteredProducts[virtualItem.index]
                return (
                  <ProductRow
                    key={virtualItem.key}
                    product={product}
                    onEdit={handleEdit}
                    onMovement={handleMovement}
                  />
                )
              })}
              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell colSpan={6} style={{ height: paddingBottom }} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          categories={categories}
          open={true}
          onClose={handleEditClose}
        />
      )}

      {movementProduct && (
        <StockMovementDialog
          product={movementProduct}
          open={true}
          onClose={handleMovementClose}
        />
      )}
    </>
  )
})
