'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DashboardCard,
  DigitalCounter,
  Gauge,
} from '@/components/ui/dashboard'
import {
  Eye,
  Users,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  BookOpen,
  UserCircle,
  ExternalLink,
  RefreshCw,
  Calendar,
} from 'lucide-react'

interface TrafficStats {
  summary: {
    total_sessions: number
    total_visitors: number
    total_page_views: number
    avg_pages_per_session: number
    bounce_rate: number
  }
  daily_visitors: Array<{
    day: string
    visitors: number
    sessions: number
    page_views: number
  }>
  top_pages: Array<{
    page_path: string
    page_title: string
    entity_type: string | null
    entity_name: string | null
    views: number
    unique_visitors: number
  }>
  top_books: Array<{
    book_id: string
    title: string
    views: number
    unique_visitors: number
  }>
  top_authors: Array<{
    author_id: string
    name: string
    views: number
    unique_visitors: number
  }>
  traffic_sources: Array<{
    source: string
    sessions: number
    visitors: number
    page_views: number
    bounce_rate: number
  }>
  devices: {
    desktop: number
    mobile: number
    tablet: number
    unknown: number
  }
}

interface RealtimeStats {
  active_visitors: number
  visitors_last_hour: number
  page_views_last_hour: number
  current_pages: Array<{
    page_path: string
    page_title: string
    active_visitors: number
  }>
}

type DateRange = '7d' | '30d' | '90d'

