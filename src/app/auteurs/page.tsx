import Image from 'next/image'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export const metadata = {
  title: 'Nos auteurs',
  description: 'Découvrez les auteurs publiés par Faces Cachées Éditions',
}

export default async function AuthorsPage() {
  const supabase = await createClient()

  const { data: authors } = await supabase
    .from('authors')
    .select(`
      *,
      books (count)
    `)
    .order('name', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold mb-4">Nos auteurs</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Découvrez les talents que nous accompagnons dans leur aventure littéraire
        </p>
      </div>

      {authors && authors.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <Card key={author.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-64 bg-gray-100">
                {author.photo_url ? (
                  <Image
                    src={author.photo_url}
                    alt={author.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <BookOpen className="h-16 w-16" />
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h2 className="font-serif text-2xl font-bold mb-3">
                  {author.name}
                </h2>
                {author.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                    {author.bio}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {Array.isArray(author.books) ? author.books.length : 0} livre{Array.isArray(author.books) && author.books.length > 1 ? 's' : ''} publié{Array.isArray(author.books) && author.books.length > 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun auteur à afficher pour le moment.</p>
        </div>
      )}
    </div>
  )
}
