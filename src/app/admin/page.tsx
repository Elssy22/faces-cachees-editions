'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { BookOpen, Users, ShoppingBag, Mail, Euro, TrendingUp } from 'lucide-react'
import {
  DashboardCard,
  AlertLed,
  Speedometer,
  Gauge,
  DigitalCounter,
  StockList,
  ActivityFeed,
  AlertsFeed,
} from '@/components/ui/dashboard'
import { editionFormatLabels, EditionFormat } from '@/types'

interface StockItem {
  id: string
  bookId: string
  bookTitle: string
  bookSlug: string
  format: string
  formatLabel?: string
  currentStock: number
  initialStock: number
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  customerName?: string
}

interface Alert {
  id: string
  type: 'order' | 'stock' | 'message'
  title: string
  description?: string
  severity: 'info' | 'warning' | 'critical'
  link?: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    unreadMessages: 0,
  })
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      const supabase = createClient()

      // Calcul du début du mois
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [
        { count: booksCount },
        { count: authorsCount },
        { count: ordersCount },
        { data: allOrders },
        { data: monthlyOrdersData },
        { count: pendingCount },
        { count: messagesCount },
        { data: stockData },
        { data: recentOrdersData },
      ] = await Promise.all([
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('authors').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount, status'),
        supabase
          .from('orders')
          .select('total_amount, status')
          .gte('created_at', startOfMonth),
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing']),
        supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('read', false),
        supabase
          .from('book_editions')
          .select(`
            id,
            format,
            format_label,
            current_stock,
            initial_stock,
            book:books(id, title, slug)
          `)
          .order('current_stock', { ascending: true }),
        supabase
          .from('orders')
          .select('id, order_number, total_amount, status, created_at, profiles(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      // Calcul des revenus
      const totalRevenue = allOrders?.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      ) || 0

      const monthlyRevenue = monthlyOrdersData?.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      ) || 0

      // Transformer les données de stock
      const transformedStock: StockItem[] = (stockData || []).map((item: any) => ({
        id: item.id,
        bookId: item.book?.id || '',
        bookTitle: item.book?.title || 'Livre inconnu',
        bookSlug: item.book?.slug || '',
        format: item.format,
        formatLabel: item.format_label || editionFormatLabels[item.format as EditionFormat] || item.format,
        currentStock: item.current_stock || 0,
        initialStock: item.initial_stock || 100,
      }))

      // Transformer les commandes récentes
      const transformedOrders: Order[] = (recentOrdersData || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number || order.id.slice(0, 8),
        totalAmount: order.total_amount || 0,
        status: order.status || 'pending',
        createdAt: order.created_at,
        customerName: order.profiles
          ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim()
          : undefined,
      }))

      // Générer les alertes
      const generatedAlerts: Alert[] = []

      // Alertes stock bas
      const lowStockItems = transformedStock.filter(
        (item) => item.initialStock > 0 && item.currentStock / item.initialStock < 0.2
      )
      lowStockItems.slice(0, 3).forEach((item) => {
        generatedAlerts.push({
          id: `stock-${item.id}`,
          type: 'stock',
          title: `Stock bas: ${item.bookTitle}`,
          description: `${item.formatLabel} - ${item.currentStock}/${item.initialStock} restants`,
          severity: item.currentStock / item.initialStock < 0.1 ? 'critical' : 'warning',
          link: `/admin/livres/${item.bookId}`,
          createdAt: new Date().toISOString(),
        })
      })

      // Alerte commandes en attente
      if ((pendingCount || 0) > 0) {
        generatedAlerts.push({
          id: 'pending-orders',
          type: 'order',
          title: `${pendingCount} commande${(pendingCount || 0) > 1 ? 's' : ''} en attente`,
          description: 'Nécessite votre attention',
          severity: (pendingCount || 0) > 5 ? 'critical' : 'warning',
          link: '/admin/commandes',
          createdAt: new Date().toISOString(),
        })
      }

      // Alerte messages non lus
      if ((messagesCount || 0) > 0) {
        generatedAlerts.push({
          id: 'unread-messages',
          type: 'message',
          title: `${messagesCount} message${(messagesCount || 0) > 1 ? 's' : ''} non lu${(messagesCount || 0) > 1 ? 's' : ''}`,
          severity: 'info',
          link: '/admin/messages',
          createdAt: new Date().toISOString(),
        })
      }

      setStats({
        totalBooks: booksCount || 0,
        totalAuthors: authorsCount || 0,
        totalOrders: ordersCount || 0,
        monthlyOrders: monthlyOrdersData?.length || 0,
        totalRevenue,
        monthlyRevenue,
        pendingOrders: pendingCount || 0,
        unreadMessages: messagesCount || 0,
      })
      setStockItems(transformedStock)
      setRecentOrders(transformedOrders)
      setAlerts(generatedAlerts)
      setLoading(false)
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00b4d8]/30 border-t-[#00b4d8] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement du cockpit...</p>
        </div>
      </div>
    )
  }

  // Calcul des stocks critiques et bas
  const criticalStockCount = stockItems.filter(
    (item) => item.initialStock > 0 && item.currentStock / item.initialStock < 0.15
  ).length
  const lowStockCount = stockItems.filter(
    (item) => item.initialStock > 0 &&
      item.currentStock / item.initialStock >= 0.15 &&
      item.currentStock / item.initialStock < 0.30
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="font-serif text-3xl font-bold text-white mb-1">
          Tableau de bord
        </h1>
        <p className="text-gray-500">
          Vue d'ensemble de votre maison d'édition
        </p>
      </div>

      {/* Barre d'alertes LED */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a2e]">
        <AlertLed
          status={stats.pendingOrders > 0 ? 'orange' : 'off'}
          label="Commandes"
          count={stats.pendingOrders}
        />
        <AlertLed
          status={stats.unreadMessages > 0 ? 'blue' : 'off'}
          label="Messages"
          count={stats.unreadMessages}
        />
        <AlertLed
          status={criticalStockCount > 0 ? 'red' : lowStockCount > 0 ? 'orange' : 'off'}
          label="Stock bas"
          count={criticalStockCount + lowStockCount}
        />
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]" />
          <span className="text-xs text-gray-400">Système opérationnel</span>
        </div>
      </div>

      {/* Compteurs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenus du mois */}
        <DashboardCard neonColor="green" className="col-span-2 lg:col-span-1">
          <div className="flex flex-col items-center py-2">
            <Speedometer
              value={stats.monthlyRevenue / 100}
              max={5000}
              label="Revenus ce mois"
              unit="EUR"
              size="md"
              color="green"
            />
          </div>
        </DashboardCard>

        {/* Commandes du mois */}
        <DashboardCard neonColor="blue" className="col-span-2 lg:col-span-1">
          <div className="flex flex-col items-center py-2">
            <Speedometer
              value={stats.monthlyOrders}
              max={100}
              label="Commandes ce mois"
              size="md"
              color="blue"
            />
          </div>
        </DashboardCard>

        {/* Total livres */}
        <DashboardCard neonColor="orange">
          <div className="flex flex-col items-center py-4">
            <DigitalCounter
              value={stats.totalBooks}
              color="orange"
              size="md"
              label="Livres"
            />
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">Catalogue</span>
            </div>
          </div>
        </DashboardCard>

        {/* Total auteurs */}
        <DashboardCard neonColor="blue">
          <div className="flex flex-col items-center py-4">
            <DigitalCounter
              value={stats.totalAuthors}
              color="blue"
              size="md"
              label="Auteurs"
            />
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-xs">Référencés</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00ff88]/10">
              <Euro className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total revenus</p>
              <p className="text-lg font-bold text-[#00ff88]" style={{ textShadow: '0 0 8px #00ff88' }}>
                {(stats.totalRevenue / 100).toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00b4d8]/10">
              <ShoppingBag className="w-5 h-5 text-[#00b4d8]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total commandes</p>
              <p className="text-lg font-bold text-[#00b4d8]" style={{ textShadow: '0 0 8px #00b4d8' }}>
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ff9500]/10">
              <TrendingUp className="w-5 h-5 text-[#ff9500]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">En attente</p>
              <p className="text-lg font-bold text-[#ff9500]" style={{ textShadow: '0 0 8px #ff9500' }}>
                {stats.pendingOrders}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00b4d8]/10">
              <Mail className="w-5 h-5 text-[#00b4d8]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Messages</p>
              <p className="text-lg font-bold text-[#00b4d8]" style={{ textShadow: '0 0 8px #00b4d8' }}>
                {stats.unreadMessages}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Section inférieure : Stock + Activité + Alertes */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Niveaux de stock */}
        <DashboardCard
          title="Niveaux de Stock"
          icon={<BookOpen className="w-4 h-4" />}
          neonColor={criticalStockCount > 0 ? 'red' : lowStockCount > 0 ? 'orange' : 'green'}
          className="lg:col-span-1"
        >
          {stockItems.length > 0 ? (
            <StockList items={stockItems} maxItems={5} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune édition configurée</p>
              <p className="text-xs mt-1">Ajoutez des éditions à vos livres</p>
            </div>
          )}
        </DashboardCard>

        {/* Dernières commandes */}
        <DashboardCard
          title="Dernières Commandes"
          icon={<ShoppingBag className="w-4 h-4" />}
          neonColor="blue"
          className="lg:col-span-1"
        >
          <ActivityFeed orders={recentOrders} maxItems={5} />
        </DashboardCard>

        {/* Alertes */}
        <DashboardCard
          title="Alertes"
          icon={<Mail className="w-4 h-4" />}
          neonColor={alerts.some(a => a.severity === 'critical') ? 'red' : alerts.length > 0 ? 'orange' : 'green'}
          className="lg:col-span-1"
        >
          <AlertsFeed alerts={alerts} maxItems={5} />
        </DashboardCard>
      </div>
    </div>
  )
}
