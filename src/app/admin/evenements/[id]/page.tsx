'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

type Author = {
  id: string
  first_name: string
  last_name: string
}

type Book = {
  id: string
  title: string
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    address: '',
    event_url: '',
    image_url: '',
    author_id: '',
    book_id: '',
    published: false,
  })

  useEffect(() => {
    loadAuthors()
    loadBooks()
    loadEvent()
  }, [id])

  const loadAuthors = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('authors')
      .select('id, first_name, last_name')
      .order('last_name', { ascending: true })
    if (data) setAuthors(data)
  }

  const loadBooks = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('books')
      .select('id, title')
      .order('title', { ascending: true })
    if (data) setBooks(data)
  }

  const loadEvent = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        event_date: data.event_date
          ? new Date(data.event_date).toISOString().slice(0, 16)
          : '',
        end_date: data.end_date
          ? new Date(data.end_date).toISOString().slice(0, 16)
          : '',
        location: data.location || '',
        address: data.address || '',
        event_url: data.event_url || '',
        image_url: data.image_url || '',
        author_id: data.author_id || '',
        book_id: data.book_id || '',
        published: data.published || false,
      })
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date,
        end_date: formData.end_date || null,
        location: formData.location,
        address: formData.address || null,
        event_url: formData.event_url || null,
        image_url: formData.image_url || null,
        author_id: formData.author_id || null,
        book_id: formData.book_id || null,
        published: formData.published,
      }

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)

      if (error) {
        alert(`Erreur: ${error.message}`)
      } else {
        router.push('/admin/evenements')
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
          <Link href="/admin/evenements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-serif text-4xl font-bold">Modifier l'événement</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl space-y-6">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="event_date">
                    Date de début <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">Date de fin</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">
                  Lieu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Adresse complète</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="event_url">Lien de l'événement</Label>
                <Input
                  id="event_url"
                  type="url"
                  value={formData.event_url}
                  onChange={(e) =>
                    setFormData({ ...formData, event_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="author_id">Auteur lié</Label>
                <select
                  id="author_id"
                  value={formData.author_id}
                  onChange={(e) =>
                    setFormData({ ...formData, author_id: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Aucun</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.first_name} {author.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="book_id">Livre lié</Label>
                <select
                  id="book_id"
                  value={formData.book_id}
                  onChange={(e) =>
                    setFormData({ ...formData, book_id: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Aucun</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked as boolean })
                  }
                />
                <label
                  htmlFor="published"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Publier l'événement
                </label>
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
              onClick={() => router.push('/admin/evenements')}
              disabled={saving}
            >
              Annuler
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
