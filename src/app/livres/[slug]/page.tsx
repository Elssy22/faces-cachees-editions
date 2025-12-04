import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import { BOOK_TYPES } from '@/lib/constants'
import { Calendar, BookOpen, FileText } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('books')
    .select('title, description')
    .eq('slug', slug)
    .single()

  if (!book) {
    return {
      title: 'Livre non trouvé',
    }
  }

  return {
    title: book.title,
    description: book.description || `Découvrez ${book.title}`,
  }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('books')
    .select(`
      *,
      authors (
        id,
        name,
        bio
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!book) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Couverture du livre */}
        <div className="relative aspect-[2/3] max-w-md mx-auto w-full">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover rounded-lg shadow-2xl"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200 rounded-lg">
              <span className="text-gray-400">Pas de couverture</span>
            </div>
          )}
        </div>

        {/* Informations du livre */}
        <div className="flex flex-col">
          {/* Type de livre */}
          <Badge className="w-fit mb-4">
            {book.book_type && BOOK_TYPES[book.book_type as keyof typeof BOOK_TYPES]}
          </Badge>

          <h1 className="font-serif text-4xl font-bold mb-4">{book.title}</h1>

          {/* Auteur */}
          {book.authors && (
            <p className="text-xl text-gray-600 mb-6">Par {book.authors.name}</p>
          )}

          {/* Prix et disponibilité */}
          <div className="mb-8">
            <p className="text-3xl font-bold mb-2">{formatPrice(book.price)}</p>
            {book.stock > 0 ? (
              <p className="text-green-600">En stock ({book.stock} disponibles)</p>
            ) : (
              <p className="text-red-600">Rupture de stock</p>
            )}
          </div>

          {/* Bouton ajouter au panier */}
          <AddToCartButton
            book={{
              id: book.id,
              title: book.title,
              price: book.price,
              coverUrl: book.cover_url,
              slug: book.slug,
            }}
            inStock={book.stock > 0}
          />

          {/* Informations supplémentaires */}
          <div className="mt-8 space-y-3 text-sm border-t pt-6">
            {book.isbn && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">ISBN:</span>
                <span className="font-medium">{book.isbn}</span>
              </div>
            )}
            {book.page_count && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Pages:</span>
                <span className="font-medium">{book.page_count}</span>
              </div>
            )}
            {book.release_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Date de parution:</span>
                <span className="font-medium">{formatDate(book.release_date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description et informations détaillées */}
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {book.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-serif text-2xl font-bold mb-4">Résumé</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Informations sur l'auteur */}
        {book.authors && (
          <Card>
            <CardContent className="p-6">
              <h2 className="font-serif text-2xl font-bold mb-4">L'auteur</h2>
              <h3 className="font-semibold text-lg mb-2">{book.authors.name}</h3>
              {book.authors.bio && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {book.authors.bio}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
