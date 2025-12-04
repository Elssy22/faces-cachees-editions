'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

type Author = {
  id: string
  first_name: string
  last_name: string
  slug: string
  bio: string | null
  photo_url: string | null
  books?: { count: number }[]
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadAuthors()
  }, [])

  const loadAuthors = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('authors')
      .select('*, books(count)')
      .order('last_name', { ascending: true })

    if (data) {
      setAuthors(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet auteur ?')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('authors').delete().eq('id', id)

    if (!error) {
      setAuthors(authors.filter((author) => author.id !== id))
    }
  }

  const filteredAuthors = authors.filter((author) => {
    const fullName = `${author.first_name} ${author.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">
            Gestion des auteurs
          </h1>
          <p className="text-gray-600">{authors.length} auteurs au total</p>
        </div>
        <Button asChild>
          <Link href="/admin/auteurs/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un auteur
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Rechercher un auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAuthors.length > 0 ? (
          filteredAuthors.map((author) => (
            <Card key={author.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 flex-shrink-0">
                    {author.first_name[0]}
                    {author.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {author.first_name} {author.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {author.slug}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {Array.isArray(author.books) && author.books.length > 0
                        ? `${author.books[0].count} ${
                            author.books[0].count > 1 ? 'livres' : 'livre'
                          }`
                        : '0 livre'}
                    </p>
                  </div>
                </div>
                {author.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {author.bio}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/admin/auteurs/${author.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(author.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun auteur trouvé
          </div>
        )}
      </div>
    </div>
  )
}
