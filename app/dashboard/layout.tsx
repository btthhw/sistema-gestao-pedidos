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
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DataPrefetcher />
      <Sidebar profile={profile as Profile | null} />
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
