import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Calendar, User, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Le blog',
  description: 'Actualités, coulisses de l\'édition et rencontres avec nos auteurs',
}

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      profiles (
        first_name,
        last_name
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold mb-4">Le blog</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Actualités, coulisses de l'édition et rencontres avec nos auteurs
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {post.cover_image_url && (
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <CardContent className="p-6">
                {post.tags && post.tags.length > 0 && (
                  <Badge variant="secondary" className="mb-3">
                    {post.tags[0]}
                  </Badge>
                )}
                <h2 className="font-serif text-xl font-bold mb-3 line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{post.published_at || post.created_at ? formatDate(post.published_at || post.created_at!) : '-'}</span>
                  </div>
                  {post.profiles && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>
                        {post.profiles.first_name} {post.profiles.last_name}
                      </span>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href={`/blog/${post.slug}`}>
                    Lire l'article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun article publié pour le moment.</p>
        </div>
      )}
    </div>
  )
}
