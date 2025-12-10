'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TagInput } from '@/components/ui/tag-input'
import { MultiAuthorSelect, BookAuthorEntry } from '@/components/ui/multi-author-select'
import { EditionsManager, BookEditionEntry } from '@/components/ui/editions-manager'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database'

type BookType = Database['public']['Enums']['book_type']
type PublishStatus = Database['public']['Enums']['publish_status']

export default function NewBookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    summary: '',
    cover_image_url: '',
    book_type: 'roman',
    genre: '',
    tags: [] as string[],
    publication_date: '',
    status: 'draft' as 'draft' | 'scheduled' | 'published',
  })

  // Multi-auteurs
  const [authors, setAuthors] = useState<BookAuthorEntry[]>([])

  // Multi-éditions
  const [editions, setEditions] = useState<BookEditionEntry[]>([
    {
      format: 'grand_format',
      price: 0,
      initialStock: 100,
      currentStock: 100,
      isAvailable: true,
      isPreorder: false,
      displayOrder: 0,
    },
  ])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (editions.length === 0) {
      alert('Veuillez ajouter au moins une édition')
      return
    }

    if (editions.some(ed => ed.price <= 0)) {
      alert('Veuillez définir un prix pour chaque édition')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Créer le livre (sans prix car maintenant dans editions)
      // On garde author_id pour la rétro-compatibilité (premier auteur)
      const primaryAuthor = authors.find(a => a.role === 'author') || authors[0]
      const firstEdition = editions[0]

      const bookData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        slug: formData.slug,
        author_id: primaryAuthor?.authorId || null,
        // Prix et stock du livre = première édition (rétro-compatibilité)
        price: firstEdition.price,
        initial_stock: firstEdition.initialStock,
        current_stock: firstEdition.currentStock,
        summary: formData.summary,
        cover_image_url: formData.cover_image_url || null,
        book_type: formData.book_type as BookType,
        genre: formData.genre || null,
        tags: formData.tags,
        page_count: firstEdition.pageCount || null,
        dimensions: firstEdition.dimensions || null,
        format_type: firstEdition.format || null,
        ean: firstEdition.ean || null,
        isbn: firstEdition.isbn || null,
        publication_date: formData.publication_date || null,
        status: formData.status as PublishStatus,
      }

      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert(bookData)
        .select('id')
        .single()

      if (bookError) {
        alert(`Erreur lors de la création du livre: ${bookError.message}`)
        setLoading(false)
        return
      }

      const bookId = book.id

      // 2. Ajouter les relations auteurs
      if (authors.length > 0) {
        const authorRelations = authors.map((author) => ({
          book_id: bookId,
          author_id: author.authorId,
          role: author.role,
          display_order: author.displayOrder,
        }))

        const { error: authorsError } = await supabase
          .from('book_authors')
          .insert(authorRelations)

        if (authorsError) {
          console.error('Erreur ajout auteurs:', authorsError)
        }
      }

      // 3. Ajouter les éditions
      const editionsData = editions.map((edition) => ({
        book_id: bookId,
        format: edition.format,
        format_label: edition.formatLabel || null,
        price: edition.price,
        initial_stock: edition.initialStock,
        current_stock: edition.currentStock,
        page_count: edition.pageCount || null,
        dimensions: edition.dimensions || null,
        weight_grams: edition.weightGrams || null,
        ean: edition.ean || null,
        isbn: edition.isbn || null,
        cover_image_url: edition.coverImageUrl || null,
        is_available: edition.isAvailable,
        is_preorder: edition.isPreorder,
        preorder_date: edition.preorderDate || null,
        display_order: edition.displayOrder,
      }))

      const { error: editionsError } = await supabase
        .from('book_editions')
        .insert(editionsData)

      if (editionsError) {
        console.error('Erreur ajout éditions:', editionsError)
      }

      router.push('/admin/livres')
    } catch (error) {
      console.error('Error:', error)
      alert('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/livres">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-serif text-4xl font-bold">Ajouter un livre</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">
                    Titre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Sous-titre</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="slug">
                    Slug (URL) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    URL: /livres/{formData.slug}
                  </p>
                </div>

                <div>
                  <Label htmlFor="summary">
                    Résumé <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cover_image_url">URL de la couverture</Label>
                  <Input
                    id="cover_image_url"
                    type="url"
                    value={formData.cover_image_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cover_image_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Éditions / Formats */}
            <Card>
              <CardHeader>
                <CardTitle>Éditions / Formats</CardTitle>
                <p className="text-sm text-gray-500">
                  Configurez les différentes éditions de ce livre (grand format, poche, etc.)
                </p>
              </CardHeader>
              <CardContent>
                <EditionsManager
                  value={editions}
                  onChange={setEditions}
                  defaultCoverUrl={formData.cover_image_url}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métadonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="book_type">
                      Type de livre <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="book_type"
                      value={formData.book_type}
                      onChange={(e) =>
                        setFormData({ ...formData, book_type: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      required
                    >
                      <option value="roman">Roman</option>
                      <option value="essai">Essai</option>
                      <option value="revue">Revue</option>
                      <option value="autobiographie">Autobiographie</option>
                      <option value="recueil">Recueil</option>
                      <option value="developpement_personnel">
                        Développement personnel
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <TagInput
                    value={formData.tags}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                    placeholder="Tapez un tag et appuyez sur virgule..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Appuyez sur virgule (,) ou Entrée pour ajouter un tag
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'draft' | 'scheduled' | 'published',
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="scheduled">Programmé</option>
                    <option value="published">Publié</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="publication_date">Date de publication</Label>
                  <Input
                    id="publication_date"
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publication_date: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auteurs</CardTitle>
                <p className="text-sm text-gray-500">
                  Ajoutez un ou plusieurs auteurs avec leur rôle
                </p>
              </CardHeader>
              <CardContent>
                <MultiAuthorSelect
                  value={authors}
                  onChange={setAuthors}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/livres')}
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
