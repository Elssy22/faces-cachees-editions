'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

interface AnalyticsTrackerProps {
  entityType?: string
  entityId?: string
  entityName?: string
}

export function AnalyticsTracker({ entityType, entityId, entityName }: AnalyticsTrackerProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Tracker la page vue
    trackPageView({
      entityType,
      entityId,
      entityName,
    })
  }, [pathname, entityType, entityId, entityName])

  return null
}

// Composant pour tracker automatiquement sur changement de route
export function GlobalAnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Ne pas tracker les pages admin
    if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
      return
    }

    // Déterminer le type d'entité basé sur le pathname
    let entityType: string | undefined
    let entityId: string | undefined

    // Pages de livres: /livres/[slug]
    if (pathname.match(/^\/livres\/[^/]+$/)) {
      entityType = 'book'
      // L'ID sera récupéré par le composant de la page
    }
    // Pages d'auteurs: /auteurs/[slug]
    else if (pathname.match(/^\/auteurs\/[^/]+$/)) {
      entityType = 'author'
    }
    // Pages d'événements: /evenements/[id]
    else if (pathname.match(/^\/evenements\/[^/]+$/)) {
      entityType = 'event'
    }

    trackPageView({
      entityType,
      entityId,
    })
  }, [pathname])

  return null
}

export default AnalyticsTracker
