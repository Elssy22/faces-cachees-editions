'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Edit, Trash2, Save, X, Tag, BookOpen } from 'lucide-react'

type TagInfo = {
  name: string
  count: number
  books: { id: string; title: string; slug: string }[]
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    const supabase = createClient()
    const { data: books } = await supabase
      .from('books')
      .select('id, title, slug, tags')

    if (books) {
      // Extraire tous les tags et compter les occurrences
      const tagMap = new Map<string, TagInfo>()

      books.forEach((book) => {
        if (book.tags && Array.isArray(book.tags)) {
          book.tags.forEach((tag: string) => {
            const existing = tagMap.get(tag)
            if (existing) {
              existing.count++
              existing.books.push({ id: book.id, title: book.title, slug: book.slug })
            } else {
              tagMap.set(tag, {
                name: tag,
                count: 1,
                books: [{ id: book.id, title: book.title, slug: book.slug }],
              })
            }
          })
        }
      })

      // Convertir en tableau et trier par nombre d'occurrences
      const tagsArray = Array.from(tagMap.values()).sort((a, b) => b.count - a.count)
      setTags(tagsArray)
    }

    setLoading(false)
  }

  const handleEdit = (tagName: string) => {
    setEditingTag(tagName)
    setEditValue(tagName)
  }

  const handleCancelEdit = () => {
    setEditingTag(null)
    setEditValue('')
  }

  const handleSaveEdit = async (oldTagName: string) => {
    if (!editValue.trim() || editValue.trim() === oldTagName) {
      handleCancelEdit()
      return
    }

    setSaving(true)
    const supabase = createClient()
    const tagInfo = tags.find((t) => t.name === oldTagName)

    if (tagInfo) {
      // Mettre à jour tous les livres qui ont ce tag
      for (const book of tagInfo.books) {
        // Récupérer les tags actuels du livre
        const { data: bookData } = await supabase
          .from('books')
          .select('tags')
          .eq('id', book.id)
          .single()

        if (bookData?.tags) {
          // Remplacer l'ancien tag par le nouveau
          const newTags = bookData.tags.map((t: string) =>
            t === oldTagName ? editValue.trim() : t
          )

          await supabase
            .from('books')
            .update({ tags: newTags })
            .eq('id', book.id)
        }
      }
    }

    setSaving(false)
    handleCancelEdit()
    loadTags()
  }

  const handleDelete = async (tagName: string) => {
    const tagInfo = tags.find((t) => t.name === tagName)
    if (!tagInfo) return

    const confirmMessage =
      tagInfo.count === 1
        ? `Êtes-vous sûr de vouloir supprimer le tag "${tagName}" ? Il sera retiré de 1 livre.`
        : `Êtes-vous sûr de vouloir supprimer le tag "${tagName}" ? Il sera retiré de ${tagInfo.count} livres.`

    if (!confirm(confirmMessage)) {
      return
    }

    setSaving(true)
    const supabase = createClient()

    // Supprimer le tag de tous les livres qui l'ont
    for (const book of tagInfo.books) {
      const { data: bookData } = await supabase
        .from('books')
        .select('tags')
        .eq('id', book.id)
        .single()

      if (bookData?.tags) {
        const newTags = bookData.tags.filter((t: string) => t !== tagName)

        await supabase
          .from('books')
          .update({ tags: newTags })
          .eq('id', book.id)
      }
    }

    setSaving(false)
    loadTags()
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 className="font-serif text-4xl font-bold mb-2">Gestion des tags</h1>
        <p className="text-gray-600">
          {tags.length} tag{tags.length > 1 ? 's' : ''} au total
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Rechercher un tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre de livres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livres associés
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <tr key={tag.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {editingTag === tag.name ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-48"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(tag.name)
                              } else if (e.key === 'Escape') {
                                handleCancelEdit()
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveEdit(tag.name)}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <Badge variant="secondary">{tag.name}</Badge>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="font-medium">{tag.count}</span>
                      <span className="text-gray-500 ml-1">
                        livre{tag.count > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {tag.books.slice(0, 3).map((book) => (
                          <a
                            key={book.id}
                            href={`/admin/livres/${book.id}`}
                            className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                          >
                            <BookOpen className="h-3 w-3" />
                            {book.title.length > 20
                              ? book.title.substring(0, 20) + '...'
                              : book.title}
                          </a>
                        ))}
                        {tag.books.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{tag.books.length - 3} autres
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {editingTag !== tag.name && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tag.name)}
                            disabled={saving}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tag.name)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery
                      ? 'Aucun tag trouvé pour cette recherche'
                      : 'Aucun tag disponible. Ajoutez des tags aux livres pour les voir ici.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
