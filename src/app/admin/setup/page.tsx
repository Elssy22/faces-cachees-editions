'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

const setupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
})

type SetupInput = z.infer<typeof setupSchema>

export default function AdminSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupInput>({
    resolver: zodResolver(setupSchema),
  })

  const onSubmit = async (data: SetupInput) => {
    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Créer le compte utilisateur
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (signUpError) throw signUpError

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte')
      }

      // 2. Attendre un peu pour que le profil soit créé
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 3. Mettre à jour le profil avec les informations et le rôle admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          role: 'admin',
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Erreur profil:', profileError)
        throw profileError
      }

      toast({
        title: 'Compte admin créé !',
        description: 'Vous pouvez maintenant accéder au back-office',
        variant: 'success',
      })

      // 4. Se connecter automatiquement
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) throw signInError

      // 5. Rediriger vers le dashboard admin
      setTimeout(() => {
        router.push('/admin')
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error('Erreur setup:', error)
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Configuration Admin
          </CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            Créez votre premier compte administrateur
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  disabled={loading}
                  className="mt-1"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  disabled={loading}
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={loading}
                className="mt-1"
                placeholder="admin@faces-cachees.fr"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={loading}
                className="mt-1"
                placeholder="Minimum 8 caractères"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer le compte admin'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <a href="/auth/login" className="text-blue-600 hover:underline">
                Se connecter
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
