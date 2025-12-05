'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

type Book = {
  id: string
  title: string
  slug: string
  price: number
  book_type: string
  status: string | null
  publication_date: string | null
  author_id: string | null
  initial_stock: number | null
  current_stock: number | null
  authors?: {
    first_name: string
    last_name: string
  } | null
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        authors (
          first_name,
          last_name
        )
      `
      )
      .order('created_at', { ascending: false })

    if (data) {
      setBooks(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('books').delete().eq('id', id)

    if (!error) {
      setBooks(books.filter((book) => book.id !== id))
    }
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authors?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authors?.last_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || book.book_type === filterType

    return matchesSearch && matchesType
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
            Gestion des livres
          </h1>
          <p className="text-gray-600">{books.length} livres au total</p>
        </div>
        <Button asChild>
          <Link href="/admin/livres/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un livre
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Rechercher un livre ou un auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="all">Tous les types</option>
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
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {book.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {book.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {book.authors
                        ? `${book.authors.first_name} ${book.authors.last_name}`
                        : 'Non défini'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {book.book_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatPrice(Math.round(book.price * 100))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-gray-900">
                          {book.current_stock ?? 0} / {book.initial_stock ?? 100}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              (book.current_stock ?? 0) === 0
                                ? 'bg-red-500'
                                : (book.current_stock ?? 0) < (book.initial_stock ?? 100) * 0.2
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${((book.current_stock ?? 0) / (book.initial_stock ?? 100)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          book.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : book.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {book.status === 'published'
                          ? 'Publié'
                          : book.status === 'draft'
                          ? 'Brouillon'
                          : 'Programmé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/livres/${book.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/admin/livres/${book.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(book.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Aucun livre trouvé
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
