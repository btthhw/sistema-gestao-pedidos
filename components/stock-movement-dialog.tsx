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
import { useProducts, useStockMovements } from '@/hooks/use-data'
import type { Product } from '@/lib/types'

interface StockMovementDialogProps {
  product: Product
  open: boolean
  onClose: () => void
}

export const StockMovementDialog = memo(function StockMovementDialog({ product, open, onClose }: StockMovementDialogProps) {
  const [loading, setLoading] = useState(false)
  const [movementType, setMovementType] = useState<'entrada' | 'saida' | 'ajuste'>('entrada')
  const { mutate: mutateProducts } = useProducts()
  const { mutate: mutateMovements } = useStockMovements()

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const quantity = parseFloat(formData.get('quantity') as string) || 0
    if (quantity === 0) {
      setLoading(false)
      return
    }

    // Fechar imediatamente
    onClose()

    const previousStock = Number(product.stock_quantity)
    const newStock = movementType === 'saida' 
      ? previousStock - quantity
      : previousStock + quantity

    // Atualizar estoque do produto
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', product.id)

    if (!updateError) {
      // Criar registro de movimentação
      await supabase.from('stock_movements').insert({
        product_id: product.id,
        user_id: user.id,
        movement_type: movementType,
        quantity: movementType === 'saida' ? -quantity : quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        notes: formData.get('notes') as string || null,
      })

      // Revalidar caches do SWR (instantâneo)
      await mutateProducts()
      await mutateMovements()
    }

    setLoading(false)
  }, [product.id, product.stock_quantity, movementType, mutateProducts, mutateMovements, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentar Estoque</DialogTitle>
          <DialogDescription>
            {product.name} - Estoque atual: {product.stock_quantity} {product.unit}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Movimentação</Label>
            <Select 
              value={movementType} 
              onValueChange={(value) => setMovementType(value as 'entrada' | 'saida' | 'ajuste')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada (adicionar)</SelectItem>
                <SelectItem value="saida">Saída (remover)</SelectItem>
                <SelectItem value="ajuste">Ajuste (definir valor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {movementType === 'ajuste' ? 'Novo Estoque' : 'Quantidade'} ({product.unit}) *
            </Label>
            <Input 
              id="quantity" 
              name="quantity" 
              type="number" 
              step="0.01" 
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" rows={2} placeholder="Motivo da movimentação..." />
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
                'Confirmar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})
