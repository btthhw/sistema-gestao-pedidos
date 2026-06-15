import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json({
        error: 'Missing Supabase credentials'
      }, { status: 500 })
    }

    // Usar a Admin API do Supabase para executar SQL
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function_name: 'postgres_sql_exec',
          sql: `
            CREATE TABLE IF NOT EXISTS public.orders (
              id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
              customer_name varchar NOT NULL,
              customer_email varchar,
              customer_phone varchar,
              total decimal(10, 2) DEFAULT 0,
              status varchar DEFAULT 'pendente',
              items_count integer DEFAULT 0,
              created_at timestamp DEFAULT now(),
              finalized_at timestamp,
              notes text
            );

            CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

            ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

            DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;
            CREATE POLICY "Allow all operations on orders" ON public.orders
              FOR ALL
              USING (true);
          `
        })
      }
    )

    const result = await response.json()
    
    // Agora inserir dados de teste
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
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

    return Response.json({
      success: true,
      message: 'Orders table created and test data inserted',
      ordersCreated: data?.length || 0,
      sqlResult: result
    })
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : ''
    }, { status: 500 })
  }
}
