'use client'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { toast } from '@/components/ui/use-toast'
import { ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  book: {
    id: string
    title: string
    price: number
    coverUrl: string | null
    slug: string
  }
  inStock: boolean
}

export function AddToCartButton({ book, inStock }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (!inStock) {
      toast({
        title: 'Rupture de stock',
        description: 'Ce livre n\'est malheureusement plus disponible.',
        variant: 'destructive',
      })
      return
    }

    addItem({
      id: book.id,
      bookId: book.id,
      book: {
        id: book.id,
        title: book.title,
        price: book.price,
        cover_url: book.coverUrl,
        slug: book.slug,
      } as any,
      quantity: 1,
      createdAt: new Date().toISOString(),
    } as any)

    toast({
      title: 'Ajouté au panier',
      description: `${book.title} a été ajouté à votre panier.`,
      variant: 'success',
    })
  }

  return (
    <Button
      size="lg"
      onClick={handleAddToCart}
      disabled={!inStock}
      className="w-full md:w-auto"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {inStock ? 'Ajouter au panier' : 'Rupture de stock'}
    </Button>
  )
}
