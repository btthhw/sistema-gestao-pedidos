'use client'

import { useState, useCallback, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useProducts } from '@/hooks/use-data'
import type { Product, Category } from '@/lib/types'

interface EditProductDialogProps {
  product: Product
  categories: Category[]
  open: boolean
  onClose: () => void
}

export const EditProductDialog = memo(function EditProductDialog({ product, categories, open, onClose }: EditProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const { mutate } = useProducts()

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    // Fechar imediatamente
    onClose()

    const { error } = await supabase
      .from('products')
      .update({
        name: formData.get('name') as string,
        description: formData.get('description') as string || null,
        category_id: formData.get('category_id') as string || null,
        unit: formData.get('unit') as string,
        purchase_price: parseFloat(formData.get('purchase_price') as string) || 0,
        sale_price: parseFloat(formData.get('sale_price') as string) || 0,
        stock_quantity: parseFloat(formData.get('stock_quantity') as string) || 0,
        min_stock: parseFloat(formData.get('min_stock') as string) || 0,
      })
      .eq('id', product.id)

    if (!error) {
      await mutate()
    }

    setLoading(false)
  }, [product.id, mutate, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Atualize os dados do produto
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Produto *</Label>
            <Input id="edit-name" name="name" defaultValue={product.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea id="edit-description" name="description" defaultValue={product.description || ''} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category_id">Categoria</Label>
              <Select name="category_id" defaultValue={product.category_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unidade *</Label>
              <Select name="unit" defaultValue={product.unit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m²">m²</SelectItem>
                  <SelectItem value="m">m (metro)</SelectItem>
                  <SelectItem value="un">Unidade</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="cx">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-purchase_price">Preço de Compra (R$)</Label>
              <Input 
                id="edit-purchase_price" 
                name="purchase_price" 
                type="number" 
                step="0.01" 
                min="0"
                defaultValue={product.purchase_price}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sale_price">Preço de Venda (R$) *</Label>
              <Input 
                id="edit-sale_price" 
                name="sale_price" 
                type="number" 
                step="0.01" 
                min="0"
                defaultValue={product.sale_price}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-min_stock">Estoque Mínimo</Label>
            <Input 
              id="edit-min_stock" 
              name="min_stock" 
              type="number" 
              step="0.01" 
              min="0"
              defaultValue={product.min_stock}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-stone-800 hover:bg-stone-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})
