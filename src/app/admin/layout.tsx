'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  UserCog,
  Home,
  Tag,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Statistiques', href: '/admin/statistiques', icon: BarChart3 },
  { name: 'Tendances', href: '/admin/tendances', icon: TrendingUp },
  { name: 'Page d\'accueil', href: '/admin/accueil', icon: Home },
  { name: 'Livres', href: '/admin/livres', icon: BookOpen },
  { name: 'Auteurs', href: '/admin/auteurs', icon: Users },
  { name: 'Tags', href: '/admin/tags', icon: Tag },
  { name: 'Événements', href: '/admin/evenements', icon: Calendar },
  { name: 'Cofondateurs', href: '/admin/cofondateurs', icon: UserCog },
  { name: 'Commandes', href: '/admin/commandes', icon: ShoppingBag },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] cockpit-mode">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Style cockpit */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static',
          'bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0a] border-r border-[#2a2a3e]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Style néon */}
          <div className="flex h-16 items-center justify-between border-b border-[#2a2a3e] px-6">
            <Link href="/admin" className="font-serif text-xl font-bold text-white">
              <span className="text-[#00b4d8]" style={{ textShadow: '0 0 10px #00b4d8' }}>Admin</span> FCE
            </Link>
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation - Style cockpit */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30 shadow-[0_0_10px_rgba(0,180,216,0.2)]'
                      : 'text-gray-400 hover:bg-[#1a1a2e] hover:text-gray-200 border border-transparent'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_4px_#00b4d8]')} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout - Style cockpit */}
          <div className="border-t border-[#2a2a3e] p-4">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-200">
                {user?.email}
              </p>
              <p className="text-xs text-[#00ff88]" style={{ textShadow: '0 0 6px #00ff88' }}>
                Administrateur
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent border-[#ff3366]/30 text-[#ff3366] hover:bg-[#ff3366]/10 hover:text-[#ff3366] hover:border-[#ff3366]/50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header - Style cockpit */}
        <header className="flex h-16 items-center justify-between border-b border-[#2a2a3e] bg-[#0a0a0a] px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/admin" className="font-serif text-xl font-bold text-white">
            <span className="text-[#00b4d8]">Admin</span> FCE
          </Link>
          <div className="w-6" />
        </header>

        {/* Content - Fond cockpit avec grille subtile */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#0a0a0a] cockpit-grid">
          {children}
        </main>
      </div>
    </div>
  )
}
