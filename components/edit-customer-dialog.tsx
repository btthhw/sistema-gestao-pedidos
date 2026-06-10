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
import { Loader2 } from 'lucide-react'
import { useCustomers } from '@/hooks/use-data'
import type { Customer } from '@/lib/types'

interface EditCustomerDialogProps {
  customer: Customer
  open: boolean
  onClose: () => void
}

export const EditCustomerDialog = memo(function EditCustomerDialog({ customer, open, onClose }: EditCustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const { mutate } = useCustomers()

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    // Fechar imediatamente
    onClose()

    const { error } = await supabase
      .from('customers')
      .update({
        name: formData.get('name') as string,
        email: formData.get('email') as string || null,
        phone: formData.get('phone') as string || null,
        cpf_cnpj: formData.get('cpf_cnpj') as string || null,
        address: formData.get('address') as string || null,
        city: formData.get('city') as string || null,
        state: formData.get('state') as string || null,
        notes: formData.get('notes') as string || null,
      })
      .eq('id', customer.id)

    if (!error) {
      await mutate()
    }

    setLoading(false)
  }, [customer.id, mutate, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize os dados do cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome *</Label>
            <Input id="edit-name" name="name" defaultValue={customer.name} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input id="edit-email" name="email" type="email" defaultValue={customer.email || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input id="edit-phone" name="phone" type="tel" defaultValue={customer.phone || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cpf_cnpj">CPF/CNPJ</Label>
            <Input id="edit-cpf_cnpj" name="cpf_cnpj" defaultValue={customer.cpf_cnpj || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">Endereço</Label>
            <Input id="edit-address" name="address" defaultValue={customer.address || ''} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-city">Cidade</Label>
              <Input id="edit-city" name="city" defaultValue={customer.city || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state">Estado</Label>
              <Input id="edit-state" name="state" maxLength={2} defaultValue={customer.state || ''} placeholder="UF" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Observações</Label>
            <Textarea id="edit-notes" name="notes" rows={2} defaultValue={customer.notes || ''} />
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
