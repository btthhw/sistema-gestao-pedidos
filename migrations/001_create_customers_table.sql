-- Execute este SQL no Supabase SQL Editor (em https://supabase.com/dashboard)

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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Criar política simples que permite tudo (para desenvolvimento)
-- Em produção, você deve criar políticas mais restritivas
DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);

-- Inserir alguns dados de teste (opcional)
INSERT INTO public.customers (name, email, phone, city, state) VALUES
('João Silva', 'joao@example.com', '11999999999', 'São Paulo', 'SP'),
('Maria Santos', 'maria@example.com', '21988888888', 'Rio de Janeiro', 'RJ'),
('Pedro Oliveira', 'pedro@example.com', '85977777777', 'Fortaleza', 'CE');

-- Verificar os dados inseridos
SELECT * FROM public.customers;
