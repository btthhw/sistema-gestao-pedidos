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
  // Em desenvolvimento, permite acesso direto ao dashboard
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DataPrefetcher />
        <Sidebar profile={null} />
        <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    )
  }

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  let profile: Profile | null = null
  
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
