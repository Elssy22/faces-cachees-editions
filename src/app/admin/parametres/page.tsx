'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Store, Mail, Truck } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">Paramètres</h1>
        <p className="text-gray-600">
          Configuration générale de la boutique
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informations de la boutique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="store-name">Nom de la boutique</Label>
              <Input
                id="store-name"
                defaultValue="Faces Cachées Éditions"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="store-email">Email de contact</Label>
              <Input
                id="store-email"
                type="email"
                defaultValue="contact@faces-cachees.fr"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="store-phone">Téléphone</Label>
              <Input
                id="store-phone"
                type="tel"
                defaultValue="+33 1 23 45 67 89"
                className="mt-1"
              />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notifications email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nouvelles commandes</p>
                <p className="text-sm text-gray-600">
                  Recevoir une notification pour chaque nouvelle commande
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Messages de contact</p>
                <p className="text-sm text-gray-600">
                  Recevoir les messages du formulaire de contact
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Faible stock</p>
                <p className="text-sm text-gray-600">
                  Alerte lorsqu'un livre a un stock faible
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="shipping-cost">Frais de port (€)</Label>
              <Input
                id="shipping-cost"
                type="number"
                step="0.01"
                defaultValue="5.90"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="free-shipping">
                Livraison gratuite à partir de (€)
              </Label>
              <Input
                id="free-shipping"
                type="number"
                step="0.01"
                defaultValue="50.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="delivery-time">Délai de livraison (jours)</Label>
              <Input
                id="delivery-time"
                type="number"
                defaultValue="3-5"
                className="mt-1"
              />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Options avancées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mode maintenance</Label>
              <p className="text-sm text-gray-600 mb-2">
                Désactiver temporairement la boutique pour maintenance
              </p>
              <Button variant="outline">Activer la maintenance</Button>
            </div>
            <div>
              <Label>Sauvegarde des données</Label>
              <p className="text-sm text-gray-600 mb-2">
                Exporter toutes les données de la boutique
              </p>
              <Button variant="outline">Exporter les données</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
