'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState, useCallback, useMemo, memo, useTransition } from 'react'
import type { Profile } from '@/lib/types'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/estoque', label: 'Estoque', icon: Package },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3, adminOnly: true },
]

interface SidebarProps {
  profile: Profile | null
}

// Memoizar nav item para evitar re-render ao mudar rota
const NavItem = memo(function NavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: typeof navItems[0]
  isActive: boolean
  onNavigate: (href: string) => void
}) {
  const Icon = item.icon

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Permite cmd/ctrl+click abrir em nova aba normalmente
      if (e.metaKey || e.ctrlKey || e.shiftKey) return
      e.preventDefault()
      onNavigate(item.href)
    },
    [item.href, onNavigate]
  )

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-100',
        isActive 
          ? 'bg-stone-700 text-white' 
          : 'text-stone-300 hover:bg-stone-700/50 hover:text-white active:bg-stone-700'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{item.label}</span>
    </Link>
  )
}, (prev, next) => {
  return prev.isActive === next.isActive && prev.onNavigate === next.onNavigate
})

export const Sidebar = memo(function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  // Rota "alvo" do clique: destaca o item imediatamente,
  // antes mesmo da navegação terminar.
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null)

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }, [router])

  const handleNavigate = useCallback((href: string) => {
    setOptimisticPath(href)
    setMobileOpen(false)
    startTransition(() => {
      router.push(href)
    })
  }, [router])

  const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Usa a rota otimista enquanto a transição não conclui;
  // ao concluir, volta a confiar no pathname real.
  const activePath = isPending && optimisticPath ? optimisticPath : pathname

  const filteredNavItems = useMemo(() => navItems.filter(item => {
    if (item.adminOnly && profile?.role !== 'admin') return false
    return true
  }), [profile?.role])

  return (
    <>
      {/* Barra de progresso de navegação */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-stone-700 overflow-hidden">
          <div className="h-full w-1/3 bg-amber-500 animate-[loading_0.8s_ease-in-out_infinite]" />
        </div>
      )}

      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 lg:hidden bg-stone-800 text-white p-2 rounded-md active:scale-95 transition-transform duration-75 will-change-transform"
        aria-label="Menu"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-40 h-screen w-64 bg-stone-800 text-white transition-transform duration-150 ease-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-stone-700 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-700 flex-shrink-0">
                <Package className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg truncate">Raniele</h1>
                <p className="text-xs text-stone-400 truncate">Pedras e Revestimentos</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = activePath === item.href || 
                (item.href !== '/dashboard' && activePath.startsWith(item.href))
              
              return (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                />
              )
            })}
          </nav>

          <div className="p-4 border-t border-stone-700 flex-shrink-0">
            <div className="mb-4 px-4">
              <p className="font-medium truncate">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-stone-400 capitalize truncate">{profile?.role || 'vendedor'}</p>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-stone-300 hover:text-white hover:bg-stone-700"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}, (prev, next) => {
  return (
    prev.profile?.id === next.profile?.id &&
    prev.profile?.role === next.profile?.role &&
    prev.profile?.full_name === next.profile?.full_name
  )
})
