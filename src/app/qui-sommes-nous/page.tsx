import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Users, Heart, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'

export const metadata = {
  title: 'Notre face cachée',
  description: 'Découvrez Faces Cachées Éditions, notre mission et nos valeurs',
}

export default async function AboutPage() {
  const supabase = await createClient()

  // Charger les cofondateurs
  const { data: founders } = await supabase
    .from('founders')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          Notre face cachée
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Faces Cachées Éditions, c'est avant tout une passion pour la littérature
          et un engagement à révéler des voix singulières
        </p>
      </div>

      {/* Les cofondateurs */}
      {founders && founders.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-3xl font-bold mb-8 text-center">
            Les cofondateurs
          </h2>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {founders.map((founder) => (
              <Card key={founder.id}>
                <CardContent className="p-6 text-center">
                  {founder.photo_url && (
                    <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={founder.photo_url}
                        alt={`${founder.first_name} ${founder.last_name}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!founder.photo_url && (
                    <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-5xl font-bold text-gray-400">
                        {founder.first_name[0]}
                        {founder.last_name[0]}
                      </span>
                    </div>
                  )}
                  <h3 className="font-serif text-2xl font-bold mb-2">
                    {founder.first_name} {founder.last_name}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 mb-4">
                    Cofondateur de Faces Cachées Éditions
                  </p>
                  {founder.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {founder.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Notre histoire */}
      <section className="mb-16">
        <Card>
          <CardContent className="p-8 md:p-12">
            <h2 className="font-serif text-3xl font-bold mb-6">Notre histoire</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Fondée en 2020, Faces Cachées Éditions est née d'une conviction :
                chaque auteur mérite d'être entendu, chaque histoire mérite d'être
                racontée. Dans un paysage éditorial souvent formaté, nous avons
                choisi de faire de la différence notre force.
              </p>
              <p>
                Notre nom, "Faces Cachées", reflète notre mission : révéler des
                talents méconnus, donner la parole à ceux qui ont quelque chose
                d'unique à dire, mettre en lumière des récits authentiques qui
                sortent des sentiers battus.
              </p>
              <p>
                Aujourd'hui, nous accompagnons une quinzaine d'auteurs dans leur
                aventure littéraire, avec un catalogue diversifié allant du roman
                à l'autobiographie, en passant par l'essai et le développement
                personnel.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Nos valeurs */}
      <section className="mb-16">
        <h2 className="font-serif text-3xl font-bold mb-8 text-center">
          Nos valeurs
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <BookOpen className="h-8 w-8" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Authenticité</h3>
              <p className="text-sm text-gray-600">
                Nous privilégions les voix sincères et les récits qui ont du sens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Accompagnement</h3>
              <p className="text-sm text-gray-600">
                Nous soutenons nos auteurs à chaque étape de leur parcours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Heart className="h-8 w-8" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Passion</h3>
              <p className="text-sm text-gray-600">
                Chaque projet est porté avec enthousiasme et professionnalisme
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Target className="h-8 w-8" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Excellence</h3>
              <p className="text-sm text-gray-600">
                Nous garantissons une qualité éditoriale et de fabrication irréprochable
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Notre mission */}
      <section className="mb-16">
        <div className="bg-gray-50 rounded-lg p-8 md:p-12">
          <h2 className="font-serif text-3xl font-bold mb-6 text-center">
            Notre mission
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-gray-700">
            <p className="text-lg">
              <strong>Révéler des talents :</strong> Nous cherchons activement
              des auteurs dont la voix mérite d'être entendue, quel que soit leur
              parcours ou leur notoriété.
            </p>
            <p className="text-lg">
              <strong>Accompagner avec exigence :</strong> De l'écriture à la
              commercialisation, nous offrons un suivi personnalisé et professionnel
              à chacun de nos auteurs.
            </p>
            <p className="text-lg">
              <strong>Créer du lien :</strong> Entre auteurs et lecteurs, nous
              organisons des rencontres, dédicaces et événements qui donnent vie
              aux livres.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="text-center bg-gradient-to-b from-gray-50 to-white py-12 rounded-lg">
        <h2 className="font-serif text-3xl font-bold mb-4">
          Vous avez un projet d'édition ?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Nous sommes toujours à l'écoute de nouveaux talents. N'hésitez pas
          à nous contacter pour nous présenter votre manuscrit.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" asChild>
            <Link href="/contact">Nous contacter</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auteurs">Découvrir nos auteurs</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
