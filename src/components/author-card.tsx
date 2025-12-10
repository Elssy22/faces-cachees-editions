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
import { BookOpen, Instagram, Facebook, Youtube, Play, Video, User } from 'lucide-react'
import { SiX, SiTiktok } from 'react-icons/si'

// Valider qu'une URL est valide
function isValidUrl(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Liste des hostnames autorisés pour Next.js Image
const ALLOWED_IMAGE_HOSTNAMES = [
  'www.dropbox.com',
  'assets.bigcartel.com',
  'lwghbcpyhssfgncrgzbt.supabase.co',
  'www.startnplay.com',
  'www.booska-p.com',
  'www.bissai.com',
]

// Vérifier si l'URL est d'un domaine autorisé pour Next.js Image
function isAllowedImageHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return ALLOWED_IMAGE_HOSTNAMES.includes(hostname)
  } catch {
    return false
  }
}

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
  videoUrl?: string | null
  videoType?: 'upload' | 'youtube' | 'vimeo' | 'dailymotion' | 'other' | null
  videoTitle?: string | null
  booksCount: number
}

interface Book {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  price: number
}

// Fonction pour extraire l'ID YouTube d'une URL
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// Fonction pour extraire l'ID Vimeo d'une URL
function getVimeoId(url: string): string | null {
  const regExp = /vimeo\.com\/(?:.*\/)?(\d+)/
  const match = url.match(regExp)
  return match ? match[1] : null
}

// Fonction pour extraire l'ID Dailymotion d'une URL
function getDailymotionId(url: string): string | null {
  const regExp = /dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/
  const match = url.match(regExp)
  return match ? match[1] : null
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
  videoUrl,
  videoType,
  videoTitle,
  booksCount,
}: AuthorCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [imageError, setImageError] = useState(false)
  const fullName = `${firstName} ${lastName}`

  // Vérifier si l'URL de la photo est valide
  const hasValidPhoto = isValidUrl(photoUrl) && !imageError
  // Utiliser Next.js Image uniquement pour les domaines configurés
  const useNextImage = hasValidPhoto && isAllowedImageHost(photoUrl)

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

  // Configuration des réseaux sociaux
  const socialLinks = [
    {
      url: facebookUrl,
      icon: Facebook,
      label: 'Facebook',
      color: 'hover:bg-blue-600 hover:text-white hover:border-blue-600'
    },
    {
      url: twitterUrl,
      icon: SiX,
      label: 'X',
      color: 'hover:bg-black hover:text-white hover:border-black'
    },
    {
      url: instagramUrl,
      icon: Instagram,
      label: 'Instagram',
      color: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-pink-500'
    },
    {
      url: tiktokUrl,
      icon: SiTiktok,
      label: 'TikTok',
      color: 'hover:bg-black hover:text-white hover:border-black'
    },
    {
      url: youtubeUrl,
      icon: Youtube,
      label: 'YouTube',
      color: 'hover:bg-red-600 hover:text-white hover:border-red-600'
    },
  ]

  const hasSocialLinks = socialLinks.some(link => link.url)

  // Rendu de la vidéo selon le type
  const renderVideo = () => {
    if (!videoUrl) return null

    if (videoType === 'youtube') {
      const videoId = getYouTubeId(videoUrl)
      if (videoId) {
        return (
          <iframe
            className="w-full aspect-video rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={videoTitle || 'Vidéo YouTube'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )
      }
    }

    if (videoType === 'vimeo') {
      const videoId = getVimeoId(videoUrl)
      if (videoId) {
        return (
          <iframe
            className="w-full aspect-video rounded-lg"
            src={`https://player.vimeo.com/video/${videoId}`}
            title={videoTitle || 'Vidéo Vimeo'}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )
      }
    }

    if (videoType === 'dailymotion') {
      const videoId = getDailymotionId(videoUrl)
      if (videoId) {
        return (
          <iframe
            className="w-full aspect-video rounded-lg"
            src={`https://www.dailymotion.com/embed/video/${videoId}`}
            title={videoTitle || 'Vidéo Dailymotion'}
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )
      }
    }

    if (videoType === 'upload') {
      return (
        <video
          className="w-full aspect-video rounded-lg"
          controls
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      )
    }

    // Fallback pour 'other' ou URL non reconnue
    return (
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 p-6 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Play className="h-8 w-8" />
        <span className="font-medium">Voir la vidéo</span>
      </a>
    )
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
        <div className="relative h-80 bg-gray-100" onClick={() => setIsOpen(true)}>
          {hasValidPhoto ? (
            useNextImage ? (
              <Image
                src={photoUrl}
                alt={fullName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImageError(true)}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoUrl}
                alt={fullName}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <User className="h-16 w-16" />
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

      {/* Modal avec les détails - Nouveau layout */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl">
              {fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Section 1: Photo + Bio côte à côte */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Photo de l'auteur */}
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-100">
                {hasValidPhoto ? (
                  useNextImage ? (
                    <Image
                      src={photoUrl}
                      alt={fullName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photoUrl}
                      alt={fullName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <User className="h-20 w-20" />
                  </div>
                )}
              </div>

              {/* Biographie */}
              <div className="flex flex-col">
                <h3 className="font-semibold text-lg mb-3">Biographie</h3>
                {bio ? (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line flex-1 overflow-y-auto max-h-[400px]">
                    {bio}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">Aucune biographie disponible.</p>
                )}
              </div>
            </div>

            {/* Section 2: Livres de l'auteur */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Ses livres chez Faces Cachées Éditions
              </h3>
              {loadingBooks ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement des livres...
                </div>
              ) : books.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {books.map((book) => (
                    <Link
                      key={book.id}
                      href={`/livres/${book.slug}`}
                      className="group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                        {book.cover_image_url ? (
                          <Image
                            src={book.cover_image_url}
                            alt={book.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 25vw"
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
                      <p className="text-sm text-gray-500">{book.price.toFixed(2)} €</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic py-4">
                  Aucun livre publié pour le moment.
                </p>
              )}
            </div>

            {/* Section 3: Réseaux sociaux */}
            {hasSocialLinks && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Le retrouver sur les réseaux</h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map(({ url, icon: Icon, label, color }) =>
                    url ? (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-full transition-all ${color}`}
                        title={label}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Vidéo */}
            {videoUrl && (
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  {videoTitle || 'Vidéo'}
                </h3>
                <div className="rounded-lg overflow-hidden">
                  {renderVideo()}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
