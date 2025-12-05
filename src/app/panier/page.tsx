'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()
  const subtotal = getTotal()
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : SHIPPING_COST * 100
  const total = subtotal + shippingCost

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300" />
          <div>
            <h1 className="font-serif text-3xl font-bold mb-2">
              Votre panier est vide
            </h1>
            <p className="text-gray-600">
              Découvrez notre sélection de livres et ajoutez vos favoris à votre panier
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/livres">
              Découvrir nos livres
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Mon panier</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Liste des articles */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                    {item.book.cover_image_url ? (
                      <Image
                        src={item.book.cover_image_url}
                        alt={item.book.title}
                        fill
                        className="object-cover"
                        sizes="96px"
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
                      <Link
                        href={`/livres/${item.book.slug}`}
                        className="font-serif text-xl font-semibold hover:underline"
                      >
                        {item.book.title}
                      </Link>
                      <p className="text-lg font-bold mt-2">
                        {formatPrice(item.book.price)}
                      </p>
                    </div>

                    {/* Contrôles */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold">
                          {formatPrice(item.book.price * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Résumé de commande */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
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
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    Plus que {formatPrice(FREE_SHIPPING_THRESHOLD * 100 - subtotal)} pour bénéficier de la livraison gratuite !
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">TVA incluse</p>
              </div>

              <div className="space-y-2 pt-4">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout/adresse">
                    Passer la commande
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/livres">Continuer mes achats</Link>
                </Button>
              </div>

              {/* Modes de paiement acceptés */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 text-center mb-2">
                  Paiement sécurisé
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span>CB</span>
                  <span>•</span>
                  <span>Visa</span>
                  <span>•</span>
                  <span>Mastercard</span>
                  <span>•</span>
                  <span>Stripe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
