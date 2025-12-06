'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeroFeaturedBookProps {
  book: {
    title: string
    slug: string
    summary: string | null
    cover_image_url: string | null
  }
  authorName: string
  authorPhotoUrl: string | null
  authorInitials: string
}

// Fonction pour extraire la couleur dominante d'une image
function extractDominantColor(imageUrl: string): Promise<[number, number, number]> {
  return new Promise((resolve) => {
    const img = document.createElement('img')
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve([107, 142, 159]) // Couleur par défaut
        return
      }

      // Réduire la taille pour des performances optimales
      const size = 50
      canvas.width = size
      canvas.height = size

      ctx.drawImage(img, 0, 0, size, size)

      const imageData = ctx.getImageData(0, 0, size, size)
      const data = imageData.data

      // Calculer la couleur moyenne (en excluant les pixels trop clairs ou trop sombres)
      let r = 0, g = 0, b = 0, count = 0

      for (let i = 0; i < data.length; i += 4) {
        const red = data[i]
        const green = data[i + 1]
        const blue = data[i + 2]

        // Ignorer les pixels très clairs (blancs) et très sombres (noirs)
        const brightness = (red + green + blue) / 3
        if (brightness > 30 && brightness < 220) {
          r += red
          g += green
          b += blue
          count++
        }
      }

      if (count > 0) {
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        // Ajuster pour une couleur plus saturée et agréable
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const saturationBoost = 1.2

        if (max !== min) {
          r = Math.min(255, Math.round(r * saturationBoost))
          g = Math.min(255, Math.round(g * saturationBoost))
          b = Math.min(255, Math.round(b * saturationBoost))
        }

        resolve([r, g, b])
      } else {
        resolve([107, 142, 159]) // Couleur par défaut
      }
    }

    img.onerror = () => {
      resolve([107, 142, 159]) // Couleur par défaut en cas d'erreur
    }

    img.src = imageUrl
  })
}

// Fonction pour déterminer si le texte doit être clair ou foncé
function getContrastColor(r: number, g: number, b: number): 'light' | 'dark' {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? 'dark' : 'light'
}

// Fonction pour assombrir une couleur
function darkenColor(r: number, g: number, b: number, factor: number = 0.15): [number, number, number] {
  return [
    Math.round(r * (1 - factor)),
    Math.round(g * (1 - factor)),
    Math.round(b * (1 - factor))
  ]
}

export function HeroFeaturedBook({
  book,
  authorName,
  authorPhotoUrl,
  authorInitials,
}: HeroFeaturedBookProps) {
  const [bgColor, setBgColor] = useState<[number, number, number]>([107, 142, 159])
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (book.cover_image_url) {
      extractDominantColor(book.cover_image_url)
        .then((color) => {
          // Assombrir légèrement la couleur pour un meilleur contraste
          const adjustedColor = darkenColor(color[0], color[1], color[2], 0.1)
          setBgColor(adjustedColor)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [book.cover_image_url])

  const textColorMode = getContrastColor(bgColor[0], bgColor[1], bgColor[2])
  const textColor = textColorMode === 'light' ? 'text-white' : 'text-gray-900'
  const textColorMuted = textColorMode === 'light' ? 'text-white/80' : 'text-gray-700'
  const textColorSummary = textColorMode === 'light' ? 'text-white/90' : 'text-gray-600'
  const buttonBg = textColorMode === 'light' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
  const placeholderBg = textColorMode === 'light' ? 'bg-black/20' : 'bg-white/30'
  const placeholderText = textColorMode === 'light' ? 'text-white/40' : 'text-gray-900/40'
  const dotActive = textColorMode === 'light' ? 'bg-white' : 'bg-gray-900'
  const dotInactive = textColorMode === 'light' ? 'bg-white/40' : 'bg-gray-900/40'

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden transition-colors duration-700"
      style={{
        backgroundColor: `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`,
      }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-stretch min-h-[500px] md:min-h-[550px]">
          {/* Partie gauche - Photo auteur + Couverture livre */}
          <div className="relative flex-1 flex items-end justify-center md:justify-end pt-8 md:pt-0">
            {/* Photo de l'auteur */}
            <div className="relative w-full max-w-[400px] md:max-w-[500px] h-[350px] md:h-full">
              {authorPhotoUrl ? (
                <Image
                  src={authorPhotoUrl}
                  alt={authorName}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className={`w-full h-full ${placeholderBg} flex items-center justify-center`}>
                  <span className={`text-6xl font-bold ${placeholderText}`}>
                    {authorInitials}
                  </span>
                </div>
              )}
            </div>

            {/* Couverture du livre - positionnée en chevauchement */}
            {book.cover_image_url && (
              <div className="absolute right-0 md:right-[-60px] bottom-8 md:bottom-12 w-[180px] md:w-[220px] z-10 transform translate-x-1/4 md:translate-x-0">
                <div className="relative aspect-[2/3] shadow-2xl">
                  <Image
                    src={book.cover_image_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="220px"
                    priority
                  />
                </div>
              </div>
            )}
          </div>

          {/* Partie droite - Informations */}
          <div className="flex-1 flex items-center py-12 md:py-16 px-6 md:px-16 lg:px-24">
            <div className="max-w-lg">
              <p className={`text-sm font-bold uppercase tracking-wider ${textColorMuted} mb-2`}>
                {authorName}
              </p>
              <h1 className={`font-serif text-4xl md:text-5xl lg:text-6xl font-bold ${textColor} mb-6`}>
                {book.title}
              </h1>
              {book.summary && (
                <p className={`${textColorSummary} text-lg leading-relaxed line-clamp-3 mb-8`}>
                  {book.summary}
                </p>
              )}
              <Button
                size="lg"
                variant="secondary"
                className={`${buttonBg} rounded-none px-8 py-6 text-base font-medium`}
                asChild
              >
                <Link href={`/livres/${book.slug}`}>
                  En savoir plus
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de pagination (décoratif pour l'instant) */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex gap-2">
        <span className={`w-2 h-2 rounded-full ${dotInactive}`}></span>
        <span className={`w-2 h-2 rounded-full ${dotInactive}`}></span>
        <span className={`w-2 h-2 rounded-full ${dotActive}`}></span>
        <span className={`w-2 h-2 rounded-full ${dotInactive}`}></span>
        <span className={`w-2 h-2 rounded-full ${dotInactive}`}></span>
      </div>

      {/* Overlay de chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-400 animate-pulse" />
      )}
    </section>
  )
}
