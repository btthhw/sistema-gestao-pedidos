import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Cria um cookie de sessão de teste apenas para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const cookieStore = await cookies()
      cookieStore.set('test-user', JSON.stringify({ email, name: email.split('@')[0] }), {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
      })
      
      return NextResponse.json({ success: true, redirect: '/dashboard' })
    }

    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  } catch (err) {
    console.error('[v0] Test login error:', err)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
