'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

type Author = {
  id: string
  first_name: string
  last_name: string
}

export default function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    author_id: '',
    price: '',
    summary: '',
    cover_image_url: '',
    book_type: 'roman',
    genre: '',
    tags: '',
    page_count: '',
    dimensions: '',
    format_type: '',
    ean: '',
    isbn: '',
    publication_date: '',
    status: 'draft' as 'draft' | 'scheduled' | 'published',
  })

  useEffect(() => {
    loadAuthors()
    loadBook()
  }, [id])

  const loadAuthors = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('authors')
      .select('id, first_name, last_name')
      .order('last_name', { ascending: true })

    if (data) {
      setAuthors(data)
    }
  }

  const loadBook = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        slug: data.slug || '',
        author_id: data.author_id || '',
        price: data.price?.toString() || '',
        summary: data.summary || '',
        cover_image_url: data.cover_image_url || '',
        book_type: data.book_type || 'roman',
        genre: data.genre || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        page_count: data.page_count?.toString() || '',
        dimensions: data.dimensions || '',
        format_type: data.format_type || '',
        ean: data.ean || '',
        isbn: data.isbn || '',
        publication_date: data.publication_date
          ? new Date(data.publication_date).toISOString().split('T')[0]
          : '',
        status: data.status || 'draft',
      })
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      // Préparer les données
      const bookData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        slug: formData.slug,
        author_id: formData.author_id || null,
        price: parseFloat(formData.price),
        summary: formData.summary,
        cover_image_url: formData.cover_image_url || null,
        book_type: formData.book_type,
        genre: formData.genre || null,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        dimensions: formData.dimensions || null,
        format_type: formData.format_type || null,
        ean: formData.ean || null,
        isbn: formData.isbn || null,
        publication_date: formData.publication_date || null,
        status: formData.status,
      }

      const { error } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', id)

      if (error) {
        alert(`Erreur: ${error.message}`)
      } else {
        router.push('/admin/livres')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/livres">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-serif text-4xl font-bold">Modifier le livre</h1>
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
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
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

            <Card>
              <CardHeader>
                <CardTitle>Détails du livre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="ean">EAN</Label>
                    <Input
                      id="ean"
                      value={formData.ean}
                      onChange={(e) =>
                        setFormData({ ...formData, ean: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="page_count">Nombre de pages</Label>
                    <Input
                      id="page_count"
                      type="number"
                      min="1"
                      value={formData.page_count}
                      onChange={(e) =>
                        setFormData({ ...formData, page_count: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) =>
                        setFormData({ ...formData, dimensions: e.target.value })
                      }
                      placeholder="15 x 21 cm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="format_type">Format</Label>
                    <Input
                      id="format_type"
                      value={formData.format_type}
                      onChange={(e) =>
                        setFormData({ ...formData, format_type: e.target.value })
                      }
                      placeholder="Broché, Relié, etc."
                    />
                  </div>

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
                </div>

                <div>
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="fiction, drame, contemporain"
                  />
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
                <CardTitle>Auteur et prix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="author_id">Auteur</Label>
                  <select
                    id="author_id"
                    value={formData.author_id}
                    onChange={(e) =>
                      setFormData({ ...formData, author_id: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionner un auteur</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.first_name} {author.last_name}
                      </option>
                    ))}
                  </select>
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

                <div>
                  <Label htmlFor="price">
                    Prix (€) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/livres')}
                disabled={saving}
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
