'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Save, Star } from 'lucide-react'
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

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)

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

    // Charger le paramètre actuel
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'featured_book')
      .single()

    if (settingData?.value) {
      const value = settingData.value as { book_id: string | null }
      setSelectedBookId(value.book_id)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          value: { book_id: selectedBookId }
        })
        .eq('key', 'featured_book')

      if (error) throw error

      alert('Livre en vedette mis à jour avec succès')
    } catch (error) {
      console.error('Error:', error)
      alert('Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  const selectedBook = books.find(b => b.id === selectedBookId)

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
    </div>
  )
}
