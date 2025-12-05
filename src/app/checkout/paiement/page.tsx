'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CreditCard, Lock } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { createClient } from '@/lib/supabase-browser'
import { generateOrderNumber } from '@/lib/utils'

export default function CheckoutPaymentPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [address, setAddress] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = getTotal()
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : SHIPPING_COST * 100
  const total = subtotal + shippingCost

  useEffect(() => {
    // Vérifier qu'on a bien une adresse
    const savedAddress = localStorage.getItem('checkout_address')
    if (!savedAddress) {
      router.push('/checkout/adresse')
      return
    }
    setAddress(JSON.parse(savedAddress))

    // Vérifier que le panier n'est pas vide
    if (items.length === 0) {
      router.push('/panier')
    }
  }, [items.length, router])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const supabase = createClient()

      // Créer la commande dans la base de données
      const orderNumber = generateOrderNumber()

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          status: 'pending' as const,
          payment_status: 'paid' as const,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          total_amount: total,
          shipping_address: address,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Créer les items de commande
      const orderItems = items.map((item) => ({
        order_id: order.id,
        book_id: item.bookId,
        book_title: item.book.title,
        quantity: item.quantity,
        unit_price: item.book.price,
        total_price: item.book.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Sauvegarder le numéro de commande pour la page de confirmation
      localStorage.setItem('order_number', orderNumber)
      localStorage.setItem('order_id', order.id)

      // Vider le panier
      clearCart()

      // Rediriger vers la page de confirmation
      router.push('/checkout/confirmation')
    } catch (error) {
      console.error('Erreur lors du paiement:', error)
      alert('Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!address || items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Fil d'Ariane / Étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="/panier" className="text-gray-500 hover:text-black">
            Panier
          </Link>
          <span className="text-gray-300">→</span>
          <Link
            href="/checkout/adresse"
            className="text-gray-500 hover:text-black"
          >
            Adresse
          </Link>
          <span className="text-gray-300">→</span>
          <span className="font-semibold">Paiement</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">Confirmation</span>
        </div>
      </div>

      <h1 className="font-serif text-4xl font-bold mb-8 text-center">
        Paiement sécurisé
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulaire de paiement */}
        <div className="lg:col-span-2 space-y-6">
          {/* Adresse de livraison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Adresse de livraison
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href="/checkout/adresse">Modifier</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.street}</p>
                {address.streetComplement && <p>{address.streetComplement}</p>}
                <p>
                  {address.postalCode} {address.city}
                </p>
                <p>{address.country}</p>
                <p className="pt-2">{address.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Paiement par carte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informations de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    defaultValue="4242 4242 4242 4242"
                    disabled={isProcessing}
                    className="mt-1"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="expiry">Date d'expiration</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      defaultValue="12/26"
                      disabled={isProcessing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      defaultValue="123"
                      disabled={isProcessing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-blue-800">
                      <p className="font-medium">Paiement 100% sécurisé</p>
                      <p className="text-xs mt-1">
                        <strong>Mode démo :</strong> Cette page simule un paiement.
                        Les numéros de carte sont pré-remplis pour la démonstration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    asChild
                    disabled={isProcessing}
                  >
                    <Link href="/checkout/adresse">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Retour
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      'Traitement en cours...'
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Payer {formatPrice(total)}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Résumé de commande */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
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
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Détail des articles */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium">
                  {items.length} article{items.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.book.title}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.book.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
