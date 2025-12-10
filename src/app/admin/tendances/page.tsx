'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DashboardCard,
} from '@/components/ui/dashboard'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
  AlertCircle,
  Sparkles,
  BookOpen,
  UserCircle,
  Hash,
  Bell,
  Globe,
  BarChart2,
  Twitter,
  Newspaper,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  searchTrends,
  checkBatchTrends,
  getGoogleTrendsUrl,
  getGoogleNewsUrl,
  getTwitterSearchUrl,
  type NewsArticle,
  type BatchTrendResult,
} from '@/lib/trends'

interface Author {
  id: string
  first_name: string
  last_name: string
}

interface Book {
  id: string
  title: string
  keywords?: string[]
}

interface TrendKeyword {
  id: string
  keyword: string
  type: 'author' | 'book' | 'topic' | 'custom'
  entity_id?: string
  entity_name?: string
  last_checked?: string
  trend_score?: number
  trend_direction?: 'up' | 'down' | 'stable'
  news_count?: number
  search_volume?: string
}

export default function TendancesPage() {
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [keywords, setKeywords] = useState<TrendKeyword[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [selectedKeyword, setSelectedKeyword] = useState<TrendKeyword | null>(null)
  const [newsResults, setNewsResults] = useState<NewsArticle[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [apiStatus, setApiStatus] = useState<{
    newsApi: boolean | null
    googleSearch: boolean | null
    googleRss: boolean | null
  }>({ newsApi: null, googleSearch: null, googleRss: null })

  // Charger les données initiales
  const loadData = useCallback(async () => {
    const supabase = createClient()

    // Charger les auteurs
    const { data: authorsData } = await supabase
      .from('authors')
      .select('id, first_name, last_name')
      .order('last_name')

    if (authorsData) {
      setAuthors(authorsData)
    }

    // Charger les livres
    const { data: booksData } = await supabase
      .from('books')
      .select('id, title')
      .eq('status', 'published')
      .order('title')

    if (booksData) {
      setBooks(booksData)
    }

    // Charger les mots-clés de veille depuis site_settings
    const { data: keywordsData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'trend_keywords')
      .single()

    if (keywordsData?.value) {
      setKeywords(keywordsData.value as TrendKeyword[])
    } else {
      // Créer les mots-clés par défaut à partir des auteurs
      const defaultKeywords: TrendKeyword[] = (authorsData || []).map(author => ({
        id: `author-${author.id}`,
        keyword: `${author.first_name} ${author.last_name}`,
        type: 'author' as const,
        entity_id: author.id,
        entity_name: `${author.first_name} ${author.last_name}`,
      }))
      setKeywords(defaultKeywords)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Sauvegarder les mots-clés
  const saveKeywords = async (newKeywords: TrendKeyword[]) => {
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'trend_keywords')
      .single()

    if (existing) {
      await supabase
        .from('site_settings')
        .update({ value: newKeywords })
        .eq('key', 'trend_keywords')
    } else {
      await supabase
        .from('site_settings')
        .insert({
          key: 'trend_keywords',
          value: newKeywords,
          description: 'Mots-clés pour la veille des tendances'
        })
    }
  }

  // Ajouter un mot-clé personnalisé
  const addCustomKeyword = async () => {
    if (!newKeyword.trim()) return

    const keyword: TrendKeyword = {
      id: `custom-${Date.now()}`,
      keyword: newKeyword.trim(),
      type: 'custom',
    }

    const newKeywords = [...keywords, keyword]
    setKeywords(newKeywords)
    await saveKeywords(newKeywords)
    setNewKeyword('')
  }

  // Supprimer un mot-clé
  const removeKeyword = async (id: string) => {
    const newKeywords = keywords.filter(k => k.id !== id)
    setKeywords(newKeywords)
    await saveKeywords(newKeywords)
  }

  // Ajouter tous les auteurs comme mots-clés
  const addAllAuthors = async () => {
    const authorKeywords: TrendKeyword[] = authors
      .filter(author => !keywords.some(k => k.entity_id === author.id && k.type === 'author'))
      .map(author => ({
        id: `author-${author.id}`,
        keyword: `${author.first_name} ${author.last_name}`,
        type: 'author' as const,
        entity_id: author.id,
        entity_name: `${author.first_name} ${author.last_name}`,
      }))

    const newKeywords = [...keywords, ...authorKeywords]
    setKeywords(newKeywords)
    await saveKeywords(newKeywords)
  }

  // Ajouter tous les titres de livres
  const addAllBooks = async () => {
    const bookKeywords: TrendKeyword[] = books
      .filter(book => !keywords.some(k => k.entity_id === book.id && k.type === 'book'))
      .map(book => ({
        id: `book-${book.id}`,
        keyword: book.title,
        type: 'book' as const,
        entity_id: book.id,
        entity_name: book.title,
      }))

    const newKeywords = [...keywords, ...bookKeywords]
    setKeywords(newKeywords)
    await saveKeywords(newKeywords)
  }

  // Vérifier les tendances avec l'API
  const checkTrends = async () => {
    if (keywords.length === 0) return

    setChecking(true)

    try {
      // Appeler l'API pour vérifier tous les mots-clés
      const keywordStrings = keywords.map(k => k.keyword)
      const results = await checkBatchTrends(keywordStrings)

      // Mettre à jour les mots-clés avec les résultats
      const updatedKeywords = keywords.map(keyword => {
        const result = results.find((r: BatchTrendResult) => r.keyword === keyword.keyword)
        if (result) {
          return {
            ...keyword,
            last_checked: new Date().toISOString(),
            trend_score: result.trend_score,
            trend_direction: result.trend_direction,
            news_count: result.news_count,
          }
        }
        return keyword
      })

      setKeywords(updatedKeywords)
      await saveKeywords(updatedKeywords)

      // Mettre à jour le statut des APIs
      const hasResults = results.some((r: BatchTrendResult) => r.news_count > 0)
      setApiStatus(prev => ({
        ...prev,
        googleRss: hasResults,
      }))
    } catch (error) {
      console.error('Error checking trends:', error)
    }

    setChecking(false)
  }

  // Rechercher des actualités pour un mot-clé
  const searchNews = async (keyword: TrendKeyword) => {
    setSelectedKeyword(keyword)
    setLoadingNews(true)
    setNewsResults([])

    try {
      const result = await searchTrends(keyword.keyword)
      setNewsResults(result.news)

      // Mettre à jour le mot-clé avec les nouvelles données
      const updatedKeywords = keywords.map(k =>
        k.id === keyword.id
          ? {
              ...k,
              last_checked: new Date().toISOString(),
              trend_score: result.trend_score,
              trend_direction: result.trend_direction,
              news_count: result.news_count,
            }
          : k
      )
      setKeywords(updatedKeywords)
      await saveKeywords(updatedKeywords)
    } catch (error) {
      console.error('Error searching news:', error)
      setNewsResults([])
    }

    setLoadingNews(false)
  }

  // Obtenir l'icône selon le type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'author':
        return <UserCircle className="w-4 h-4" />
      case 'book':
        return <BookOpen className="w-4 h-4" />
      case 'topic':
        return <Hash className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  // Obtenir l'icône de tendance
  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-[#00ff88]" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-[#ff3366]" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  // Obtenir la couleur du score
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 70) return 'text-[#00ff88]'
    if (score >= 40) return 'text-[#ff9500]'
    return 'text-[#ff3366]'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00b4d8]/30 border-t-[#00b4d8] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement...</p>
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
            Veille des Tendances
          </h1>
          <p className="text-gray-500">
            Surveillez les mentions de vos auteurs et sujets dans l'actualité
          </p>
        </div>

        <Button
          onClick={checkTrends}
          disabled={checking || keywords.length === 0}
          className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6]"
        >
          {checking ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Vérification...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Vérifier les tendances
            </>
          )}
        </Button>
      </div>

      {/* Statut des APIs */}
      <DashboardCard neonColor="blue" className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-gray-400">Sources de données :</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">NewsAPI</span>
            {apiStatus.newsApi === true && <CheckCircle className="w-4 h-4 text-[#00ff88]" />}
            {apiStatus.newsApi === false && <XCircle className="w-4 h-4 text-[#ff3366]" />}
            {apiStatus.newsApi === null && <Minus className="w-4 h-4 text-gray-500" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Google Search</span>
            {apiStatus.googleSearch === true && <CheckCircle className="w-4 h-4 text-[#00ff88]" />}
            {apiStatus.googleSearch === false && <XCircle className="w-4 h-4 text-[#ff3366]" />}
            {apiStatus.googleSearch === null && <Minus className="w-4 h-4 text-gray-500" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Google News RSS</span>
            {apiStatus.googleRss === true && <CheckCircle className="w-4 h-4 text-[#00ff88]" />}
            {apiStatus.googleRss === false && <XCircle className="w-4 h-4 text-[#ff3366]" />}
            {apiStatus.googleRss === null && <Minus className="w-4 h-4 text-gray-500" />}
          </div>
        </div>
      </DashboardCard>

      {/* Alerte configuration */}
      <DashboardCard neonColor="orange" className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#ff9500] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              <strong>Configuration des APIs :</strong> Pour des résultats optimaux, configurez les clés API dans votre fichier <code className="text-[#00b4d8]">.env.local</code>
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• <code>NEWSAPI_KEY</code> - <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="text-[#00b4d8] hover:underline">newsapi.org</a> (gratuit: 100 req/jour)</li>
              <li>• <code>GOOGLE_CUSTOM_SEARCH_KEY</code> + <code>GOOGLE_SEARCH_ENGINE_ID</code> - <a href="https://developers.google.com/custom-search" target="_blank" rel="noopener noreferrer" className="text-[#00b4d8] hover:underline">Google Custom Search</a></li>
              <li>• <code>SERPAPI_KEY</code> (optionnel) - <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-[#00b4d8] hover:underline">SerpAPI</a> pour Google Trends</li>
            </ul>
            <p className="text-xs text-gray-500">
              Sans configuration, le système utilise Google News RSS (gratuit et illimité).
            </p>
          </div>
        </div>
      </DashboardCard>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste des mots-clés surveillés */}
        <div className="lg:col-span-2 space-y-4">
          <DashboardCard
            title="Mots-clés surveillés"
            icon={<Bell className="w-4 h-4" />}
            neonColor="blue"
          >
            {/* Actions rapides */}
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-[#2a2a3e]">
              <Button
                variant="outline"
                size="sm"
                onClick={addAllAuthors}
                className="text-xs"
              >
                <UserCircle className="w-3 h-3 mr-1" />
                + Tous les auteurs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addAllBooks}
                className="text-xs"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                + Tous les livres
              </Button>
            </div>

            {/* Liste des mots-clés */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {keywords.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucun mot-clé configuré. Ajoutez des auteurs ou des sujets à surveiller.
                </p>
              ) : (
                keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedKeyword?.id === keyword.id
                        ? 'bg-[#00b4d8]/10 border-[#00b4d8]'
                        : 'bg-[#0a0a0a] border-[#2a2a3e] hover:border-[#3a3a4e]'
                    }`}
                    onClick={() => searchNews(keyword)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {getTypeIcon(keyword.type)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-200">{keyword.keyword}</p>
                        <p className="text-xs text-gray-500">
                          {keyword.type === 'author' && 'Auteur'}
                          {keyword.type === 'book' && 'Livre'}
                          {keyword.type === 'topic' && 'Sujet'}
                          {keyword.type === 'custom' && 'Personnalisé'}
                          {keyword.last_checked && ` • Vérifié ${new Date(keyword.last_checked).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {keyword.trend_score !== undefined && (
                        <div className="flex items-center gap-1">
                          {getTrendIcon(keyword.trend_direction)}
                          <span className={`text-sm font-mono ${getScoreColor(keyword.trend_score)}`}>
                            {keyword.trend_score}
                          </span>
                        </div>
                      )}
                      {keyword.news_count !== undefined && keyword.news_count > 0 && (
                        <span className="text-xs bg-[#00b4d8]/20 text-[#00b4d8] px-2 py-0.5 rounded">
                          {keyword.news_count} article{keyword.news_count > 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeKeyword(keyword.id)
                        }}
                        className="text-gray-500 hover:text-[#ff3366] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ajouter un mot-clé personnalisé */}
            <div className="mt-4 pt-4 border-t border-[#2a2a3e]">
              <Label className="text-xs text-gray-400 mb-2 block">Ajouter un sujet personnalisé</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Ex: développement personnel, thriller..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomKeyword()}
                />
                <Button onClick={addCustomKeyword} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Résultats de recherche */}
        <div className="space-y-4">
          <DashboardCard
            title="Actualités"
            icon={<Globe className="w-4 h-4" />}
            neonColor="green"
          >
            {loadingNews ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 text-[#00b4d8] animate-spin" />
              </div>
            ) : selectedKeyword ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Résultats pour <span className="text-[#00b4d8]">"{selectedKeyword.keyword}"</span>
                </p>

                {/* Liens rapides */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={getGoogleNewsUrl(selectedKeyword.keyword)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    <Newspaper className="w-3 h-3" />
                    Google News
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={getGoogleTrendsUrl(selectedKeyword.keyword)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    <BarChart2 className="w-3 h-3" />
                    Google Trends
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={getTwitterSearchUrl(selectedKeyword.keyword)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    <Twitter className="w-3 h-3" />
                    Twitter/X
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {newsResults.length > 0 ? (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {newsResults.map((news, index) => (
                      <div
                        key={index}
                        className="p-3 bg-[#0a0a0a] rounded-lg border border-[#2a2a3e] hover:border-[#3a3a4e] transition-colors"
                      >
                        <a
                          href={news.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-200 hover:text-[#00b4d8] transition-colors flex items-start gap-2"
                        >
                          <span className="flex-1 line-clamp-2">{news.title}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0 mt-1" />
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          {news.source} • {news.date}
                        </p>
                        {news.snippet && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                            {news.snippet}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Aucune actualité récente trouvée
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Sélectionnez un mot-clé pour voir les actualités</p>
              </div>
            )}
          </DashboardCard>

          {/* Conseils */}
          <Card className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-[#2a2a3e]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff9500]" />
                Conseils
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-gray-400 space-y-2">
                <li>• Surveillez régulièrement les tendances de vos auteurs</li>
                <li>• Ajoutez des sujets liés à vos livres (genres, thèmes)</li>
                <li>• Utilisez les tendances pour planifier votre communication</li>
                <li>• Réagissez rapidement aux pics d'intérêt</li>
                <li>• Un score élevé indique une forte présence médiatique</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
