'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, ShoppingBag, MessageSquare } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const supabase = createClient()

      const [
        { count: booksCount },
        { count: authorsCount },
        { count: ordersCount },
        { data: orders },
        { count: pendingCount },
        { count: messagesCount },
      ] = await Promise.all([
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('authors').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing']),
        supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('read', false),
      ])

      const totalRevenue = orders?.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      ) || 0

      setStats({
        totalBooks: booksCount || 0,
        totalAuthors: authorsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        pendingOrders: pendingCount || 0,
        unreadMessages: messagesCount || 0,
      })
      setLoading(false)
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre maison d'édition
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Livres
            </CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-gray-500 mt-1">
              Livres dans le catalogue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Auteurs
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAuthors}</div>
            <p className="text-xs text-gray-500 mt-1">
              Auteurs référencés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Commandes
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingOrders > 0 && (
                <span className="text-orange-600 font-medium">
                  {stats.pendingOrders} en cours
                </span>
              )}
              {stats.pendingOrders === 0 && 'Toutes traitées'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Chiffre d'affaires
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total des ventes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commandes en attente</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.pendingOrders > 0 ? (
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pendingOrders}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Commandes nécessitent votre attention
                </p>
              </div>
            ) : (
              <p className="text-gray-600">
                Aucune commande en attente
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages non lus</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.unreadMessages > 0 ? (
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.unreadMessages}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Nouveaux messages de contact
                </p>
              </div>
            ) : (
              <p className="text-gray-600">
                Tous les messages ont été lus
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
