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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { useCategories, useProducts } from '@/hooks/use-data'
import type { Category } from '@/lib/types'

export const AddProductDialog = memo(function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { categories } = useCategories()
  const { mutate } = useProducts()

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const newProduct = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category_id: formData.get('category_id') as string || null,
      unit: formData.get('unit') as string,
      purchase_price: parseFloat(formData.get('purchase_price') as string) || 0,
      sale_price: parseFloat(formData.get('sale_price') as string) || 0,
      stock_quantity: parseFloat(formData.get('stock_quantity') as string) || 0,
      min_stock: parseFloat(formData.get('min_stock') as string) || 0,
    }

    // Fechar diálogo imediatamente (otimistic close)
    setOpen(false)

    const { error } = await supabase.from('products').insert(newProduct)

    if (!error) {
      // Revalidar cache do SWR localmente (instantâneo)
      await mutate()
    }

    setLoading(false)
  }, [mutate])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-stone-800 hover:bg-stone-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo produto
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <Select name="category_id">
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
              <Label htmlFor="unit">Unidade *</Label>
              <Select name="unit" defaultValue="m²">
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
              <Label htmlFor="purchase_price">Preço de Compra (R$)</Label>
              <Input 
                id="purchase_price" 
                name="purchase_price" 
                type="number" 
                step="0.01" 
                min="0"
                defaultValue="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Preço de Venda (R$) *</Label>
              <Input 
                id="sale_price" 
                name="sale_price" 
                type="number" 
                step="0.01" 
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
              <Input 
                id="stock_quantity" 
                name="stock_quantity" 
                type="number" 
                step="0.01" 
                min="0"
                defaultValue="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">Estoque Mínimo</Label>
              <Input 
                id="min_stock" 
                name="min_stock" 
                type="number" 
                step="0.01" 
                min="0"
                defaultValue="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-stone-800 hover:bg-stone-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Produto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})
