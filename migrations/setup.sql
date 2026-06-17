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
  customer_id uuid,
  customer_name varchar,
  customer_email varchar,
  customer_phone varchar,
  user_id uuid,
  total_amount decimal(10, 2) DEFAULT 0,
  discount decimal(10, 2) DEFAULT 0,
  status varchar DEFAULT 'orcamento',
  delivery_address varchar,
  delivery_date date,
  items_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  finalized_at timestamp,
  notes text,
  FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- Habilitar RLS para orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso para orders
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true);

-- Criar tabela de itens do pedido
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity decimal(10, 2) NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT
);

-- Criar índices para order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Habilitar RLS para order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso para order_items
DROP POLICY IF EXISTS "Allow all operations on order_items" ON public.order_items;
CREATE POLICY "Allow all operations on order_items" ON public.order_items FOR ALL USING (true);
