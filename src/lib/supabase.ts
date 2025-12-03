import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          birth_date: string | null
          preferred_payment_method: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          birth_date?: string | null
          preferred_payment_method?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          birth_date?: string | null
          preferred_payment_method?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          slug: string
          author_id: string
          price: number
          summary: string
          cover_image_url: string | null
          book_type: string
          genre: string | null
          tags: string[] | null
          page_count: number | null
          dimensions: string | null
          format_type: string | null
          ean: string | null
          isbn: string | null
          publication_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          slug: string
          author_id: string
          price: number
          summary: string
          cover_image_url?: string | null
          book_type: string
          genre?: string | null
          tags?: string[] | null
          page_count?: number | null
          dimensions?: string | null
          format_type?: string | null
          ean?: string | null
          isbn?: string | null
          publication_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          slug?: string
          author_id?: string
          price?: number
          summary?: string
          cover_image_url?: string | null
          book_type?: string
          genre?: string | null
          tags?: string[] | null
          page_count?: number | null
          dimensions?: string | null
          format_type?: string | null
          ean?: string | null
          isbn?: string | null
          publication_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      authors: {
        Row: {
          id: string
          first_name: string
          last_name: string
          bio: string | null
          photo_url: string | null
          instagram_url: string | null
          tiktok_url: string | null
          facebook_url: string | null
          twitter_url: string | null
          youtube_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          bio?: string | null
          photo_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          facebook_url?: string | null
          twitter_url?: string | null
          youtube_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          bio?: string | null
          photo_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          facebook_url?: string | null
          twitter_url?: string | null
          youtube_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client
export const createSupabaseClient = () => 
  createClientComponentClient<Database>()

// Server-side Supabase client
export const createSupabaseServer = () =>
  createServerComponentClient<Database>({ cookies })

// Admin client with service role key
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)