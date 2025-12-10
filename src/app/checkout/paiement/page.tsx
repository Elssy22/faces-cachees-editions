'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CreditCard, Lock, AlertTriangle } from 'lucide-react'
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
  const [user, setUser] = useState<any>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const subtotal = getTotal()
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : SHIPPING_COST * 100
  const total = subtotal + shippingCost

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()

      // Vérifier l'authentification
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // Utiliser sessionStorage (plus sécurisé que localStorage)
      const savedAddress = sessionStorage.getItem('checkout_address')
      if (!savedAddress) {
        router.push('/checkout/adresse')
        return
      }
      setAddress(JSON.parse(savedAddress))

      // Vérifier que le panier n'est pas vide
      if (items.length === 0) {
        router.push('/panier')
      }
    }

    init()
  }, [items.length, router])

  // Validation du formulaire de carte
  const validateCard = () => {
    const errors: Record<string, string> = {}

    // Validation numéro de carte (basique - 16 chiffres)
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    if (!cleanCardNumber || cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      errors.cardNumber = 'Numéro de carte invalide'
    } else if (!/^\d+$/.test(cleanCardNumber)) {
      errors.cardNumber = 'Le numéro ne doit contenir que des chiffres'
    }

    // Validation date d'expiration (MM/AA)
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
      errors.expiry = 'Format MM/AA requis'
    } else {
      const [month, year] = expiry.split('/')
      const expMonth = parseInt(month, 10)
      const expYear = parseInt('20' + year, 10)
      const now = new Date()
      const expDate = new Date(expYear, expMonth - 1)

      if (expMonth < 1 || expMonth > 12) {
        errors.expiry = 'Mois invalide'
      } else if (expDate < now) {
        errors.expiry = 'Carte expirée'
      }
    }

    // Validation CVC (3-4 chiffres)
    if (!cvc || !/^\d{3,4}$/.test(cvc)) {
      errors.cvc = 'CVC invalide (3-4 chiffres)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    // Valider le formulaire
    if (!validateCard()) {
      return
    }

    setIsProcessing(true)

    try {
      const supabase = createClient()

      // Récupérer l'utilisateur actuel pour sécurité
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Créer la commande dans la base de données
      const orderNumber = generateOrderNumber()

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: currentUser?.id || null, // SÉCURITÉ: Associer à l'utilisateur connecté
          status: 'pending' as const,
          payment_status: 'paid' as const,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          total_amount: total,
          shipping_address: address,
          // Note: customer_email sera ajouté après migration 024
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

      // Mettre à jour le stock des livres
      for (const item of items) {
        if (item.editionId) {
          await supabase.rpc('decrement_stock', {
            edition_id: item.editionId,
            qty: item.quantity
          })
        }
      }

      // Sauvegarder le numéro de commande pour la page de confirmation (sessionStorage)
      sessionStorage.setItem('order_number', orderNumber)
      sessionStorage.setItem('order_id', order.id)

      // Nettoyer les données sensibles
      sessionStorage.removeItem('checkout_address')

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

  // Formater le numéro de carte avec des espaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  // Formater la date d'expiration
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
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
          <span className="text-gray-300">&rarr;</span>
          <Link
            href="/checkout/adresse"
            className="text-gray-500 hover:text-black"
          >
            Adresse
          </Link>
          <span className="text-gray-300">&rarr;</span>
          <span className="font-semibold">Paiement</span>
          <span className="text-gray-300">&rarr;</span>
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
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    disabled={isProcessing}
                    className={`mt-1 ${formErrors.cardNumber ? 'border-red-500' : ''}`}
                    autoComplete="cc-number"
                  />
                  {formErrors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="expiry">Date d'expiration</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      disabled={isProcessing}
                      className={`mt-1 ${formErrors.expiry ? 'border-red-500' : ''}`}
                      autoComplete="cc-exp"
                    />
                    {formErrors.expiry && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.expiry}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      type="password"
                      placeholder="***"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      disabled={isProcessing}
                      className={`mt-1 ${formErrors.cvc ? 'border-red-500' : ''}`}
                      autoComplete="cc-csc"
                    />
                    {formErrors.cvc && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cvc}</p>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-amber-800">
                      <p className="font-medium">Mode démonstration</p>
                      <p className="text-xs mt-1">
                        Ce site est en mode démo. Aucun paiement réel ne sera effectué.
                        Utilisez la carte de test Stripe : <code className="bg-amber-100 px-1 rounded">4242 4242 4242 4242</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-blue-800">
                      <p className="font-medium">Paiement 100% sécurisé</p>
                      <p className="text-xs mt-1">
                        Vos informations de paiement sont chiffrées et ne sont jamais stockées sur nos serveurs.
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
