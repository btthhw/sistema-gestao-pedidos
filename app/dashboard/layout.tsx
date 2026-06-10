import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { DataPrefetcher } from '@/components/data-prefetcher'
import { PageTransition } from '@/components/page-transition'
import type { Profile } from '@/lib/types'

export const revalidate = 3600

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Em modo desenvolvimento com credenciais placeholder, permite acesso direto
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isDemoMode = isDevelopment && isPlaceholder
  
  if (!user && !isDemoMode) {
    redirect('/auth/login')
  }

  let profile: Profile | null = null
  
  // Tenta carregar o perfil se o usuário existir
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data as Profile | null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DataPrefetcher />
      <Sidebar profile={profile} />
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
