import { Sidebar } from '@/components/sidebar'
import { DataPrefetcher } from '@/components/data-prefetcher'
import { PageTransition } from '@/components/page-transition'

export const revalidate = 3600

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
