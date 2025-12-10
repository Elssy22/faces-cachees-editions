'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotal } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Éviter les problèmes d'hydratation
  const displayItems = mounted ? items : []
  const subtotal = mounted ? getTotal() : 0
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : SHIPPING_COST * 100
  const total = subtotal + shippingCost

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Mon panier ({displayItems.length})
          </SheetTitle>
        </SheetHeader>

        {displayItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <div>
              <p className="text-lg font-medium">Votre panier est vide</p>
              <p className="text-sm text-gray-500 mt-2">
                Ajoutez des livres pour commencer votre commande
              </p>
            </div>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/livres">Découvrir nos livres</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Liste des articles */}
            <div className="flex-1 overflow-auto py-4">
              <div className="space-y-4">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border p-4"
                  >
                    {/* Image */}
                    <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      {item.book.cover_image_url ? (
                        <Image
                          src={item.book.cover_image_url}
                          alt={item.book.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          Pas de couverture
                        </div>
                      )}
                    </div>

                    {/* Détails */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2">
                          {item.book.title}
                        </h3>
                        <p className="text-sm font-bold mt-1">
                          {formatPrice(item.book.price)}
                        </p>
                      </div>

                      {/* Contrôles quantité */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Résumé et actions */}
            <SheetFooter className="flex-col gap-4 border-t pt-4">
              {/* Frais de livraison */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Gratuite</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {subtotal < FREE_SHIPPING_THRESHOLD * 100 && (
                  <p className="text-xs text-gray-500">
                    Plus que {formatPrice(FREE_SHIPPING_THRESHOLD * 100 - subtotal)} pour la
                    livraison gratuite
                  </p>
                )}
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex flex-col gap-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/panier" onClick={() => setIsOpen(false)}>
                    Voir le panier
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/livres">Continuer mes achats</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
