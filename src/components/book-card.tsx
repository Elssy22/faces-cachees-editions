import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { formatPrice } from '@/lib/utils'
import { Eye } from 'lucide-react'

interface BookCardProps {
  id: string
  title: string
  author: string
  price: number
  coverUrl: string | null
  slug: string
}

export function BookCard({ id, title, author, price, coverUrl, slug }: BookCardProps) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
      <Link href={`/livres/${slug}`}>
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <span className="text-gray-400">Pas de couverture</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4 flex-1">
        <Link href={`/livres/${slug}`}>
          <h3 className="font-serif text-lg font-semibold line-clamp-2 group-hover:underline">
            {title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-600">{author}</p>
        <p className="mt-2 text-lg font-bold">{formatPrice(price)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <Button variant="outline" asChild className="w-full">
          <Link href={`/livres/${slug}`}>
            <Eye className="mr-2 h-4 w-4" />
            Découvrir
          </Link>
        </Button>
        <AddToCartButton
          bookId={id}
          bookTitle={title}
          bookPrice={price}
          bookCoverUrl={coverUrl}
          className="w-full"
        />
      </CardFooter>
    </Card>
  )
}
