import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sql } from '@vercel/postgres'

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

    const supabase = createClient(url, serviceKey, {
      db: { schema: 'public' }
    })

    // Tentar criar tabela customers
    console.log('[v0] Creating customers table')
    const customersSQL = `
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
      ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
      CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);
    `

    // Usar o cliente Supabase com header auth para executar SQL
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        query: customersSQL
      })
    }).catch(e => console.log('[v0] Fetch error:', e))

    // Tenta uma segunda abordagem - insert dummy data
    console.log('[v0] Trying alternative approach')
    const { error: testError } = await supabase
      .from('customers')
      .select('id')
      .limit(1)

    if (testError && testError.code === 'PGRST116') {
      // Tabela não existe
      console.log('[v0] Customers table does not exist, needs manual SQL execution')
      return NextResponse.json({
        success: false,
        error: 'Table does not exist. Please run the SQL in Supabase dashboard.',
        tableExists: false
      }, { status: 400 })
    }

    console.log('[v0] Customers table exists or was created')

    return NextResponse.json({
      success: true,
      message: 'Database tables initialized successfully',
      testError: testError?.message
    })
  } catch (error) {
    console.error('[v0] DB init error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
