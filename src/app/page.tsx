import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { BookCard } from '@/components/book-card'
import { EventCard } from '@/components/event-card'
import { HeroFeaturedBook } from '@/components/hero-featured-book'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const revalidate = 0 // Désactiver le cache pour les données dynamiques

export const metadata = {
  title: 'Accueil',
}

export default async function Home() {
  const supabase = await createClient()

  // Récupérer le paramètre du livre en vedette (si la table existe)
  let featuredBookId: string | null = null
  try {
    const { data: featuredSetting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'featured_book')
      .single()

    featuredBookId = (featuredSetting?.value as { book_id: string | null })?.book_id
  } catch {
    // Table doesn't exist yet, use fallback
  }

  // Récupérer le livre en vedette avec la photo de l'auteur
  let featuredBook = null
  if (featuredBookId) {
    const { data } = await supabase
      .from('books')
      .select(`
        id,
        title,
        slug,
        price,
        cover_image_url,
        publication_date,
        summary,
        authors (first_name, last_name, photo_url)
      `)
      .eq('id', featuredBookId)
      .eq('status', 'published')
      .single()
    featuredBook = data
  } else {
    const { data } = await supabase
      .from('books')
      .select(`
        id,
        title,
        slug,
        price,
        cover_image_url,
        publication_date,
        summary,
        authors (first_name, last_name, photo_url)
      `)
      .eq('status', 'published')
      .not('cover_image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    featuredBook = data
  }

  // Récupérer les 4 derniers livres avec couverture (bloc 2)
  const { data: recentBooks } = await supabase
    .from('books')
    .select(`
      id,
      title,
      slug,
      price,
      cover_image_url,
      authors (first_name, last_name)
    `)
    .eq('status', 'published')
    .not('cover_image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(4)

  // Récupérer les événements à venir (bloc 3)
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3)

  const authorName = featuredBook?.authors
    ? `${featuredBook.authors.first_name} ${featuredBook.authors.last_name}`
    : 'Auteur inconnu'

  const authorPhotoUrl = featuredBook?.authors?.photo_url || null

  const authorInitials = featuredBook?.authors
    ? `${featuredBook.authors.first_name?.[0] || ''}${featuredBook.authors.last_name?.[0] || ''}`
    : 'A'

  return (
    <div className="flex flex-col">
      {/* Hero Section - Style Gallimard avec couleur dynamique */}
      {featuredBook && (
        <HeroFeaturedBook
          book={{
            title: featuredBook.title,
            slug: featuredBook.slug,
            summary: featuredBook.summary,
            cover_image_url: featuredBook.cover_image_url,
          }}
          authorName={authorName}
          authorPhotoUrl={authorPhotoUrl}
          authorInitials={authorInitials}
        />
      )}

      {/* Section - Derniers livres */}
      {recentBooks && recentBooks.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl font-bold">Derniers livres</h2>
              <Button variant="ghost" asChild>
                <Link href="/livres">
                  Voir tous les livres
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentBooks.map((book) => (
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
          </div>
        </section>
      )}

      {/* Section - Événements à venir */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold mb-8">
              Événements à venir
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  eventDate={event.event_date}
                  location={event.location}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
