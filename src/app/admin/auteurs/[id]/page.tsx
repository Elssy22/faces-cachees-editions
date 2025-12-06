'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save, Video, Upload } from 'lucide-react'
import Link from 'next/link'

type VideoType = 'upload' | 'youtube' | 'vimeo' | 'dailymotion' | 'other' | ''

export default function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    slug: '',
    bio: '',
    photo_url: '',
    instagram_url: '',
    twitter_url: '',
    facebook_url: '',
    youtube_url: '',
    tiktok_url: '',
    video_url: '',
    video_type: '' as VideoType,
    video_title: '',
  })

  useEffect(() => {
    loadAuthor()
  }, [id])

  const loadAuthor = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        slug: data.slug || '',
        bio: data.bio || '',
        photo_url: data.photo_url || '',
        instagram_url: data.instagram_url || '',
        twitter_url: data.twitter_url || '',
        facebook_url: data.facebook_url || '',
        youtube_url: data.youtube_url || '',
        tiktok_url: data.tiktok_url || '',
        video_url: (data as { video_url?: string }).video_url || '',
        video_type: ((data as { video_type?: string }).video_type || '') as VideoType,
        video_title: (data as { video_title?: string }).video_title || '',
      })
    }

    setLoading(false)
  }

  // Détection automatique du type de vidéo basé sur l'URL
  const detectVideoType = (url: string): VideoType => {
    if (!url) return ''
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('vimeo.com')) return 'vimeo'
    if (url.includes('dailymotion.com')) return 'dailymotion'
    if (url.includes('supabase.co/storage')) return 'upload'
    return 'other'
  }

  const handleVideoUrlChange = (url: string) => {
    const detectedType = detectVideoType(url)
    setFormData({
      ...formData,
      video_url: url,
      video_type: detectedType,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      const authorData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        slug: formData.slug,
        bio: formData.bio || null,
        photo_url: formData.photo_url || null,
        instagram_url: formData.instagram_url || null,
        twitter_url: formData.twitter_url || null,
        facebook_url: formData.facebook_url || null,
        youtube_url: formData.youtube_url || null,
        tiktok_url: formData.tiktok_url || null,
        video_url: formData.video_url || null,
        video_type: formData.video_type || null,
        video_title: formData.video_title || null,
      }

      const { error } = await supabase
        .from('authors')
        .update(authorData)
        .eq('id', id)

      if (error) {
        alert(`Erreur: ${error.message}`)
      } else {
        router.push('/admin/auteurs')
      }
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
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/auteurs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-serif text-4xl font-bold">Modifier l'auteur</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="first_name">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="last_name">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="slug">
                  Slug (URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /auteurs/{formData.slug}
                </p>
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={6}
                  placeholder="Biographie de l'auteur..."
                />
              </div>

              <div>
                <Label htmlFor="photo_url">URL de la photo</Label>
                <Input
                  id="photo_url"
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, photo_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réseaux sociaux</CardTitle>
              <CardDescription>
                Ajoutez les liens vers les profils de l'auteur. Seuls les réseaux renseignés seront affichés.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook_url: e.target.value })
                    }
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="twitter_url">X (Twitter)</Label>
                  <Input
                    id="twitter_url"
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) =>
                      setFormData({ ...formData, twitter_url: e.target.value })
                    }
                    placeholder="https://x.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram_url: e.target.value })
                    }
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="tiktok_url">TikTok</Label>
                  <Input
                    id="tiktok_url"
                    type="url"
                    value={formData.tiktok_url}
                    onChange={(e) =>
                      setFormData({ ...formData, tiktok_url: e.target.value })
                    }
                    placeholder="https://tiktok.com/@..."
                  />
                </div>

                <div>
                  <Label htmlFor="youtube_url">YouTube (chaîne)</Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) =>
                      setFormData({ ...formData, youtube_url: e.target.value })
                    }
                    placeholder="https://youtube.com/@..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Vidéo de présentation
              </CardTitle>
              <CardDescription>
                Ajoutez une vidéo de présentation de l'auteur. Vous pouvez coller un lien YouTube, Vimeo, Dailymotion
                ou l'URL d'une vidéo uploadée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="video_url">URL de la vidéo</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                />
                {formData.video_type && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    Type détecté : {formData.video_type === 'upload' ? 'Fichier uploadé' : formData.video_type.charAt(0).toUpperCase() + formData.video_type.slice(1)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="video_type">Type de vidéo</Label>
                <select
                  id="video_type"
                  value={formData.video_type}
                  onChange={(e) =>
                    setFormData({ ...formData, video_type: e.target.value as VideoType })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">-- Aucune vidéo --</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="dailymotion">Dailymotion</option>
                  <option value="upload">Fichier uploadé</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <Label htmlFor="video_title">Titre de la vidéo (optionnel)</Label>
                <Input
                  id="video_title"
                  value={formData.video_title}
                  onChange={(e) =>
                    setFormData({ ...formData, video_title: e.target.value })
                  }
                  placeholder="Ex: Interview exclusive, Présentation du livre..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/auteurs')}
              disabled={saving}
            >
              Annuler
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
