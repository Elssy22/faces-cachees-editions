'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X, User, Search, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthorRole, authorRoleLabels } from '@/types'

type Author = {
  id: string
  first_name: string
  last_name: string
}

export type BookAuthorEntry = {
  authorId: string
  role: AuthorRole
  displayOrder: number
  // Pour l'affichage
  firstName?: string
  lastName?: string
}

interface MultiAuthorSelectProps {
  value: BookAuthorEntry[]
  onChange: (authors: BookAuthorEntry[]) => void
}

export function MultiAuthorSelect({ value, onChange }: MultiAuthorSelectProps) {
  const [authors, setAuthors] = useState<Author[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newAuthorFirstName, setNewAuthorFirstName] = useState('')
  const [newAuthorLastName, setNewAuthorLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<AuthorRole>('author')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAuthors()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadAuthors = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('authors')
      .select('id, first_name, last_name')
      .order('last_name', { ascending: true })

    if (data) {
      setAuthors(data)
    }
  }

  const generateSlug = (firstName: string, lastName: string) => {
    return `${firstName}-${lastName}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleCreateAuthor = async () => {
    if (!newAuthorFirstName.trim() || !newAuthorLastName.trim()) {
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const slug = generateSlug(newAuthorFirstName, newAuthorLastName)

    const { data, error } = await supabase
      .from('authors')
      .insert({
        first_name: newAuthorFirstName.trim(),
        last_name: newAuthorLastName.trim(),
        slug,
      })
      .select('id, first_name, last_name')
      .single()

    if (error) {
      alert(`Erreur lors de la création de l'auteur: ${error.message}`)
    } else if (data) {
      setAuthors((prev) => [...prev, data].sort((a, b) => a.last_name.localeCompare(b.last_name)))
      // Ajouter l'auteur créé à la sélection
      addAuthor(data)
      setNewAuthorFirstName('')
      setNewAuthorLastName('')
      setIsCreating(false)
    }

    setIsLoading(false)
  }

  const addAuthor = (author: Author) => {
    // Vérifier si l'auteur est déjà ajouté avec ce rôle
    const exists = value.some(
      (a) => a.authorId === author.id && a.role === selectedRole
    )
    if (exists) {
      alert('Cet auteur est déjà ajouté avec ce rôle')
      return
    }

    const newEntry: BookAuthorEntry = {
      authorId: author.id,
      role: selectedRole,
      displayOrder: value.length,
      firstName: author.first_name,
      lastName: author.last_name,
    }

    onChange([...value, newEntry])
    setIsOpen(false)
    setSearchQuery('')
  }

  const removeAuthor = (index: number) => {
    const newValue = value.filter((_, i) => i !== index)
    // Recalculer les ordres
    onChange(newValue.map((a, i) => ({ ...a, displayOrder: i })))
  }

  const updateRole = (index: number, role: AuthorRole) => {
    const newValue = [...value]
    newValue[index] = { ...newValue[index], role }
    onChange(newValue)
  }

  const moveAuthor = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === value.length - 1)
    ) {
      return
    }

    const newValue = [...value]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newValue[index], newValue[targetIndex]] = [newValue[targetIndex], newValue[index]]
    onChange(newValue.map((a, i) => ({ ...a, displayOrder: i })))
  }

  const filteredAuthors = authors.filter((author) => {
    const fullName = `${author.first_name} ${author.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  // Enrichir les valeurs avec les noms des auteurs
  const enrichedValue = value.map((entry) => {
    if (entry.firstName && entry.lastName) return entry
    const author = authors.find((a) => a.id === entry.authorId)
    return {
      ...entry,
      firstName: author?.first_name || '',
      lastName: author?.last_name || '',
    }
  })

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Liste des auteurs sélectionnés */}
      {enrichedValue.length > 0 && (
        <div className="space-y-2">
          {enrichedValue.map((entry, index) => (
            <div
              key={`${entry.authorId}-${entry.role}-${index}`}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border"
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveAuthor(index, 'up')}
                  disabled={index === 0}
                  className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                >
                  <GripVertical className="h-3 w-3" />
                </button>
              </div>

              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <span className="flex-1 font-medium text-sm">
                {entry.firstName} {entry.lastName}
              </span>

              <select
                value={entry.role}
                onChange={(e) => updateRole(index, e.target.value as AuthorRole)}
                className="text-xs border rounded px-2 py-1 bg-white"
              >
                {Object.entries(authorRoleLabels).map(([roleKey, label]) => (
                  <option key={roleKey} value={roleKey}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => removeAuthor(index)}
                className="p-1 hover:bg-red-100 rounded text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un auteur
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-96 overflow-hidden">
            {!isCreating ? (
              <>
                {/* Sélection du rôle */}
                <div className="p-2 border-b bg-gray-50">
                  <label className="text-xs text-gray-600 mb-1 block">Rôle</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as AuthorRole)}
                    className="w-full text-sm border rounded px-2 py-1.5"
                  >
                    {Object.entries(authorRoleLabels).map(([roleKey, label]) => (
                      <option key={roleKey} value={roleKey}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recherche */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un auteur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Liste des auteurs */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredAuthors.length > 0 ? (
                    filteredAuthors.map((author) => {
                      const isAlreadyAdded = value.some(
                        (a) => a.authorId === author.id && a.role === selectedRole
                      )
                      return (
                        <div
                          key={author.id}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors',
                            isAlreadyAdded && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => !isAlreadyAdded && addAuthor(author)}
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <span>
                            {author.first_name} {author.last_name}
                          </span>
                          {isAlreadyAdded && (
                            <span className="text-xs text-gray-400 ml-auto">Déjà ajouté</span>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-3 py-4 text-center text-gray-500 text-sm">
                      Aucun auteur trouvé
                    </div>
                  )}
                </div>

                {/* Bouton créer */}
                <div className="border-t p-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un nouvel auteur
                  </Button>
                </div>
              </>
            ) : (
              /* Formulaire de création */
              <div className="p-4 space-y-4">
                <h4 className="font-medium text-sm">Nouvel auteur</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Prénom</label>
                    <Input
                      placeholder="Prénom"
                      value={newAuthorFirstName}
                      onChange={(e) => setNewAuthorFirstName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Nom</label>
                    <Input
                      placeholder="Nom"
                      value={newAuthorLastName}
                      onChange={(e) => setNewAuthorLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateAuthor}
                    disabled={isLoading || !newAuthorFirstName.trim() || !newAuthorLastName.trim()}
                    className="flex-1"
                  >
                    {isLoading ? 'Création...' : 'Créer et ajouter'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false)
                      setNewAuthorFirstName('')
                      setNewAuthorLastName('')
                    }}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-gray-500">Aucun auteur sélectionné</p>
      )}
    </div>
  )
}
