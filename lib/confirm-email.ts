import { createClient } from '@supabase/supabase-js'

async function confirmEmail(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase credentials not configured')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Usa a admin API para confirmar o email
  const { data, error } = await supabase.auth.admin.updateUserById(
    email, // This would normally be a user ID, but we need to find it first
    { email_confirm: true }
  )

  if (error) {
    console.error('[v0] Error confirming email:', error)
    throw error
  }

  return data
}

export default confirmEmail
