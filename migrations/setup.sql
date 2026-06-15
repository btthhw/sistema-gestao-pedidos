-- Criar tabela de clientes
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- Habilitar RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso
DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);

-- Criar tabela de pedidos
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

-- Criar índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Habilitar RLS para orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso para orders
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true);
