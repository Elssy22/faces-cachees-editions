import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { BookCard } from '@/components/book-card'
import { EventCard } from '@/components/event-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Accueil',
}

export default async function Home() {
  const supabase = await createClient()

  // Récupérer le dernier livre sorti (bloc 1)
  const { data: latestBook } = await supabase
    .from('books')
    .select(`
      id,
      title,
      slug,
      price,
      cover_url,
      release_date,
      authors (name)
    `)
    .eq('published', true)
    .order('release_date', { ascending: false })
    .limit(1)
    .single()

  // Récupérer les 4 derniers livres (bloc 2)
  const { data: recentBooks } = await supabase
    .from('books')
    .select(`
      id,
      title,
      slug,
      price,
      cover_url,
      authors (name)
    `)
    .eq('published', true)
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

  return (
    <div className="flex flex-col">
      {/* Hero Section - Dernier livre sorti */}
      {latestBook && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
              <div className="relative aspect-[2/3] max-w-md mx-auto">
                {latestBook.cover_url ? (
                  <Image
                    src={latestBook.cover_url}
                    alt={latestBook.title}
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
              <div className="flex flex-col justify-center">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Nouvelle sortie
                </p>
                <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">
                  {latestBook.title}
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                  Par {latestBook.authors?.name}
                </p>
                <p className="mt-6 text-2xl font-bold">
                  {(latestBook.price / 100).toFixed(2)} €
                </p>
                <div className="mt-8 flex gap-4">
                  <Button size="lg" asChild>
                    <Link href={`/livres/${latestBook.slug}`}>
                      Découvrir
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
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
                  author={book.authors?.name || 'Auteur inconnu'}
                  price={book.price}
                  coverUrl={book.cover_url}
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
