import { createClient } from '@/lib/supabase-server'
import { BookCard } from '@/components/book-card'
import { BooksFilters } from '@/components/books-filters'
import { BOOK_TYPES } from '@/lib/constants'
import { Database } from '@/types/database'

type BookType = Database['public']['Enums']['book_type']

export const metadata = {
  title: 'Tous les livres',
  description: 'Découvrez tous les livres de notre catalogue',
}

interface SearchParams {
  type?: string
  sort?: string
  page?: string
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const currentPage = parseInt(params.page || '1', 10)
  const itemsPerPage = 12
  const from = (currentPage - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  // Construire la requête
  let query = supabase
    .from('books')
    .select(`
      id,
      title,
      slug,
      price,
      cover_image_url,
      book_type,
      authors (first_name, last_name)
    `, { count: 'exact' })
    .eq('status', 'published')

  // Filtre par type
  if (params.type && params.type !== 'all') {
    query = query.eq('book_type', params.type as BookType)
  }

  // Tri
  switch (params.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'title':
      query = query.order('title', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Pagination
  query = query.range(from, to)

  const { data: books, count } = await query

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-4">Tous les livres</h1>
        <p className="text-gray-600">
          {count ? `${count} livre${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}` : 'Aucun livre disponible'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - Filtres */}
        <aside className="md:w-64 flex-shrink-0">
          <BooksFilters
            currentType={params.type}
            currentSort={params.sort}
            bookTypes={BOOK_TYPES}
          />
        </aside>

        {/* Grille de livres */}
        <div className="flex-1">
          {books && books.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={
                      book.authors
                        ? `${book.authors.first_name} ${book.authors.last_name}`
                        : 'Auteur inconnu'
                    }
                    price={book.price}
                    coverUrl={book.cover_image_url}
                    slug={book.slug}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const searchParamsObj = new URLSearchParams()
                    if (params.type) searchParamsObj.set('type', params.type)
                    if (params.sort) searchParamsObj.set('sort', params.sort)
                    searchParamsObj.set('page', page.toString())

                    return (
                      <a
                        key={page}
                        href={`/livres?${searchParamsObj.toString()}`}
                        className={`px-4 py-2 rounded ${
                          page === currentPage
                            ? 'bg-black text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </a>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun livre trouvé avec ces filtres.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
