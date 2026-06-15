import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return Response.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Tentar criar a tabela customers
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.customers (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          name varchar NOT NULL,
          email varchar,
          phone varchar,
          cpf_cnpj varchar,
          address varchar,
          city varchar,
          state varchar(2),
          notes text,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
        CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
        
        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
        CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);
      `
    })

    if (createError) {
      // A função exec_sql pode não existir, então vamos tentar criar via insert
      // Vamos apenas checar se conseguimos fazer uma query simples
      const { error: checkError } = await supabase
        .from('customers')
        .select('count(*)', { count: 'exact', head: true })
        .single()
        .then(() => ({ error: null }))
        .catch(err => ({ error: err }))

      if (checkError) {
        return Response.json({ 
          error: 'Tabela customers não existe. Por favor, execute o SQL abaixo no Supabase SQL Editor:',
          sql: `
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name varchar NOT NULL,
  email varchar,
  phone varchar,
  cpf_cnpj varchar,
  address varchar,
  city varchar,
  state varchar(2),
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);

-- Inserir dados de teste
INSERT INTO public.customers (name, email, phone, cpf_cnpj, city, state) VALUES
('João Silva', 'joao@example.com', '11999999999', '123.456.789-00', 'São Paulo', 'SP'),
('Maria Santos', 'maria@example.com', '11988888888', '987.654.321-00', 'Rio de Janeiro', 'RJ');
          `
        }, { status: 400 })
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Tabela customers criada/verificada com sucesso' 
    })

  } catch (error: any) {
    console.error('[v0] Erro ao criar tabela:', error)
    return Response.json({ 
      error: error.message || 'Erro ao criar tabela',
      details: error
    }, { status: 500 })
  }
}
