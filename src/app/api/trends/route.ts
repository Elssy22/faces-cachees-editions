import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// ============================================================================
// SÉCURITÉ: Rate limiting en mémoire (simple, pour production utiliser Redis)
// ============================================================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20 // 20 requêtes par minute par IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  record.count++
  return true
}

// Nettoyer les vieux enregistrements toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60 * 1000)

// ============================================================================
// SÉCURITÉ: Validation des entrées
// ============================================================================
const MAX_KEYWORD_LENGTH = 100
const ALLOWED_KEYWORD_PATTERN = /^[\p{L}\p{N}\s\-'.,!?]+$/u // Lettres, chiffres, espaces, ponctuation basique

function sanitizeKeyword(keyword: string): string | null {
  if (!keyword || typeof keyword !== 'string') {
    return null
  }

  const trimmed = keyword.trim()

  if (trimmed.length === 0 || trimmed.length > MAX_KEYWORD_LENGTH) {
    return null
  }

  if (!ALLOWED_KEYWORD_PATTERN.test(trimmed)) {
    return null
  }

  // Échapper les caractères spéciaux pour les requêtes
  return trimmed
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ============================================================================
// Types
// ============================================================================
interface NewsArticle {
  title: string
  link: string
  source: string
  date: string
  snippet: string
  image?: string
}

interface TrendResult {
  keyword: string
  news: NewsArticle[]
  trend_score: number
  trend_direction: 'up' | 'down' | 'stable'
  news_count: number
  search_volume?: string
}

// ============================================================================
// API Sources
// ============================================================================

// NewsAPI - https://newsapi.org (gratuit: 100 requêtes/jour)
async function fetchFromNewsAPI(keyword: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY
  if (!apiKey) {
    return []
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(keyword)}&` +
      `language=fr&` +
      `sortBy=publishedAt&` +
      `pageSize=10`,
      {
        headers: {
          'X-Api-Key': apiKey,
        },
        next: { revalidate: 3600 } // Cache 1 heure
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()

    return (data.articles || []).map((article: any) => ({
      title: String(article.title || '').slice(0, 200),
      link: String(article.url || '#').slice(0, 500),
      source: String(article.source?.name || 'Source inconnue').slice(0, 100),
      date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR') : '',
      snippet: String(article.description || '').slice(0, 300),
      image: article.urlToImage ? String(article.urlToImage).slice(0, 500) : undefined,
    }))
  } catch (error) {
    console.error('NewsAPI fetch error:', error)
    return []
  }
}

// Google Custom Search API
async function fetchFromGoogleSearch(keyword: string): Promise<NewsArticle[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    return []
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?` +
      `key=${apiKey}&` +
      `cx=${searchEngineId}&` +
      `q=${encodeURIComponent(keyword)}&` +
      `lr=lang_fr&` +
      `dateRestrict=m1&` +
      `num=10`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()

    return (data.items || []).map((item: any) => {
      let hostname = 'unknown'
      try {
        hostname = new URL(item.link).hostname.replace('www.', '')
      } catch {}

      return {
        title: String(item.title || '').slice(0, 200),
        link: String(item.link || '#').slice(0, 500),
        source: hostname.slice(0, 100),
        date: item.pagemap?.metatags?.[0]?.['article:published_time']
          ? new Date(item.pagemap.metatags[0]['article:published_time']).toLocaleDateString('fr-FR')
          : 'Récent',
        snippet: String(item.snippet || '').slice(0, 300),
        image: item.pagemap?.cse_image?.[0]?.src ? String(item.pagemap.cse_image[0].src).slice(0, 500) : undefined,
      }
    })
  } catch (error) {
    console.error('Google Search fetch error:', error)
    return []
  }
}

// SerpAPI pour Google Trends (optionnel)
async function fetchTrendScore(keyword: string): Promise<{ score: number; direction: 'up' | 'down' | 'stable' }> {
  const apiKey = process.env.SERPAPI_KEY

  if (!apiKey) {
    return { score: 50, direction: 'stable' }
  }

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?` +
      `engine=google_trends&` +
      `q=${encodeURIComponent(keyword)}&` +
      `data_type=TIMESERIES&` +
      `api_key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) {
      return { score: 50, direction: 'stable' }
    }

    const data = await response.json()
    const timelineData = data.interest_over_time?.timeline_data || []

    if (timelineData.length < 2) {
      return { score: 50, direction: 'stable' }
    }

    const recentValues = timelineData.slice(-4).map((d: any) => d.values?.[0]?.extracted_value || 0)
    const olderValues = timelineData.slice(-8, -4).map((d: any) => d.values?.[0]?.extracted_value || 0)

    const recentAvg = recentValues.reduce((a: number, b: number) => a + b, 0) / recentValues.length
    const olderAvg = olderValues.reduce((a: number, b: number) => a + b, 0) / olderValues.length

    let direction: 'up' | 'down' | 'stable' = 'stable'
    if (recentAvg > olderAvg * 1.1) direction = 'up'
    else if (recentAvg < olderAvg * 0.9) direction = 'down'

    return { score: Math.round(recentAvg), direction }
  } catch (error) {
    return { score: 50, direction: 'stable' }
  }
}

