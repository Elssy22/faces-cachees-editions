'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCartStore } from '@/store/cart'
import { addressSchema, type AddressInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export default function CheckoutAddressPage() {
  const router = useRouter()
  const { items, getTotal } = useCartStore()
  const subtotal = getTotal()
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : SHIPPING_COST * 100
  const total = subtotal + shippingCost

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'France',
    },
  })

  const onSubmit = async (data: AddressInput) => {
    // SÉCURITÉ: Utiliser sessionStorage (données supprimées à la fermeture du navigateur)
    // au lieu de localStorage (persiste indéfiniment)
    sessionStorage.setItem('checkout_address', JSON.stringify(data))

    // Rediriger vers la page de paiement
    router.push('/checkout/paiement')
  }

  // Rediriger si le panier est vide
  if (items.length === 0) {
    router.push('/panier')
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
          <span className="font-semibold">Adresse</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">Paiement</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">Confirmation</span>
        </div>
      </div>

      <h1 className="font-serif text-4xl font-bold mb-8 text-center">
        Adresse de livraison
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulaire */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vos coordonnées</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      className="mt-1"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      className="mt-1"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="street">Adresse *</Label>
                  <Input
                    id="street"
                    {...register('street')}
                    placeholder="Numéro et nom de rue"
                    className="mt-1"
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="streetComplement">
                    Complément d'adresse (optionnel)
                  </Label>
                  <Input
                    id="streetComplement"
                    {...register('streetComplement')}
                    placeholder="Bâtiment, appartement, étage..."
                    className="mt-1"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="postalCode">Code postal *</Label>
                    <Input
                      id="postalCode"
                      {...register('postalCode')}
                      placeholder="75001"
                      className="mt-1"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      className="mt-1"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Pays *</Label>
                  <Input
                    id="country"
                    {...register('country')}
                    defaultValue="France"
                    className="mt-1"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="06 12 34 56 78"
                    className="mt-1"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    asChild
                  >
                    <Link href="/panier">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Retour au panier
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Chargement...' : 'Continuer vers le paiement'}
                    <ArrowRight className="ml-2 h-5 w-5" />
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
              <CardTitle>Résumé</CardTitle>
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
                  {items.length} article{items.length > 1 ? 's' : ''} dans votre panier
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
