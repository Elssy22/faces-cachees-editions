import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const bookCovers = [
  {
    slug: 'face-b-lamour-revele-nos-identites',
    cover_image_url: 'https://assets.bigcartel.com/product_images/412478760/Bissai+2+plat+1.jpg?auto=format&fit=max&h=1200&w=1200'
  },
  {
    slug: 'histoire-football-africain',
    cover_image_url: 'https://assets.bigcartel.com/product_images/412338321/couverture_histoire_foot_africain_page-0001.jpg?auto=format&fit=max&h=1200&w=1200'
  },
  {
    slug: 'les-buts-de-ma-vie',
    cover_image_url: 'https://assets.bigcartel.com/product_images/412076082/Rai+1ere+de+couv.jpg?auto=format&fit=max&h=1200&w=1200'
  },
  {
    slug: 'paris-noir',
    cover_image_url: 'https://assets.bigcartel.com/product_images/404019750/Paris+noir+-+couv+plat+1+bandeau.jpg?auto=format&fit=max&h=1200&w=1200'
  },
  {
    slug: 'si-tu-savais',
    cover_image_url: 'https://assets.bigcartel.com/product_images/401630910/Couv+avec+bandeau_HD.jpg?auto=format&fit=max&h=1200&w=1200'
  },
  {
    slug: 'face-b-1',
    cover_image_url: 'https://assets.bigcartel.com/product_images/393500448/bissai+couv+plat+1.jpg?auto=format&fit=max&h=1200&w=1200'
  },
  {
    slug: 'les-dudes',
    cover_image_url: 'https://assets.bigcartel.com/product_images/391224111/Dudes-Plat-1.jpeg?auto=format&fit=max&h=1200&w=1200'
  },
  {
    slug: 'libere',
    cover_image_url: 'https://assets.bigcartel.com/product_images/389636796/BAKHAW-cover.jpg?auto=format&fit=max&h=1200&w=1200'
  },
  {
    slug: 'a-bras-le-corps',
    cover_image_url: 'https://assets.bigcartel.com/product_images/382478898/A+bras+le+corps+-+couv+HD.jpg?auto=format&fit=max&h=1200&w=1200'
  }
]

async function updateBookCovers() {
  console.log('🚀 Début de la mise à jour des couvertures de livres...\n')

  for (const book of bookCovers) {
    console.log(`📚 Mise à jour de "${book.slug}"...`)

    const { data, error } = await supabase
      .from('books')
      .update({ cover_image_url: book.cover_image_url })
      .eq('slug', book.slug)
      .select()

    if (error) {
      console.error(`❌ Erreur pour "${book.slug}":`, error.message)
    } else if (data && data.length > 0) {
      console.log(`✅ "${book.slug}" mis à jour avec succès`)
    } else {
      console.log(`⚠️  Livre non trouvé: "${book.slug}"`)
    }
  }

  console.log('\n✨ Mise à jour terminée!')
}

updateBookCovers()
