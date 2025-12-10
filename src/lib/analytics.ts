'use client'

import { createClient } from '@/lib/supabase-browser'

// Générer un ID unique pour le visiteur (persistant dans localStorage)
function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem('fce_visitor_id')
  if (!visitorId) {
    visitorId = 'v_' + crypto.randomUUID()
    localStorage.setItem('fce_visitor_id', visitorId)
  }
  return visitorId
}

// Générer un ID de session (nouveau à chaque visite)
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('fce_session_id')
  if (!sessionId) {
    sessionId = 's_' + crypto.randomUUID()
    sessionStorage.setItem('fce_session_id', sessionId)
  }
  return sessionId
}

// Détecter le type d'appareil
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

// Détecter le navigateur
function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  return 'Other'
}

// Détecter l'OS
function getOS(): string {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Other'
}

// Extraire les paramètres UTM de l'URL
function getUTMParams(): { source?: string; medium?: string; campaign?: string } {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
  }
}

// Variable pour tracker le temps sur la page
let pageLoadTime: number = Date.now()
let lastPagePath: string = ''

// Initialiser ou récupérer la session
async function initSession(): Promise<void> {
  if (typeof window === 'undefined') return

  const sessionId = getSessionId()
  const visitorId = getVisitorId()
  const utmParams = getUTMParams()

  // Vérifier si la session a déjà été initialisée
  const sessionInitialized = sessionStorage.getItem('fce_session_initialized')
  if (sessionInitialized) return

  try {
    const supabase = createClient()

    await supabase.rpc('get_or_create_session', {
      p_session_id: sessionId,
      p_visitor_id: visitorId,
      p_referrer: document.referrer || null,
      p_utm_source: utmParams.source || null,
      p_utm_medium: utmParams.medium || null,
      p_utm_campaign: utmParams.campaign || null,
      p_user_agent: navigator.userAgent,
      p_device_type: getDeviceType(),
      p_browser: getBrowser(),
      p_os: getOS(),
    })

    sessionStorage.setItem('fce_session_initialized', 'true')
  } catch (error) {
    console.error('Failed to init analytics session:', error)
  }
}

// Interface pour les événements
interface TrackEventOptions {
  eventType: string
  pagePath: string
  pageTitle?: string
  entityType?: string
  entityId?: string
  entityName?: string
  eventData?: Record<string, unknown>
}

// Tracker un événement
async function trackEvent(options: TrackEventOptions): Promise<void> {
  if (typeof window === 'undefined') return

  const sessionId = getSessionId()
  const visitorId = getVisitorId()

  // Calculer le temps sur la page précédente
  let timeOnPreviousPage: number | null = null
  if (options.eventType === 'page_view' && lastPagePath) {
    timeOnPreviousPage = Math.round((Date.now() - pageLoadTime) / 1000)
  }

  try {
    const supabase = createClient()

    await supabase.rpc('track_event', {
      p_session_id: sessionId,
      p_visitor_id: visitorId,
      p_event_type: options.eventType,
      p_page_path: options.pagePath,
      p_page_title: options.pageTitle || document.title,
      p_entity_type: options.entityType || null,
      p_entity_id: options.entityId || null,
      p_entity_name: options.entityName || null,
      p_event_data: options.eventData || {},
      p_time_on_previous_page: timeOnPreviousPage,
    })

    // Mettre à jour les variables de tracking
    if (options.eventType === 'page_view') {
      lastPagePath = options.pagePath
      pageLoadTime = Date.now()
    }
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

// Tracker une page vue
export async function trackPageView(options?: {
  entityType?: string
  entityId?: string
  entityName?: string
}): Promise<void> {
  if (typeof window === 'undefined') return

  // S'assurer que la session est initialisée
  await initSession()

  await trackEvent({
    eventType: 'page_view',
    pagePath: window.location.pathname,
    pageTitle: document.title,
    entityType: options?.entityType,
    entityId: options?.entityId,
    entityName: options?.entityName,
  })
}

// Tracker un clic
export async function trackClick(options: {
  element: string
  entityType?: string
  entityId?: string
  entityName?: string
  data?: Record<string, unknown>
}): Promise<void> {
  if (typeof window === 'undefined') return

  await trackEvent({
    eventType: 'click',
    pagePath: window.location.pathname,
    entityType: options.entityType,
    entityId: options.entityId,
    entityName: options.entityName,
    eventData: {
      element: options.element,
      ...options.data,
    },
  })
}

// Tracker un ajout au panier
export async function trackAddToCart(options: {
  bookId: string
  bookTitle: string
  price: number
  quantity: number
}): Promise<void> {
  if (typeof window === 'undefined') return

  await trackEvent({
    eventType: 'add_to_cart',
    pagePath: window.location.pathname,
    entityType: 'book',
    entityId: options.bookId,
    entityName: options.bookTitle,
    eventData: {
      price: options.price,
      quantity: options.quantity,
    },
  })
}

// Tracker un achat
export async function trackPurchase(options: {
  orderId: string
  orderNumber: string
  totalAmount: number
  items: Array<{ bookId: string; title: string; quantity: number; price: number }>
}): Promise<void> {
  if (typeof window === 'undefined') return

  await trackEvent({
    eventType: 'purchase',
    pagePath: window.location.pathname,
    eventData: {
      orderId: options.orderId,
      orderNumber: options.orderNumber,
      totalAmount: options.totalAmount,
      items: options.items,
    },
  })
}

// Tracker une inscription newsletter
export async function trackNewsletterSignup(email: string): Promise<void> {
  if (typeof window === 'undefined') return

  await trackEvent({
    eventType: 'newsletter_signup',
    pagePath: window.location.pathname,
    eventData: {
      email_domain: email.split('@')[1],
    },
  })
}

// Tracker une recherche
export async function trackSearch(query: string, resultsCount: number): Promise<void> {
  if (typeof window === 'undefined') return

  await trackEvent({
    eventType: 'search',
    pagePath: window.location.pathname,
    eventData: {
      query,
      resultsCount,
    },
  })
}

// Exporter les fonctions utilitaires
export const analytics = {
  trackPageView,
  trackClick,
  trackAddToCart,
  trackPurchase,
  trackNewsletterSignup,
  trackSearch,
  getVisitorId,
  getSessionId,
}

export default analytics
