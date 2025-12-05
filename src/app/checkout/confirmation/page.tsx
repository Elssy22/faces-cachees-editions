'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home, Package } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase-browser'

export default function CheckoutConfirmationPage() {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      const orderNumber = localStorage.getItem('order_number')
      const orderId = localStorage.getItem('order_id')

      if (!orderNumber || !orderId) {
        router.push('/')
        return
      }

      try {
        const supabase = createClient()

        // Récupérer la commande
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (orderError) throw orderError

        // Récupérer les items de la commande
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            books (
              id,
              title,
              cover_image_url,
              slug
            )
          `)
          .eq('order_id', orderId)

        if (itemsError) throw itemsError

        setOrder(orderData)
        setOrderItems(itemsData || [])

        // Nettoyer le localStorage
        localStorage.removeItem('checkout_address')
        localStorage.removeItem('order_number')
        localStorage.removeItem('order_id')
      } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Commande introuvable</p>
        <Button asChild className="mt-4">
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Message de succès */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <h1 className="font-serif text-4xl font-bold mb-4">
          Commande confirmée !
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Merci pour votre commande
        </p>
        <p className="text-sm text-gray-500">
          Un email de confirmation a été envoyé à votre adresse
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-lg">
          <span className="text-sm text-gray-600">Numéro de commande :</span>
          <span className="font-mono font-bold text-lg">{order.order_number}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        {/* Détails de la commande */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Détails de la commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Date de commande</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span>
                <p className="font-medium">En préparation</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Adresse de livraison</p>
              <div className="mt-1 text-sm">
                <p className="font-medium">
                  {order.shipping_address.firstName} {order.shipping_address.lastName}
                </p>
                <p>{order.shipping_address.street}</p>
                {order.shipping_address.streetComplement && (
                  <p>{order.shipping_address.streetComplement}</p>
                )}
                <p>
                  {order.shipping_address.postalCode} {order.shipping_address.city}
                </p>
                <p>{order.shipping_address.country}</p>
                <p className="mt-1">{order.shipping_address.phone}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Montant total</p>
              <p className="text-2xl font-bold">{formatPrice(order.total_amount)}</p>
              <p className="text-xs text-gray-500 mt-1">TVA incluse</p>
            </div>
          </CardContent>
        </Card>

        {/* Articles commandés */}
        <Card>
          <CardHeader>
            <CardTitle>Articles ({orderItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                    {item.books?.cover_image_url ? (
                      <Image
                        src={item.books.cover_image_url}
                        alt={item.books.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/livres/${item.books?.slug}`}
                      className="font-medium hover:underline line-clamp-2"
                    >
                      {item.books?.title}
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">
                        Quantité : {item.quantity}
                      </p>
                      <p className="font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-12 flex justify-center gap-4">
        <Button size="lg" asChild>
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/livres">Continuer mes achats</Link>
        </Button>
      </div>

      {/* Informations complémentaires */}
      <div className="mt-12 max-w-3xl mx-auto bg-gray-50 rounded-lg p-6">
        <h2 className="font-semibold mb-3">Et maintenant ?</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            ✓ Vous allez recevoir un email de confirmation avec tous les détails de votre commande
          </p>
          <p>
            ✓ Votre commande sera expédiée sous 24-48h ouvrées
          </p>
          <p>
            ✓ Vous recevrez un email avec le numéro de suivi dès l'expédition
          </p>
          <p>
            ✓ Délai de livraison : 3 à 5 jours ouvrés
          </p>
        </div>
      </div>
    </div>
  )
}
