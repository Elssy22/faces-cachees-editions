'use client'

import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  customerName?: string
}

interface ActivityFeedProps {
  orders: Order[]
  maxItems?: number
  className?: string
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'En attente',
    color: '#ff9500',
    bgColor: 'bg-[#ff9500]/10',
  },
  processing: {
    icon: Package,
    label: 'En préparation',
    color: '#00b4d8',
    bgColor: 'bg-[#00b4d8]/10',
  },
  shipped: {
    icon: Truck,
    label: 'Expédiée',
    color: '#00b4d8',
    bgColor: 'bg-[#00b4d8]/10',
  },
  delivered: {
    icon: CheckCircle,
    label: 'Livrée',
    color: '#00ff88',
    bgColor: 'bg-[#00ff88]/10',
  },
  cancelled: {
    icon: XCircle,
    label: 'Annulée',
    color: '#ff3366',
    bgColor: 'bg-[#ff3366]/10',
  },
}

export function ActivityFeed({ orders, maxItems = 5, className }: ActivityFeedProps) {
  const displayOrders = orders.slice(0, maxItems)

  return (
    <div className={cn('space-y-3', className)}>
      {displayOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucune commande récente</p>
        </div>
      ) : (
        displayOrders.map((order) => {
          const config = statusConfig[order.status]
          const StatusIcon = config.icon
          const timeAgo = formatDistanceToNow(new Date(order.createdAt), {
            addSuffix: true,
            locale: fr,
          })

          return (
            <Link
              key={order.id}
              href={`/admin/commandes?id=${order.id}`}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all',
                'bg-[#1a1a2e]/30 hover:bg-[#1a1a2e]/50',
                'border border-white/5 hover:border-white/10'
              )}
            >
              {/* Icône de statut */}
              <div
                className={cn('p-2 rounded-lg', config.bgColor)}
                style={{ color: config.color }}
              >
                <StatusIcon className="w-4 h-4" />
              </div>

              {/* Détails */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-200">
                    #{order.orderNumber}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${config.color}20`,
                      color: config.color,
                    }}
                  >
                    {config.label}
                  </span>
                </div>
                {order.customerName && (
                  <p className="text-xs text-gray-500 truncate">
                    {order.customerName}
                  </p>
                )}
              </div>

              {/* Montant et temps */}
              <div className="text-right">
                <span
                  className="text-sm font-bold font-mono"
                  style={{
                    color: '#00ff88',
                    textShadow: '0 0 8px #00ff88',
                  }}
                >
                  {(order.totalAmount / 100).toFixed(2)}€
                </span>
                <p className="text-[10px] text-gray-500">{timeAgo}</p>
              </div>
            </Link>
          )
        })
      )}

      {/* Lien voir tout */}
      {orders.length > maxItems && (
        <Link
          href="/admin/commandes"
          className="block text-center text-sm text-[#00b4d8] hover:text-[#00b4d8]/80 transition-colors"
        >
          Voir toutes les commandes
        </Link>
      )}
    </div>
  )
}

// Composant Alertes
interface Alert {
  id: string
  type: 'order' | 'stock' | 'message'
  title: string
  description?: string
  severity: 'info' | 'warning' | 'critical'
  link?: string
  createdAt: string
}

interface AlertsFeedProps {
  alerts: Alert[]
  maxItems?: number
  className?: string
}

const alertConfig = {
  order: { icon: ShoppingBag },
  stock: { icon: TrendingDown },
  message: { icon: Mail },
}

const severityColors = {
  info: '#00b4d8',
  warning: '#ff9500',
  critical: '#ff3366',
}

export function AlertsFeed({ alerts, maxItems = 5, className }: AlertsFeedProps) {
  const displayAlerts = alerts.slice(0, maxItems)

  return (
    <div className={cn('space-y-2', className)}>
      {displayAlerts.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-[#00ff88] opacity-50" />
          <p className="text-sm">Tout est en ordre</p>
        </div>
      ) : (
        displayAlerts.map((alert) => {
          const AlertIcon = alertConfig[alert.type].icon
          const color = severityColors[alert.severity]
          const timeAgo = formatDistanceToNow(new Date(alert.createdAt), {
            addSuffix: true,
            locale: fr,
          })

          const content = (
            <div
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg transition-all',
                'bg-[#1a1a2e]/30 hover:bg-[#1a1a2e]/50',
                'border-l-2'
              )}
              style={{ borderLeftColor: color }}
            >
              {/* Icône */}
              <div
                className="p-1.5 rounded"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {alert.severity === 'critical' ? (
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                ) : (
                  <AlertIcon className="w-4 h-4" />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">{alert.title}</p>
                {alert.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                )}
                <p className="text-[10px] text-gray-600 mt-1">{timeAgo}</p>
              </div>
            </div>
          )

          if (alert.link) {
            return (
              <Link key={alert.id} href={alert.link}>
                {content}
              </Link>
            )
          }

          return <div key={alert.id}>{content}</div>
        })
      )}
    </div>
  )
}
