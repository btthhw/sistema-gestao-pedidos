'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Copy, CheckCircle } from 'lucide-react'

export function DatabaseInitializer() {
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkTables()
  }, [])

  async function checkTables() {
    try {
      const response = await fetch('/api/debug-customers')
      const data = await response.json()
      
      const tableExists = !data.error || !data.error.includes("Could not find the table")
      setTableExists(tableExists)
    } catch (error) {
      setTableExists(false)
    }
  }

  const sqlScript = `-- Criar tabela de clientes
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
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true);`

  if (tableExists === null) {
    return null
  }

  if (tableExists) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Banco de Dados Configurado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-900">
            As tabelas de clientes e pedidos estão prontas para uso!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Configuração do Banco de Dados Necessária
        </CardTitle>
        <CardDescription className="text-red-900">
          As tabelas de clientes e pedidos precisam ser criadas manualmente no Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-red-900 space-y-2">
          <p className="font-medium">Siga os passos abaixo:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Abra o <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-red-700">Supabase Dashboard</a></li>
            <li>Vá para <span className="font-medium">SQL Editor</span></li>
            <li>Clique em <span className="font-medium">New Query</span></li>
            <li>Cole o SQL abaixo</li>
            <li>Clique em <span className="font-medium">Execute / Run</span> ou pressione <span className="font-mono bg-red-100 px-2 py-1 rounded">Ctrl+Enter</span></li>
            <li>Após executar, clique em <span className="font-medium">Verificar Novamente</span> abaixo</li>
          </ol>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-red-900">SQL Script:</label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(sqlScript)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copiado!' : 'Copiar SQL'}
            </Button>
          </div>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-80 overflow-y-auto border border-gray-700">
            <pre className="whitespace-pre-wrap break-words leading-relaxed">{sqlScript}</pre>
          </div>
          <p className="text-xs text-red-800 bg-red-100 p-2 rounded">
            💡 <span className="font-medium">Dica:</span> Cole tudo acima no SQL Editor do Supabase e clique em Run/Execute
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => checkTables()}
            className="gap-2"
          >
            Verificar Novamente
          </Button>
          <Button
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            className="gap-2"
          >
            Abrir Supabase
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

