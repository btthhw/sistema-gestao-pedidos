import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[v0] Supabase credentials not configured')
      return NextResponse.json(
        { error: 'Server not configured' },
        { status: 500 }
      )
    }

    // Cria um cliente com a service role key para acessar a Admin API
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('[v0] Procurando usuário com email:', email)

    // Primeiro, encontra o usuário
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('[v0] Erro ao listar usuários:', usersError)
      return NextResponse.json(
        { error: 'Erro ao listar usuários' },
        { status: 500 }
      )
    }

    const user = users?.users?.find(u => u.email === email)

    if (!user) {
      console.error('[v0] Usuário não encontrado:', email)
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log('[v0] Confirmando email para usuário:', user.id)

    // Confirma o email do usuário
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    })

    if (updateError) {
      console.error('[v0] Erro ao confirmar email:', updateError)
      return NextResponse.json(
        { error: 'Erro ao confirmar email' },
        { status: 500 }
      )
    }

    console.log('[v0] Email confirmado com sucesso:', email)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] Erro no endpoint de confirmação:', err)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
