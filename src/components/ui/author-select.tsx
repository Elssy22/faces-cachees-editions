'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Check, User, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type Author = {
  id: string
  first_name: string
  last_name: string
}

interface AuthorSelectProps {
  value: string // author_id
  onChange: (authorId: string) => void
  onAuthorCreated?: (author: Author) => void
}

export function AuthorSelect({ value, onChange, onAuthorCreated }: AuthorSelectProps) {
  const [authors, setAuthors] = useState<Author[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newAuthorFirstName, setNewAuthorFirstName] = useState('')
  const [newAuthorLastName, setNewAuthorLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAuthors()
  }, [])

  // Fermer le dropdown quand on clique ailleurs
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
      // Ajouter l'auteur à la liste
      setAuthors((prev) => [...prev, data].sort((a, b) => a.last_name.localeCompare(b.last_name)))
      // Sélectionner le nouvel auteur
      onChange(data.id)
      // Notifier le parent
      onAuthorCreated?.(data)
      // Réinitialiser
      setNewAuthorFirstName('')
      setNewAuthorLastName('')
      setIsCreating(false)
      setIsOpen(false)
    }

    setIsLoading(false)
  }

  const filteredAuthors = authors.filter((author) => {
    const fullName = `${author.first_name} ${author.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  const selectedAuthor = authors.find((a) => a.id === value)

  return (
    <div ref={containerRef} className="relative">
      {/* Champ d'affichage / sélection */}
      <div
        className={cn(
          'flex items-center gap-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm cursor-pointer hover:border-gray-400 transition-colors',
          isOpen && 'ring-2 ring-black ring-offset-1'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="h-4 w-4 text-gray-400" />
        <span className={selectedAuthor ? 'text-gray-900' : 'text-gray-500'}>
          {selectedAuthor
            ? `${selectedAuthor.first_name} ${selectedAuthor.last_name}`
            : 'Sélectionner ou créer un auteur'}
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-80 overflow-hidden">
          {!isCreating ? (
            <>
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
                  filteredAuthors.map((author) => (
                    <div
                      key={author.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors',
                        value === author.id && 'bg-gray-50'
                      )}
                      onClick={() => {
                        onChange(author.id)
                        setIsOpen(false)
                        setSearchQuery('')
                      }}
                    >
                      {value === author.id && <Check className="h-4 w-4 text-green-600" />}
                      <span className={value === author.id ? 'font-medium' : ''}>
                        {author.first_name} {author.last_name}
                      </span>
                    </div>
                  ))
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
                  {isLoading ? 'Création...' : 'Créer'}
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
  )
}