// Google News RSS (gratuit)
async function fetchFromGoogleNewsRSS(keyword: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=fr&gl=FR&ceid=FR:fr`,
      { next: { revalidate: 1800 } }
    )

    if (!response.ok) {
      return []
    }

    const xml = await response.text()

    const items: NewsArticle[] = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

    for (const match of itemMatches) {
      const itemContent = match[1]
      const title = itemContent.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '') || ''
      const link = itemContent.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '#'
      const pubDate = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || ''
      const source = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Google News'

      items.push({
        title: title.trim().slice(0, 200),
        link: link.trim().slice(0, 500),
        source: source.trim().slice(0, 100),
        date: pubDate ? new Date(pubDate).toLocaleDateString('fr-FR') : 'Récent',
        snippet: '',
      })

      if (items.length >= 10) break
    }

    return items
  } catch (error) {
    console.error('Google News RSS error:', error)
    return []
  }
}

// ============================================================================
// API Endpoints
// ============================================================================

export async function GET(request: NextRequest) {
  // Récupérer l'IP pour le rate limiting
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown'

  // Vérifier le rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const rawKeyword = searchParams.get('keyword')

  // Valider et sanitizer le keyword
  const keyword = sanitizeKeyword(rawKeyword || '')
  if (!keyword) {
    return NextResponse.json(
      { error: 'Invalid keyword. Must be 1-100 characters, alphanumeric.' },
      { status: 400 }
    )
  }

  try {
    let news: NewsArticle[] = []

    // 1. NewsAPI
    news = await fetchFromNewsAPI(keyword)

    // 2. Google Custom Search
    if (news.length === 0) {
      news = await fetchFromGoogleSearch(keyword)
    }

    // 3. Fallback: Google News RSS
    if (news.length === 0) {
      news = await fetchFromGoogleNewsRSS(keyword)
    }

    const { score, direction } = await fetchTrendScore(keyword)

    const result: TrendResult = {
      keyword,
      news,
      trend_score: score,
      trend_direction: direction,
      news_count: news.length,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Trends API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  try {
    // Limiter la taille du body
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10000) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      )
    }

    const body = await request.json()
    const { keywords } = body

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Keywords array is required' },
        { status: 400 }
      )
    }

    // Limiter et valider les mots-clés
    const validKeywords = keywords
      .slice(0, 10)
      .map(k => sanitizeKeyword(String(k)))
      .filter((k): k is string => k !== null)

    if (validKeywords.length === 0) {
      return NextResponse.json(
        { error: 'No valid keywords provided' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      validKeywords.map(async (keyword: string) => {
        const news = await fetchFromGoogleNewsRSS(keyword)
        const { score, direction } = await fetchTrendScore(keyword)

        return {
          keyword,
          news_count: news.length,
          trend_score: score,
          trend_direction: direction,
          has_news: news.length > 0,
        }
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Batch trends error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batch trends' },
      { status: 500 }
    )
  }
}
