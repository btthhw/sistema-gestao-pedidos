-- Script para criar a tabela de orders no Supabase
-- Execute este SQL no Supabase SQL Editor

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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permite acesso para testes)
CREATE POLICY "Allow all operations on orders" ON public.orders
  FOR ALL
  USING (true);
