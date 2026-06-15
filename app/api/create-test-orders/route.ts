import { createClient } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Teste se a tabela existe, se não criar
    const { data: checkTable } = await supabase
      .from('orders')
      .select('count', { count: 'exact' })
      .limit(0)

    // Se não existir, criaremos alguns pedidos de teste
    const testOrders = [
      {
        customer_name: 'João Silva',
        customer_email: 'joao@example.com',
        customer_phone: '11999999999',
        total: 500.00,
        status: 'pendente',
        items_count: 3,
        notes: 'Pedido de revestimentos'
      },
      {
        customer_name: 'Maria Santos',
        customer_email: 'maria@example.com',
        customer_phone: '11988888888',
        total: 750.50,
        status: 'pendente',
        items_count: 5,
        notes: 'Pedido de argamassa'
      },
      {
        customer_name: 'Pedro Costa',
        customer_email: 'pedro@example.com',
        customer_phone: '11977777777',
        total: 1200.00,
        status: 'finalizado',
        items_count: 8,
        finalized_at: new Date().toISOString(),
        notes: 'Pedido finalizado'
      }
    ]

    const { data, error } = await supabase
      .from('orders')
      .insert(testOrders)
      .select()

    if (error) {
      return Response.json({
        error: error.message,
        details: error
      }, { status: 400 })
    }

    return Response.json({
      success: true,
      message: 'Test orders created',
      count: data?.length || 0
    })
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
