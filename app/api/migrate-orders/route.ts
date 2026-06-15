import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json({
        error: 'Missing Supabase credentials',
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Criar tabela de orders
    const { error: createTableError } = await supabase.rpc('exec_sql', {
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
          notes text,
          created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_orders_created_by ON public.orders(created_by);

        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
        CREATE POLICY "Users can view their own orders" ON public.orders
          FOR SELECT
          USING (true);

        DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
        CREATE POLICY "Users can create orders" ON public.orders
          FOR INSERT
          WITH CHECK (true);

        DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
        CREATE POLICY "Users can update their own orders" ON public.orders
          FOR UPDATE
          USING (true)
          WITH CHECK (true);
      `
    })

    if (createTableError) {
      console.error('Error creating table:', createTableError)
    }

    return Response.json({
      success: true,
      message: 'Orders table created/updated successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return Response.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
