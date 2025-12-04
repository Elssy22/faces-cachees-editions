'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BooksFiltersProps {
  currentType?: string
  currentSort?: string
  bookTypes: Record<string, string>
}

export function BooksFilters({ currentType, currentSort, bookTypes }: BooksFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    // Reset page when filters change
    if (key !== 'page') {
      params.delete('page')
    }

    router.push(`/livres?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Type de livre */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Type de livre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            onClick={() => updateFilter('type', 'all')}
            className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
              !currentType || currentType === 'all'
                ? 'bg-black text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            Tous les livres
          </button>
          {Object.entries(bookTypes).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateFilter('type', key)}
              className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                currentType === key
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Tri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trier par</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={currentSort || 'newest'}
            onValueChange={(value) => updateFilter('sort', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="title">Titre (A-Z)</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