export default function StatistiquesPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TrafficStats | null>(null)
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  const loadStats = async () => {
    setLoading(true)
    const supabase = createClient()

    // Calculer les dates selon la période sélectionnée
    const endDate = new Date()
    const startDate = new Date()
    switch (dateRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
    }

    try {
      // Charger les stats de trafic
      const { data: trafficData, error: trafficError } = await supabase.rpc('get_traffic_stats', {
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0],
      })

      if (trafficError) {
        // Ignorer silencieusement si pas de données
        console.log('No traffic stats yet:', trafficError.message)
      } else if (trafficData) {
        setStats(trafficData)
      }

      // Charger les stats temps réel
      const { data: realtimeData, error: realtimeError } = await supabase.rpc('get_realtime_stats')

      if (realtimeError) {
        console.log('No realtime stats yet:', realtimeError.message)
      } else if (realtimeData) {
        setRealtimeStats(realtimeData)
      }
    } catch (error) {
      // Ignorer les erreurs - probablement pas de données encore
      console.log('Stats not available yet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()

    // Rafraîchir les stats temps réel toutes les 30 secondes
    const interval = setInterval(async () => {
      const supabase = createClient()
      const { data } = await supabase.rpc('get_realtime_stats')
      if (data) setRealtimeStats(data)
    }, 30000)

    return () => clearInterval(interval)
  }, [dateRange])

  const totalDevices = stats?.devices
    ? stats.devices.desktop + stats.devices.mobile + stats.devices.tablet + stats.devices.unknown
    : 0

  const devicePercentages = stats?.devices && totalDevices > 0
    ? {
        desktop: Math.round((stats.devices.desktop / totalDevices) * 100),
        mobile: Math.round((stats.devices.mobile / totalDevices) * 100),
        tablet: Math.round((stats.devices.tablet / totalDevices) * 100),
      }
    : { desktop: 0, mobile: 0, tablet: 0 }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00b4d8]/30 border-t-[#00b4d8] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">
            Statistiques
          </h1>
          <p className="text-gray-500">
            Analyse du trafic et comportement des visiteurs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur de période */}
          <div className="flex bg-[#1a1a2e] rounded-lg p-1">
            {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  dateRange === range
                    ? 'bg-[#00b4d8] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            className="border-[#2a2a3e] text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats temps réel */}
      <DashboardCard neonColor="green" className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
            <span className="text-gray-400 text-sm">En temps réel</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#00ff88]" style={{ textShadow: '0 0 10px #00ff88' }}>
                {realtimeStats?.active_visitors || 0}
              </p>
              <p className="text-xs text-gray-500">Actifs maintenant</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#00b4d8]" style={{ textShadow: '0 0 10px #00b4d8' }}>
                {realtimeStats?.visitors_last_hour || 0}
              </p>
              <p className="text-xs text-gray-500">Dernière heure</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#ff9500]" style={{ textShadow: '0 0 10px #ff9500' }}>
                {realtimeStats?.page_views_last_hour || 0}
              </p>
              <p className="text-xs text-gray-500">Pages vues/h</p>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Compteurs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard neonColor="blue">
          <div className="flex flex-col items-center py-4">
            <DigitalCounter
              value={stats?.summary.total_visitors || 0}
              color="blue"
              size="md"
              label="Visiteurs"
            />
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-xs">Uniques</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard neonColor="green">
          <div className="flex flex-col items-center py-4">
            <DigitalCounter
              value={stats?.summary.total_page_views || 0}
              color="green"
              size="md"
              label="Pages vues"
            />
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <Eye className="w-4 h-4" />
              <span className="text-xs">Total</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard neonColor="orange">
          <div className="flex flex-col items-center py-4">
            <DigitalCounter
              value={stats?.summary.avg_pages_per_session || 0}
              color="orange"
              size="md"
              label="Pages/session"
            />
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <MousePointer className="w-4 h-4" />
              <span className="text-xs">Moyenne</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard neonColor={stats?.summary.bounce_rate && stats.summary.bounce_rate > 60 ? 'red' : 'blue'}>
          <div className="flex flex-col items-center py-4">
            <DigitalCounter
              value={stats?.summary.bounce_rate || 0}
              color={stats?.summary.bounce_rate && stats.summary.bounce_rate > 60 ? 'red' : 'blue'}
              size="md"
              label="Taux rebond %"
            />
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">{stats?.summary.bounce_rate && stats.summary.bounce_rate > 60 ? 'Élevé' : 'Normal'}</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Grille principale */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sources de trafic */}
        <DashboardCard
          title="Sources de trafic"
          icon={<Globe className="w-4 h-4" />}
          neonColor="blue"
        >
          <div className="space-y-3">
            {stats?.traffic_sources && stats.traffic_sources.length > 0 ? (
              stats.traffic_sources.slice(0, 8).map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                    <span className="text-sm text-gray-300">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#00b4d8]">{source.sessions}</span>
                    <div className="w-20 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00b4d8] rounded-full"
                        style={{
                          width: `${(source.sessions / (stats.traffic_sources[0]?.sessions || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Aucune donnée</p>
            )}
          </div>
        </DashboardCard>

        {/* Pages les plus vues */}
        <DashboardCard
          title="Pages populaires"
          icon={<Eye className="w-4 h-4" />}
          neonColor="green"
        >
          <div className="space-y-3">
            {stats?.top_pages && stats.top_pages.length > 0 ? (
              stats.top_pages.slice(0, 8).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate max-w-[150px]" title={page.page_path}>
                    {page.page_title || page.page_path}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#00ff88]">{page.views}</span>
                    <span className="text-xs text-gray-500">({page.unique_visitors} uniq.)</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Aucune donnée</p>
            )}
          </div>
        </DashboardCard>

        {/* Appareils */}
        <DashboardCard
          title="Appareils"
          icon={<Smartphone className="w-4 h-4" />}
          neonColor="orange"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#00b4d8]" />
                <span className="text-sm text-gray-300">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#00b4d8]">{devicePercentages.desktop}%</span>
                <div className="w-16 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00b4d8] rounded-full"
                    style={{ width: `${devicePercentages.desktop}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#00ff88]" />
                <span className="text-sm text-gray-300">Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#00ff88]">{devicePercentages.mobile}%</span>
                <div className="w-16 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00ff88] rounded-full"
                    style={{ width: `${devicePercentages.mobile}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-[#ff9500]" />
                <span className="text-sm text-gray-300">Tablette</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#ff9500]">{devicePercentages.tablet}%</span>
                <div className="w-16 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff9500] rounded-full"
                    style={{ width: `${devicePercentages.tablet}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Livres et Auteurs populaires */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Livres les plus consultés */}
        <DashboardCard
          title="Livres les plus consultés"
          icon={<BookOpen className="w-4 h-4" />}
          neonColor="blue"
        >
          <div className="space-y-3">
            {stats?.top_books && stats.top_books.length > 0 ? (
              stats.top_books.map((book, index) => (
                <div key={book.book_id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[#00b4d8] w-6">{index + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.unique_visitors} visiteurs uniques</p>
                  </div>
                  <span className="text-lg font-bold text-[#00b4d8]">{book.views}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                Aucune donnée de consultation
              </p>
            )}
          </div>
        </DashboardCard>

        {/* Auteurs les plus consultés */}
        <DashboardCard
          title="Auteurs les plus consultés"
          icon={<UserCircle className="w-4 h-4" />}
          neonColor="orange"
        >
          <div className="space-y-3">
            {stats?.top_authors && stats.top_authors.length > 0 ? (
              stats.top_authors.map((author, index) => (
                <div key={author.author_id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[#ff9500] w-6">{index + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{author.name}</p>
                    <p className="text-xs text-gray-500">{author.unique_visitors} visiteurs uniques</p>
                  </div>
                  <span className="text-lg font-bold text-[#ff9500]">{author.views}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                Aucune donnée de consultation
              </p>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Graphique des visites quotidiennes (simplifié) */}
      {stats?.daily_visitors && stats.daily_visitors.length > 0 && (
        <DashboardCard
          title="Évolution des visites"
          icon={<Calendar className="w-4 h-4" />}
          neonColor="green"
        >
          <div className="h-48 flex items-end justify-between gap-1 pt-4">
            {stats.daily_visitors.slice(-30).map((day, index) => {
              const maxVisitors = Math.max(...stats.daily_visitors.map(d => d.visitors))
              const height = maxVisitors > 0 ? (day.visitors / maxVisitors) * 100 : 0
              return (
                <div
                  key={index}
                  className="flex-1 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 transition-all rounded-t cursor-pointer group relative"
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`${new Date(day.day).toLocaleDateString('fr-FR')}: ${day.visitors} visiteurs`}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-[#00ff88] rounded-t transition-all"
                    style={{ height: '100%', opacity: 0.6 }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a2e] px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.visitors} visiteurs
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{stats.daily_visitors[0]?.day ? new Date(stats.daily_visitors[0].day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}</span>
            <span>{stats.daily_visitors[stats.daily_visitors.length - 1]?.day ? new Date(stats.daily_visitors[stats.daily_visitors.length - 1].day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}</span>
          </div>
        </DashboardCard>
      )}
    </div>
  )
}
