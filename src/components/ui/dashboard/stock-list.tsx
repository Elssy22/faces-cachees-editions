'use client'

import { cn } from '@/lib/utils'
import { FuelGauge } from './fuel-gauge'
import { AlertTriangle, Package, TrendingDown } from 'lucide-react'
import Link from 'next/link'

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

interface StockListProps {
  items: StockItem[]
  maxItems?: number
  showAll?: boolean
  className?: string
}

export function StockList({
  items,
  maxItems = 5,
  showAll = false,
  className,
}: StockListProps) {
  // Trier par pourcentage de stock (plus bas en premier)
  const sortedItems = [...items].sort((a, b) => {
    const percentA = a.initialStock > 0 ? a.currentStock / a.initialStock : 0
    const percentB = b.initialStock > 0 ? b.currentStock / b.initialStock : 0
    return percentA - percentB
  })

  const displayItems = showAll ? sortedItems : sortedItems.slice(0, maxItems)
  const lowStockCount = items.filter(
    (item) => item.initialStock > 0 && item.currentStock / item.initialStock < 0.2
  ).length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header avec alertes */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ff3366]/10 border border-[#ff3366]/20">
          <AlertTriangle className="w-4 h-4 text-[#ff3366] animate-pulse" />
          <span className="text-sm text-[#ff3366]">
            {lowStockCount} édition{lowStockCount > 1 ? 's' : ''} en stock critique
          </span>
        </div>
      )}

      {/* Liste des stocks */}
      <div className="space-y-3">
        {displayItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune édition en stock</p>
          </div>
        ) : (
          displayItems.map((item) => {
            const percentage = item.initialStock > 0
              ? (item.currentStock / item.initialStock) * 100
              : 0
            const isCritical = percentage < 20

            return (
              <Link
                key={item.id}
                href={`/admin/livres/${item.bookId}`}
                className={cn(
                  'block p-3 rounded-lg transition-all',
                  'bg-[#1a1a2e]/30 hover:bg-[#1a1a2e]/50',
                  'border border-white/5 hover:border-white/10',
                  isCritical && 'border-[#ff3366]/30'
                )}
              >
                <FuelGauge
                  current={item.currentStock}
                  max={item.initialStock}
                  label={item.bookTitle}
                  sublabel={item.formatLabel || item.format}
                  compact
                />
              </Link>
            )
          })
        )}
      </div>

      {/* Lien voir tout */}
      {!showAll && items.length > maxItems && (
        <Link
          href="/admin/livres"
          className="block text-center text-sm text-[#00b4d8] hover:text-[#00b4d8]/80 transition-colors"
        >
          Voir tous les stocks ({items.length} éditions)
        </Link>
      )}
    </div>
  )
}

// Mini version pour sidebar ou widget
interface MiniStockAlertProps {
  criticalCount: number
  warningCount: number
  className?: string
}

export function MiniStockAlert({ criticalCount, warningCount, className }: MiniStockAlertProps) {
  const hasAlerts = criticalCount > 0 || warningCount > 0

  if (!hasAlerts) {
    return (
      <div className={cn('flex items-center gap-2 text-[#00ff88]', className)}>
        <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]" />
        <span className="text-xs">Stock OK</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {criticalCount > 0 && (
        <div className="flex items-center gap-1 text-[#ff3366]">
          <TrendingDown className="w-3 h-3" />
          <span className="text-xs font-medium">{criticalCount} critique{criticalCount > 1 ? 's' : ''}</span>
        </div>
      )}
      {warningCount > 0 && (
        <div className="flex items-center gap-1 text-[#ff9500]">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-xs font-medium">{warningCount} bas</span>
        </div>
      )}
    </div>
  )
}
