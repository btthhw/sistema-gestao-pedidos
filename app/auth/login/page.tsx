'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mountain } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('E-mail ou senha inválidos')
        setLoading(false)
        return
      }

      if (data?.session) {
        await new Promise(resolve => setTimeout(resolve, 500))
        window.location.href = '/dashboard'
      } else {
        setError('Nenhuma sessão foi criada. Tente novamente.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setLoading(true)
    setError(null)

    try {
      // Cria uma conta de demo com email único
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const demoEmail = `demo_${timestamp}_${random}@demo.teste.com`
      const demoPassword = 'Demo@123456'

      const supabase = createClient()

      // Tenta fazer signup da demo
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            full_name: 'Demo User',
            phone: '(00) 00000-0000',
            role: 'vendedor'
          }
        }
      })

      if (signUpError && !signUpError.message.includes('already registered')) {
        setError('Erro ao criar conta demo: ' + signUpError.message)
        setLoading(false)
        return
      }

      // Aguarda um pouco
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Tenta confirmar o email
      try {
        await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: demoEmail })
        })
      } catch (err) {
        console.error('[v0] Erro ao confirmar email demo:', err)
      }

      // Aguarda mais um pouco
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Tenta fazer login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (loginError) {
        setError('Erro ao fazer login demo: ' + loginError.message)
        setLoading(false)
        return
      }

      if (loginData?.session) {
        await new Promise(resolve => setTimeout(resolve, 500))
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao acessar demo')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Mountain className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Raniele</CardTitle>
          <CardDescription>Pedras e Revestimentos - Sistema de Gestão</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              disabled={loading}
              onClick={handleDemoLogin}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Demo...
                </>
              ) : (
                'Entrar como Demo'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <a href="/auth/cadastro" className="text-foreground hover:underline">
              Criar nova conta
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
