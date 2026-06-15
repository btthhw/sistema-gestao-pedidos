'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { Product, Category } from '@/lib/types'

interface EditProductDialogProps {
  product: Product
  categories: Category[]
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const EditProductDialog = memo(function EditProductDialog({ product, categories, open, onClose, onSuccess }: EditProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name || '',
    category_id: product.category_id || '',
    unit: product.unit || 'un',
    purchase_price: product.purchase_price || '',
    sale_price: product.sale_price || '',
    stock_quantity: product.stock_quantity || '',
    min_stock: product.min_stock || '',
  })

  // Atualizar formData quando product mudar
  useEffect(() => {
    if (open) {
      setFormData({
        name: product.name || '',
        category_id: product.category_id || '',
        unit: product.unit || 'un',
        purchase_price: product.purchase_price || '',
        sale_price: product.sale_price || '',
        stock_quantity: product.stock_quantity || '',
        min_stock: product.min_stock || '',
      })
    }
  }, [product, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        category_id: formData.category_id || null,
        unit: formData.unit,
        purchase_price: parseFloat(formData.purchase_price as string) || 0,
        sale_price: parseFloat(formData.sale_price as string) || 0,
        stock_quantity: parseInt(formData.stock_quantity as string) || 0,
        min_stock: parseInt(formData.min_stock as string) || 0,
      })
      .eq('id', product.id)

    setLoading(false)

    if (error) {
      alert(`Erro ao atualizar: ${error.message}`)
      return
    }

    alert('Produto atualizado com sucesso!')
    onSuccess?.()
    onClose()
  }, [formData, product.id, onClose, onSuccess])

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
            <Input 
              id="edit-name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category_id">Categoria</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleSelectChange('category_id', value)}>
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
              <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
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
                value={formData.purchase_price}
                onChange={handleChange}
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
                value={formData.sale_price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stock_quantity">Quantidade em Estoque</Label>
              <Input 
                id="edit-stock_quantity" 
                name="stock_quantity" 
                type="number" 
                min="0"
                value={formData.stock_quantity}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-min_stock">Estoque Mínimo</Label>
              <Input 
                id="edit-min_stock" 
                name="min_stock" 
                type="number" 
                min="0"
                value={formData.min_stock}
                onChange={handleChange}
              />
            </div>
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
