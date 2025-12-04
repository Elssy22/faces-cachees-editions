'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase-browser'
import { BookOpen, Instagram, Facebook, Youtube } from 'lucide-react'
import { SiX, SiTiktok } from 'react-icons/si'

interface AuthorCardProps {
  id: string
  firstName: string
  lastName: string
  bio?: string | null
  photoUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  facebookUrl?: string | null
  youtubeUrl?: string | null
  tiktokUrl?: string | null
  booksCount: number
}

interface Book {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  price: number
}

export function AuthorCard({
  id,
  firstName,
  lastName,
  bio,
  photoUrl,
  instagramUrl,
  twitterUrl,
  facebookUrl,
  youtubeUrl,
  tiktokUrl,
  booksCount,
}: AuthorCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const fullName = `${firstName} ${lastName}`

  // Charger les livres de l'auteur quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && books.length === 0) {
      loadAuthorBooks()
    }
  }, [isOpen])

  const loadAuthorBooks = async () => {
    setLoadingBooks(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('books')
      .select('id, title, slug, cover_image_url, price')
      .eq('author_id', id)
      .eq('status', 'published')
      .order('publication_date', { ascending: false })

    if (data) {
      setBooks(data)
    }
    setLoadingBooks(false)
  }

  // Tous les réseaux sociaux avec icônes par défaut
  const allSocialLinks = [
    {
      url: facebookUrl,
      icon: Facebook,
      label: 'Facebook',
      color: 'hover:text-blue-600'
    },
    {
      url: twitterUrl,
      icon: SiX,
      label: 'X (Twitter)',
      color: 'hover:text-black'
    },
    {
      url: instagramUrl,
      icon: Instagram,
      label: 'Instagram',
      color: 'hover:text-pink-600'
    },
    {
      url: tiktokUrl,
      icon: SiTiktok,
      label: 'TikTok',
      color: 'hover:text-black'
    },
  ]

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
        <div className="relative h-80 bg-gray-100" onClick={() => setIsOpen(true)}>
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={fullName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <BookOpen className="h-16 w-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <CardContent className="p-6">
          <h2 className="font-serif text-2xl font-bold mb-3">
            {fullName}
          </h2>
          {bio && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
              {bio}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BookOpen className="h-4 w-4" />
              <span>
                {booksCount} livre{booksCount > 1 ? 's' : ''} publié{booksCount > 1 ? 's' : ''}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="text-sm"
            >
              En savoir plus
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal avec les détails */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl">
              {fullName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {photoUrl && (
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={photoUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 700px"
                />
              </div>
            )}

            {bio && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Biographie</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {bio}
                </p>
              </div>
            )}

            {/* Livres de l'auteur */}
            {loadingBooks ? (
              <div className="text-center py-8 text-gray-500">
                Chargement des livres...
              </div>
            ) : books.length > 0 ? (
              <div>
                <h3 className="font-semibold text-lg mb-3">Ses livres</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {books.map((book) => (
                    <Link
                      key={book.id}
                      href={`/livres/${book.slug}`}
                      className="group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100">
                        {book.cover_image_url ? (
                          <Image
                            src={book.cover_image_url}
                            alt={book.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-200">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium line-clamp-2 group-hover:underline">
                        {book.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Réseaux sociaux */}
            {allSocialLinks.some(link => link.url) && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Réseaux sociaux</h3>
                <div className="flex flex-wrap gap-3">
                  {allSocialLinks.map(({ url, icon: Icon, label, color }) =>
                    url ? (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${color}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{label}</span>
                      </a>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
