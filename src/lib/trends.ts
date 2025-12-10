// Service client pour l'API de tendances

export interface NewsArticle {
  title: string
  link: string
  source: string
  date: string
  snippet: string
  image?: string
}

export interface TrendResult {
  keyword: string
  news: NewsArticle[]
  trend_score: number
  trend_direction: 'up' | 'down' | 'stable'
  news_count: number
  search_volume?: string
}

export interface BatchTrendResult {
  keyword: string
  news_count: number
  trend_score: number
  trend_direction: 'up' | 'down' | 'stable'
  has_news: boolean
}

/**
 * Recherche les tendances et actualités pour un mot-clé
 */
export async function searchTrends(keyword: string): Promise<TrendResult> {
  const response = await fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}`)

  if (!response.ok) {
    throw new Error('Failed to fetch trends')
  }

  return response.json()
}

/**
 * Vérifie les tendances pour plusieurs mots-clés à la fois
 */
export async function checkBatchTrends(keywords: string[]): Promise<BatchTrendResult[]> {
  const response = await fetch('/api/trends', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keywords }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch batch trends')
  }

  const data = await response.json()
  return data.results
}

/**
 * Génère l'URL Google Trends pour un mot-clé
 */
export function getGoogleTrendsUrl(keyword: string): string {
  return `https://trends.google.fr/trends/explore?q=${encodeURIComponent(keyword)}&geo=FR`
}

/**
 * Génère l'URL Google News pour un mot-clé
 */
export function getGoogleNewsUrl(keyword: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=nws`
}

/**
 * Génère l'URL Twitter/X Search pour un mot-clé
 */
export function getTwitterSearchUrl(keyword: string): string {
  return `https://twitter.com/search?q=${encodeURIComponent(keyword)}&f=live`
}

/**
 * Calcule un score de tendance basé sur les données disponibles
 */
export function calculateTrendScore(newsCount: number, baseScore: number): number {
  // Ajuster le score en fonction du nombre d'actualités
  let adjustedScore = baseScore

  if (newsCount > 10) adjustedScore += 20
  else if (newsCount > 5) adjustedScore += 10
  else if (newsCount > 0) adjustedScore += 5

  return Math.min(100, Math.max(0, adjustedScore))
}

/**
 * Formate une date relative en français
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR')
}
