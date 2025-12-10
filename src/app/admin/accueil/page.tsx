'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Save, Star, Youtube } from 'lucide-react'
import Image from 'next/image'

type Book = {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  authors?: {
    first_name: string
    last_name: string
  } | null
}

// Helper pour extraire l'ID YouTube d'une URL
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingVideo, setSavingVideo] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    // Charger tous les livres publiés
    const { data: booksData } = await supabase
      .from('books')
      .select(`
        id,
        title,
        slug,
        cover_image_url,
        authors (first_name, last_name)
      `)
      .eq('status', 'published')
      .order('title', { ascending: true })

    if (booksData) {
      setBooks(booksData)
    }

    // Charger le paramètre actuel du livre
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'featured_book')
      .single()

    if (settingData?.value) {
      const value = settingData.value as { book_id: string | null }
      setSelectedBookId(value.book_id)
    }

    // Charger le paramètre de la vidéo
    const { data: videoData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'featured_video')
      .single()

    if (videoData?.value) {
      const value = videoData.value as { url?: string; title?: string }
      setVideoUrl(value.url || '')
      setVideoTitle(value.title || '')
    }

    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      // Vérifier si l'entrée existe
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'featured_book')
        .single()

      let error
      if (existing) {
        // Update si existe
        const result = await supabase
          .from('site_settings')
          .update({ value: { book_id: selectedBookId } })
          .eq('key', 'featured_book')
        error = result.error
      } else {
        // Insert si n'existe pas
        const result = await supabase
          .from('site_settings')
          .insert({
            key: 'featured_book',
            value: { book_id: selectedBookId },
            description: 'ID du livre mis en vedette sur la page d\'accueil'
          })
        error = result.error
      }

      if (error) throw error

      alert('Livre en vedette mis à jour avec succès')
    } catch (error: unknown) {
      console.error('Error:', error)
      const message = error instanceof Error ? error.message : JSON.stringify(error)
      alert(`Une erreur est survenue: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveVideo = async () => {
    setSavingVideo(true)
    const supabase = createClient()

    try {
      // Vérifier si l'entrée existe
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'featured_video')
        .single()

      const videoValue = {
        url: videoUrl.trim() || null,
        title: videoTitle.trim() || 'Vidéo à la une',
      }

      let error
      if (existing) {
        // Update si existe
        const result = await supabase
          .from('site_settings')
          .update({ value: videoValue })
          .eq('key', 'featured_video')
        error = result.error
      } else {
        // Insert si n'existe pas
        const result = await supabase
          .from('site_settings')
          .insert({
            key: 'featured_video',
            value: videoValue,
            description: 'Vidéo YouTube mise en avant sur la page d\'accueil'
          })
        error = result.error
      }

      if (error) throw error

      alert('Vidéo mise à jour avec succès')
    } catch (error: unknown) {
      console.error('Error:', error)
      const message = error instanceof Error ? error.message : JSON.stringify(error)
      alert(`Une erreur est survenue: ${message}`)
    } finally {
      setSavingVideo(false)
    }
  }

  const selectedBook = books.find(b => b.id === selectedBookId)
  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null

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
          Gestion de la page d'accueil
        </h1>
        <p className="text-gray-600">
          Configurez le livre mis en vedette qui apparaît en haut de la page d'accueil
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sélection du livre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Livre en vedette
            </CardTitle>
            <CardDescription>
              Sélectionnez le livre à mettre en avant sur la page d'accueil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="featured_book">Choisir un livre</Label>
              <select
                id="featured_book"
                value={selectedBookId || ''}
                onChange={(e) => setSelectedBookId(e.target.value || null)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">-- Aucun livre en vedette --</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                    {book.authors && ` - ${book.authors.first_name} ${book.authors.last_name}`}
                    {!book.cover_image_url && ' (sans couverture)'}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </CardContent>
        </Card>

        {/* Aperçu du livre sélectionné */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu</CardTitle>
            <CardDescription>
              Voici comment le livre apparaîtra sur la page d'accueil
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedBook ? (
              <div className="flex gap-4">
                <div className="relative w-32 h-48 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                  {selectedBook.cover_image_url ? (
                    <Image
                      src={selectedBook.cover_image_url}
                      alt={selectedBook.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 text-xs text-center p-2">
                      Pas de couverture
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold">{selectedBook.title}</h3>
                  {selectedBook.authors && (
                    <p className="text-gray-600 mt-1">
                      Par {selectedBook.authors.first_name} {selectedBook.authors.last_name}
                    </p>
                  )}
                  {!selectedBook.cover_image_url && (
                    <p className="mt-4 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
                      ⚠️ Ce livre n'a pas de couverture. Ajoutez une image de couverture dans la gestion des livres.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun livre sélectionné</p>
                <p className="text-sm mt-1">La section "À découvrir" ne sera pas affichée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liste des livres avec couvertures */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Livres avec couverture</CardTitle>
          <CardDescription>
            Cliquez sur un livre pour le sélectionner comme livre en vedette
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {books.filter(b => b.cover_image_url).map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
                className={`relative aspect-[2/3] rounded overflow-hidden border-2 transition-all ${
                  selectedBookId === book.id
                    ? 'border-black ring-2 ring-black ring-offset-2'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image
                  src={book.cover_image_url!}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
                {selectedBookId === book.id && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {books.filter(b => b.cover_image_url).length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Aucun livre avec couverture. Ajoutez des couvertures à vos livres dans la gestion des livres.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section Vidéo YouTube */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              Vidéo à la une
            </CardTitle>
            <CardDescription>
              Ajoutez une vidéo YouTube qui sera affichée sur la page d'accueil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video_title">Titre de la section</Label>
              <Input
                id="video_title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Ex: Découvrez notre maison d'édition"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="video_url">URL de la vidéo YouTube</Label>
              <Input
                id="video_url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formats acceptés : youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
              </p>
            </div>

            <Button onClick={handleSaveVideo} disabled={savingVideo} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {savingVideo ? 'Enregistrement...' : 'Enregistrer la vidéo'}
            </Button>
          </CardContent>
        </Card>

        {/* Aperçu de la vidéo */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu de la vidéo</CardTitle>
            <CardDescription>
              Voici comment la vidéo apparaîtra sur la page d'accueil
            </CardDescription>
          </CardHeader>
          <CardContent>
            {youtubeId ? (
              <div className="space-y-3">
                <p className="font-serif text-lg font-bold text-center">
                  {videoTitle || 'Vidéo à la une'}
                </p>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={videoTitle || 'Vidéo YouTube'}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Youtube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune vidéo configurée</p>
                <p className="text-sm mt-1">
                  {videoUrl ? 'URL invalide - vérifiez le format' : 'Entrez une URL YouTube pour voir l\'aperçu'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
