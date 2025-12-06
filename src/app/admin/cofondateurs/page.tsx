'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save } from 'lucide-react'

type Founder = {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  description: string | null
  display_order: number | null
}

export default function FoundersAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [founders, setFounders] = useState<Founder[]>([])

  useEffect(() => {
    loadFounders()
  }, [])

  const loadFounders = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('founders')
      .select('*')
      .order('display_order', { ascending: true })

    if (data) {
      setFounders(data)
    }
    setLoading(false)
  }

  const handleUpdate = (index: number, field: keyof Founder, value: string) => {
    const updated = [...founders]
    updated[index] = { ...updated[index], [field]: value }
    setFounders(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      for (const founder of founders) {
        const { error } = await supabase
          .from('founders')
          .update({
            first_name: founder.first_name,
            last_name: founder.last_name,
            photo_url: founder.photo_url || null,
            description: founder.description || null,
          })
          .eq('id', founder.id)

        if (error) throw error
      }

      alert('Cofondateurs mis à jour avec succès')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">
          Gestion des cofondateurs
        </h1>
        <p className="text-gray-600">
          Modifiez les informations affichées sur la page "Notre face cachée"
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {founders.map((founder, index) => (
          <Card key={founder.id}>
            <CardHeader>
              <CardTitle>Cofondateur {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor={`first_name_${index}`}>Prénom</Label>
                  <Input
                    id={`first_name_${index}`}
                    value={founder.first_name}
                    onChange={(e) =>
                      handleUpdate(index, 'first_name', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`last_name_${index}`}>Nom</Label>
                  <Input
                    id={`last_name_${index}`}
                    value={founder.last_name}
                    onChange={(e) =>
                      handleUpdate(index, 'last_name', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`photo_url_${index}`}>URL de la photo</Label>
                <Input
                  id={`photo_url_${index}`}
                  type="url"
                  value={founder.photo_url || ''}
                  onChange={(e) =>
                    handleUpdate(index, 'photo_url', e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor={`description_${index}`}>
                  Texte de présentation
                </Label>
                <Textarea
                  id={`description_${index}`}
                  value={founder.description || ''}
                  onChange={(e) =>
                    handleUpdate(index, 'description', e.target.value)
                  }
                  rows={4}
                  placeholder="Décrivez le parcours et le rôle du cofondateur..."
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  )
}
