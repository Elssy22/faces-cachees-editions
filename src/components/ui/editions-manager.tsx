'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, X, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditionFormat, editionFormatLabels } from '@/types'

export type BookEditionEntry = {
  id?: string // Présent si c'est une édition existante
  format: EditionFormat
  formatLabel?: string
  price: number
  initialStock: number
  currentStock: number
  pageCount?: number
  dimensions?: string
  weightGrams?: number
  ean?: string
  isbn?: string
  coverImageUrl?: string
  isAvailable: boolean
  isPreorder: boolean
  preorderDate?: string
  displayOrder: number
}

interface EditionsManagerProps {
  value: BookEditionEntry[]
  onChange: (editions: BookEditionEntry[]) => void
  // Image de couverture par défaut du livre
  defaultCoverUrl?: string
}

const defaultEdition: Omit<BookEditionEntry, 'format' | 'displayOrder'> = {
  price: 0,
  initialStock: 100,
  currentStock: 100,
  isAvailable: true,
  isPreorder: false,
}

export function EditionsManager({ value, onChange, defaultCoverUrl }: EditionsManagerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // Éviter les problèmes d'hydratation en attendant le montage côté client
  useEffect(() => {
    setMounted(true)
    if (value.length > 0) {
      setExpandedIndex(0)
    }
  }, [])

  const addEdition = () => {
    // Trouver un format non utilisé
    const usedFormats = value.map((e) => e.format)
    const availableFormats = Object.keys(editionFormatLabels) as EditionFormat[]
    const nextFormat = availableFormats.find((f) => !usedFormats.includes(f)) || 'grand_format'

    const newEdition: BookEditionEntry = {
      ...defaultEdition,
      format: nextFormat,
      displayOrder: value.length,
      coverImageUrl: defaultCoverUrl,
    }

    onChange([...value, newEdition])
    setExpandedIndex(value.length)
  }

  const removeEdition = (index: number) => {
    if (value.length <= 1) {
      alert('Un livre doit avoir au moins une édition')
      return
    }
    const newValue = value.filter((_, i) => i !== index)
    onChange(newValue.map((e, i) => ({ ...e, displayOrder: i })))
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1)
    }
  }

  const updateEdition = (index: number, updates: Partial<BookEditionEntry>) => {
    const newValue = [...value]
    newValue[index] = { ...newValue[index], ...updates }
    onChange(newValue)
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  // Formats disponibles (non encore utilisés)
  const getAvailableFormats = (currentFormat: EditionFormat) => {
    const usedFormats = value.map((e) => e.format).filter((f) => f !== currentFormat)
    return (Object.keys(editionFormatLabels) as EditionFormat[]).filter(
      (f) => !usedFormats.includes(f)
    )
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
          <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-3">Aucune édition configurée</p>
          <Button type="button" variant="outline" size="sm" onClick={addEdition}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une édition
          </Button>
        </div>
      ) : (
        <>
          {value.map((edition, index) => (
            <div
              key={`edition-${index}`}
              className="border rounded-lg overflow-hidden bg-white"
            >
              {/* En-tête de l'édition */}
              <div
                className={cn(
                  'flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors',
                  expandedIndex === index && 'bg-gray-50 border-b'
                )}
                onClick={() => toggleExpand(index)}
              >
                <Package className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <span className="font-medium">
                    {editionFormatLabels[edition.format]}
                  </span>
                  {edition.formatLabel && (
                    <span className="text-gray-500 text-sm ml-2">
                      ({edition.formatLabel})
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {edition.price.toFixed(2)} €
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    edition.isAvailable
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {edition.isAvailable ? 'Disponible' : 'Indisponible'}
                </span>
                {expandedIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* Détails de l'édition */}
              {expandedIndex === index && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Format */}
                    <div>
                      <Label className="text-xs">Format</Label>
                      <select
                        value={edition.format}
                        onChange={(e) =>
                          updateEdition(index, { format: e.target.value as EditionFormat })
                        }
                        className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                      >
                        {getAvailableFormats(edition.format).map((format) => (
                          <option key={format} value={format}>
                            {editionFormatLabels[format]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Label personnalisé */}
                    <div>
                      <Label className="text-xs">Label personnalisé (optionnel)</Label>
                      <Input
                        value={edition.formatLabel || ''}
                        onChange={(e) =>
                          updateEdition(index, { formatLabel: e.target.value || undefined })
                        }
                        placeholder="Ex: Édition Collector Limitée"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Prix */}
                    <div>
                      <Label className="text-xs">Prix (€) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={edition.price}
                        onChange={(e) =>
                          updateEdition(index, { price: parseFloat(e.target.value) || 0 })
                        }
                        className="mt-1"
                        required
                      />
                    </div>

                    {/* Stock initial */}
                    <div>
                      <Label className="text-xs">Stock initial</Label>
                      <Input
                        type="number"
                        min="0"
                        value={edition.initialStock}
                        onChange={(e) =>
                          updateEdition(index, { initialStock: parseInt(e.target.value) || 0 })
                        }
                        className="mt-1"
                      />
                    </div>

                    {/* Stock actuel */}
                    <div>
                      <Label className="text-xs">Stock actuel</Label>
                      <Input
                        type="number"
                        min="0"
                        value={edition.currentStock}
                        onChange={(e) =>
                          updateEdition(index, { currentStock: parseInt(e.target.value) || 0 })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* ISBN */}
                    <div>
                      <Label className="text-xs">ISBN</Label>
                      <Input
                        value={edition.isbn || ''}
                        onChange={(e) =>
                          updateEdition(index, { isbn: e.target.value || undefined })
                        }
                        placeholder="978-2-XXX-XXXXX-X"
                        className="mt-1"
                      />
                    </div>

                    {/* EAN */}
                    <div>
                      <Label className="text-xs">EAN</Label>
                      <Input
                        value={edition.ean || ''}
                        onChange={(e) =>
                          updateEdition(index, { ean: e.target.value || undefined })
                        }
                        placeholder="9782XXXXXXXXX"
                        className="mt-1"
                      />
                    </div>

                    {/* Nombre de pages */}
                    <div>
                      <Label className="text-xs">Nombre de pages</Label>
                      <Input
                        type="number"
                        min="0"
                        value={edition.pageCount || ''}
                        onChange={(e) =>
                          updateEdition(index, {
                            pageCount: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Dimensions */}
                    <div>
                      <Label className="text-xs">Dimensions</Label>
                      <Input
                        value={edition.dimensions || ''}
                        onChange={(e) =>
                          updateEdition(index, { dimensions: e.target.value || undefined })
                        }
                        placeholder="15 x 21 cm"
                        className="mt-1"
                      />
                    </div>

                    {/* Poids */}
                    <div>
                      <Label className="text-xs">Poids (grammes)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={edition.weightGrams || ''}
                        onChange={(e) =>
                          updateEdition(index, {
                            weightGrams: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="350"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Image de couverture spécifique */}
                  <div>
                    <Label className="text-xs">
                      Image de couverture spécifique (optionnel)
                    </Label>
                    <Input
                      value={edition.coverImageUrl || ''}
                      onChange={(e) =>
                        updateEdition(index, { coverImageUrl: e.target.value || undefined })
                      }
                      placeholder="URL de l'image (laissez vide pour utiliser l'image par défaut)"
                      className="mt-1"
                    />
                  </div>

                  {/* Disponibilité */}
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edition.isAvailable}
                        onChange={(e) =>
                          updateEdition(index, { isAvailable: e.target.checked })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Disponible à la vente</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edition.isPreorder}
                        onChange={(e) =>
                          updateEdition(index, { isPreorder: e.target.checked })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Précommande</span>
                    </label>
                  </div>

                  {edition.isPreorder && (
                    <div>
                      <Label className="text-xs">Date de disponibilité</Label>
                      <Input
                        type="date"
                        value={edition.preorderDate?.split('T')[0] || ''}
                        onChange={(e) =>
                          updateEdition(index, {
                            preorderDate: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : undefined,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Bouton supprimer */}
                  <div className="pt-2 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEdition(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Supprimer cette édition
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Bouton ajouter une édition */}
          {value.length < Object.keys(editionFormatLabels).length && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEdition}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une autre édition
            </Button>
          )}
        </>
      )}
    </div>
  )
}
