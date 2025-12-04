import { createClient } from '@/lib/supabase-server'
import { AuthorCard } from '@/components/author-card'

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
    .order('last_name', { ascending: true })

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
            <AuthorCard
              key={author.id}
              id={author.id}
              firstName={author.first_name}
              lastName={author.last_name}
              bio={author.bio}
              photoUrl={author.photo_url}
              instagramUrl={author.instagram_url}
              twitterUrl={author.twitter_url}
              facebookUrl={author.facebook_url}
              youtubeUrl={author.youtube_url}
              tiktokUrl={author.tiktok_url}
              booksCount={
                Array.isArray(author.books) && author.books.length > 0
                  ? author.books[0].count
                  : 0
              }
            />
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
