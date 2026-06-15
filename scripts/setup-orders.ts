import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function createOrdersTable() {
  const sql = `
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

  try {
    // Use the query endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    })
    
    console.log('Orders table created')
  } catch (error) {
    console.error('Error creating table:', error)
  }
}

async function insertTestOrders() {
  const testOrders = [
    {
      customer_name: 'Cliente Teste 1',
      customer_email: 'cliente1@example.com',
      customer_phone: '11999999999',
      total: 500.00,
      status: 'pendente',
      items_count: 3,
      notes: 'Pedido de teste 1'
    },
    {
      customer_name: 'Cliente Teste 2',
      customer_email: 'cliente2@example.com',
      customer_phone: '11988888888',
      total: 750.50,
      status: 'pendente',
      items_count: 5,
      notes: 'Pedido de teste 2'
    },
    {
      customer_name: 'Cliente Finalizado',
      customer_email: 'cliente3@example.com',
      customer_phone: '11977777777',
      total: 1200.00,
      status: 'finalizado',
      items_count: 8,
      finalized_at: new Date(),
      notes: 'Pedido finalizado'
    }
  ]

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(testOrders)
      .select()

    if (error) {
      console.error('Error inserting orders:', error)
    } else {
      console.log('Test orders inserted:', data?.length)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function main() {
  await createOrdersTable()
  await insertTestOrders()
}

main()
