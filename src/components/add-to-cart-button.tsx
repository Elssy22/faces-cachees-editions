'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { toast } from '@/components/ui/use-toast'
import { ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  bookId: string
  bookTitle: string
  bookPrice: number
  bookCoverUrl: string | null
  bookSlug?: string
}

export function AddToCartButton({
  bookId,
  bookTitle,
  bookPrice,
  bookCoverUrl,
  bookSlug,
  className,
  size,
  ...props
}: AddToCartButtonProps) {
  const { addItem, setIsOpen } = useCartStore()

  const handleAddToCart = () => {
    addItem({
      id: bookId,
      title: bookTitle,
      price: bookPrice,
      cover_image_url: bookCoverUrl,
      slug: bookSlug || bookId,
    })

    setIsOpen(true)

    toast({
      title: 'Ajouté au panier',
      description: `${bookTitle} a été ajouté à votre panier.`,
    })
  }

  return (
    <Button
      size={size}
      onClick={handleAddToCart}
      className={className}
      {...props}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Ajouter au panier
    </Button>
  )
}
