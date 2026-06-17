'use client'

import { useState, useCallback, useMemo } from 'react'
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
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { useCustomers, useProducts, useOrders } from '@/hooks/use-data'

interface OrderItem {
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
}

export function NewOrderButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [discountPercent, setDiscountPercent] = useState<string>('0')

  const { customers } = useCustomers()
  const { products } = useProducts()
  const { mutate: mutateOrders } = useOrders()

  const subtotal = useMemo(() => 
    items.reduce((sum, item) => sum + item.total_price, 0),
    [items]
  )

  // Calcula o desconto em reais baseado na porcentagem
  const discountAmount = useMemo(() => {
    const percent = parseFloat(discountPercent) || 0
    return (subtotal * percent) / 100
  }, [subtotal, discountPercent])

  // Total final depois do desconto
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount])

  // Memoizar todos os handlers para evitar re-renders de children
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  const addItem = useCallback(() => {
    const product = products.find(p => p.id === selectedProduct)
    if (!product || !quantity) return

    const qty = parseFloat(quantity)
    const newItem: OrderItem = {
      product_id: product.id,
      quantity: qty,
      unit_price: Number(product.sale_price),
      total_price: qty * Number(product.sale_price)
    }

    setItems(prev => [...prev, newItem])
    setSelectedProduct('')
    setQuantity('')
  }, [selectedProduct, quantity, products])

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('[v0] Iniciando criação de pedido. Itens:', items.length)
    
    if (items.length === 0) {
      console.log('[v0] Nenhum item no pedido. Cancelando.')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('[v0] Usuário não autenticado')
      setLoading(false)
      return
    }

    console.log('[v0] Usuário:', user.id)

    const discount = parseFloat(formData.get('discount') as string) || 0

    // Criar pedido
    console.log('[v0] Criando pedido com total:', total, 'desconto:', discountAmount)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: formData.get('customer_id') as string || null,
        user_id: user.id,
        status: 'orcamento',
        total_amount: total,
        discount: discountAmount,
        notes: formData.get('notes') as string || null,
        delivery_address: formData.get('delivery_address') as string || null,
        delivery_date: formData.get('delivery_date') as string || null,
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('[v0] Erro ao criar pedido:', orderError.message)
      setLoading(false)
      alert('Erro ao criar pedido: ' + orderError.message)
      return
    }

    if (!order) {
      console.log('[v0] Nenhum pedido retornado')
      setLoading(false)
      alert('Erro ao criar pedido')
      return
    }

    console.log('[v0] Pedido criado com ID:', order.id)

    // Inserir itens do pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }))

    console.log('[v0] Inserindo', orderItems.length, 'itens')
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    
    if (itemsError) {
      console.error('[v0] Erro ao inserir itens:', itemsError.message)
      setLoading(false)
      alert('Erro ao adicionar itens: ' + itemsError.message)
      return
    }

    console.log('[v0] Itens inseridos com sucesso')
    
    // Revalidar cache do SWR (instantâneo, sem router.refresh)
    await mutateOrders()

    setLoading(false)
    setItems([])
    setDiscountPercent('0')
    setOpen(false)
    
    console.log('[v0] Pedido criado com sucesso!')
    alert('Pedido criado com sucesso!')
  }, [items, total, discountAmount, mutateOrders])

  const formatCurrency = useCallback((value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
    []
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-stone-800 hover:bg-stone-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full w-screen h-screen max-h-screen overflow-hidden p-4 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Novo Pedido/Orçamento</DialogTitle>
          <DialogDescription>
            Adicione os produtos e informações do pedido
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto pr-2">
            <div className="space-y-3">
              {/* Cliente e Desconto em uma linha */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Cliente</Label>
                  <Select name="customer_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input 
                    id="discount" 
                    name="discount" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Produtos - Catálogo */}
              <div className="space-y-2">
                <Label>Produtos - Catálogo</Label>
                <div className="flex gap-2">
                  <select 
                    value={selectedProduct} 
                    onChange={(e) => {
                      console.log('[v0] Produto selecionado:', e.target.value)
                      setSelectedProduct(e.target.value)
                    }}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(Number(product.sale_price))}/{product.unit}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Qtd"
                    className="w-24"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={addItem} className="px-4">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Lista de Itens - Compacta */}
              {items.length > 0 && (
                <div className="border rounded-lg bg-muted/50 max-h-32 overflow-y-auto">
                  <div className="divide-y text-sm">
                    {items.map((item, index) => {
                      const product = products.find(p => p.id === item.product_id)
                      return (
                        <div key={index} className="flex items-center justify-between p-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">{product?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {product?.unit} x {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-medium text-xs">{formatCurrency(item.total_price)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 h-6 w-6 p-0"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex items-center justify-between p-2 bg-muted font-bold text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Totais - em grid compacto */}
              <div className="grid grid-cols-2 gap-4 bg-stone-800/10 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Desconto</p>
                  <p className="font-bold text-red-600">-{formatCurrency(discountAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Final</p>
                  <p className="font-bold text-lg text-stone-800">{formatCurrency(total)}</p>
                </div>
              </div>

              {/* Data e Endereço */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_date" className="text-sm">Data Entrega</Label>
                  <Input id="delivery_date" name="delivery_date" type="date" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_address" className="text-sm">Endereço</Label>
                  <Input id="delivery_address" name="delivery_address" className="text-sm" />
                </div>
              </div>

              {/* Observações - Compacto */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Observações</Label>
                <Textarea id="notes" name="notes" rows={1} className="text-sm" />
              </div>
            </div>
          </div>

          {/* Botões - fixo na base */}
          <div className="flex justify-end gap-2 pt-3 flex-shrink-0 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => { setOpen(false); setItems([]) }}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="bg-stone-800 hover:bg-stone-700" 
              disabled={loading || items.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Criar Pedido'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
