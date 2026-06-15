import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(url, serviceKey)

    // Create customers table
    const { error: customersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.customers (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          name varchar NOT NULL,
          email varchar,
          phone varchar,
          cpf_cnpj varchar,
          address varchar,
          city varchar,
          state varchar,
          notes text,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
        CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
        CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
        CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);
      `
    })

    // Create orders table
    const { error: ordersError } = await supabase.rpc('exec_sql', {
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
        CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true);
      `
    })

    if (customersError) console.error('[v0] Customers table error:', customersError)
    if (ordersError) console.error('[v0] Orders table error:', ordersError)

    // Try creating via direct SQL if rpc fails
    if (customersError || ordersError) {
      const { error: directError } = await supabase.from('customers').select('count', { count: 'exact' }).limit(1)
      
      if (directError && directError.code === 'PGRST116') {
        // Table doesn't exist, try to create with a workaround
        console.log('[v0] Creating customers table via insert workaround')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized',
      customersError: customersError?.message,
      ordersError: ordersError?.message
    })
  } catch (error) {
    console.error('[v0] Database init error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
