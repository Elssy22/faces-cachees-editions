'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type Event = {
  id: string
  title: string
  description: string | null
  event_date: string
  end_date: string | null
  location: string
  address: string | null
  event_url: string | null
  image_url: string | null
  published: boolean
  authors?: {
    first_name: string
    last_name: string
  }
  books?: {
    title: string
  }
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        authors (first_name, last_name),
        books (title)
      `
      )
      .order('event_date', { ascending: false })

    if (data) {
      setEvents(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', id)

    if (!error) {
      setEvents(events.filter((event) => event.id !== id))
    }
  }

  const filteredEvents = events.filter((event) => {
    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
            Gestion des événements
          </h1>
          <p className="text-gray-600">{events.length} événements au total</p>
        </div>
        <Button asChild>
          <Link href="/admin/evenements/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un événement
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {event.title}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                        event.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {event.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-4 w-4 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  {event.authors && (
                    <p className="text-sm text-gray-500">
                      Auteur: {event.authors.first_name}{' '}
                      {event.authors.last_name}
                    </p>
                  )}

                  {event.books && (
                    <p className="text-sm text-gray-500">
                      Livre: {event.books.title}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/admin/evenements/${event.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun événement trouvé
          </div>
        )}
      </div>
    </div>
  )
}
