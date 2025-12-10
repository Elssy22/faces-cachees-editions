Initialising login role...
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          cart_id: string
          cart_total: number
          created_at: string | null
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          items_count: number
          recovered: boolean | null
          recovered_at: string | null
          recovery_order_id: string | null
          user_id: string
        }
        Insert: {
          cart_id: string
          cart_total: number
          created_at?: string | null
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          items_count: number
          recovered?: boolean | null
          recovered_at?: string | null
          recovery_order_id?: string | null
          user_id: string
        }
        Update: {
          cart_id?: string
          cart_total?: number
          created_at?: string | null
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          items_count?: number
          recovered?: boolean | null
          recovered_at?: string | null
          recovery_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abandoned_carts_recovery_order_id_fkey"
            columns: ["recovery_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string | null
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          phone: string | null
          postal_code: string
          street: string
          street_complement: string | null
          type: Database["public"]["Enums"]["address_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string | null
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          phone?: string | null
          postal_code: string
          street: string
          street_complement?: string | null
          type: Database["public"]["Enums"]["address_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          street?: string
          street_complement?: string | null
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      authors: {
        Row: {
          bio: string | null
          created_at: string | null
          facebook_url: string | null
          first_name: string
          id: string
          instagram_url: string | null
          last_name: string
          photo_url: string | null
          slug: string
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string | null
          video_title: string | null
          video_type: string | null
          video_url: string | null
          youtube_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          facebook_url?: string | null
          first_name: string
          id?: string
          instagram_url?: string | null
          last_name: string
          photo_url?: string | null
          slug: string
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          video_title?: string | null
          video_type?: string | null
          video_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          facebook_url?: string | null
          first_name?: string
          id?: string
          instagram_url?: string | null
          last_name?: string
          photo_url?: string | null
          slug?: string
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          video_title?: string | null
          video_type?: string | null
          video_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          scheduled_publish_at: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_authors: {
        Row: {
          author_id: string
          book_id: string
          created_at: string
          display_order: number | null
          id: string
          role: string | null
        }
        Insert: {
          author_id: string
          book_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          role?: string | null
        }
        Update: {
          author_id?: string
          book_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_editions: {
        Row: {
          book_id: string
          cover_image_url: string | null
          created_at: string
          current_stock: number | null
          dimensions: string | null
          display_order: number | null
          ean: string | null
          format: Database["public"]["Enums"]["edition_format"]
          format_label: string | null
          id: string
          initial_stock: number | null
          is_available: boolean | null
          is_preorder: boolean | null
          isbn: string | null
          page_count: number | null
          preorder_date: string | null
          price: number
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          book_id: string
          cover_image_url?: string | null
          created_at?: string
          current_stock?: number | null
          dimensions?: string | null
          display_order?: number | null
          ean?: string | null
          format: Database["public"]["Enums"]["edition_format"]
          format_label?: string | null
          id?: string
          initial_stock?: number | null
          is_available?: boolean | null
          is_preorder?: boolean | null
          isbn?: string | null
          page_count?: number | null
          preorder_date?: string | null
          price: number
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          book_id?: string
          cover_image_url?: string | null
          created_at?: string
          current_stock?: number | null
          dimensions?: string | null
          display_order?: number | null
          ean?: string | null
          format?: Database["public"]["Enums"]["edition_format"]
          format_label?: string | null
          id?: string
          initial_stock?: number | null
          is_available?: boolean | null
          is_preorder?: boolean | null
          isbn?: string | null
          page_count?: number | null
          preorder_date?: string | null
          price?: number
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "book_editions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author_id: string | null
          book_type: Database["public"]["Enums"]["book_type"]
          cover_image_url: string | null
          created_at: string | null
          current_stock: number | null
          dimensions: string | null
          ean: string | null
          format_type: string | null
          genre: string | null
          id: string
          initial_stock: number | null
          isbn: string | null
          page_count: number | null
          price: number
          publication_date: string | null
          scheduled_publish_at: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"] | null
          subtitle: string | null
          summary: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          book_type: Database["public"]["Enums"]["book_type"]
          cover_image_url?: string | null
          created_at?: string | null
          current_stock?: number | null
          dimensions?: string | null
          ean?: string | null
          format_type?: string | null
          genre?: string | null
          id?: string
          initial_stock?: number | null
          isbn?: string | null
          page_count?: number | null
          price: number
          publication_date?: string | null
          scheduled_publish_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"] | null
          subtitle?: string | null
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          book_type?: Database["public"]["Enums"]["book_type"]
          cover_image_url?: string | null
          created_at?: string | null
          current_stock?: number | null
          dimensions?: string | null
          ean?: string | null
          format_type?: string | null
          genre?: string | null
          id?: string
          initial_stock?: number | null
          isbn?: string | null
          page_count?: number | null
          price?: number
          publication_date?: string | null
          scheduled_publish_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"] | null
          subtitle?: string | null
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "books_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          book_id: string
          cart_id: string
          created_at: string | null
          id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          book_id: string
          cart_id: string
          created_at?: string | null
          id?: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          cart_id?: string
          created_at?: string | null
          id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          read: boolean | null
          replied: boolean | null
          replied_at: string | null
          replied_by: string | null
          reply_text: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          read?: boolean | null
          replied?: boolean | null
          replied_at?: string | null
          replied_by?: string | null
          reply_text?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          read?: boolean | null
          replied?: boolean | null
          replied_at?: string | null
          replied_by?: string | null
          reply_text?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_replied_by_fkey"
            columns: ["replied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          author_id: string | null
          book_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_date: string
          event_url: string | null
          id: string
          image_url: string | null
          location: string
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          author_id?: string | null
          book_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          event_url?: string | null
          id?: string
          image_url?: string | null
          location: string
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          author_id?: string | null
          book_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_url?: string | null
          id?: string
          image_url?: string | null
          location?: string
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      founders: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          first_name: string
          id: string
          last_name: string
          photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          first_name: string
          id?: string
          last_name: string
          photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          first_name?: string
          id?: string
          last_name?: string
          photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media_relays: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          title: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id?: string
          title?: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          title?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_relays_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          active: boolean | null
          consent_date: string | null
          created_at: string | null
          email: string
          id: string
          source: string | null
          unsubscribe_token: string | null
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          consent_date?: string | null
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          consent_date?: string | null
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          book_author_name: string | null
          book_cover_url: string | null
          book_id: string | null
          book_subtitle: string | null
          book_title: string
          created_at: string | null
          id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          book_author_name?: string | null
          book_cover_url?: string | null
          book_id?: string | null
          book_subtitle?: string | null
          book_title: string
          created_at?: string | null
          id?: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          book_author_name?: string | null
          book_cover_url?: string | null
          book_id?: string | null
          book_subtitle?: string | null
          book_title?: string
          created_at?: string | null
          id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string | null
          billing_address: Json | null
          cancelled_at: string | null
          created_at: string | null
          customer_note: string | null
          delivered_at: string | null
          id: string
          order_number: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_note?: string | null
          delivered_at?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipped_at?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_note?: string | null
          delivered_at?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string | null
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean | null
          last4: string | null
          stripe_payment_method_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          stripe_payment_method_id: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          new_users_count: number | null
          newsletter_signups: number | null
          orders_count: number | null
          page_views: number | null
          revenue: number | null
          unique_visitors: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          new_users_count?: number | null
          newsletter_signups?: number | null
          orders_count?: number | null
          page_views?: number | null
          revenue?: number | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          new_users_count?: number | null
          newsletter_signups?: number | null
          orders_count?: number | null
          page_views?: number | null
          revenue?: number | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      book_authors_view: {
        Row: {
          author_id: string | null
          author_slug: string | null
          book_id: string | null
          display_order: number | null
          first_name: string | null
          last_name: string | null
          photo_url: string | null
          role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_min_prices: {
        Row: {
          book_id: string | null
          edition_count: number | null
          max_price: number | null
          min_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "book_editions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_publish_blog_posts: { Args: never; Returns: undefined }
      auto_publish_books: { Args: never; Returns: undefined }
      generate_order_number: { Args: never; Returns: string }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_today_stats: {
        Args: never
        Returns: {
          created_at: string | null
          date: string
          id: string
          new_users_count: number | null
          newsletter_signups: number | null
          orders_count: number | null
          page_views: number | null
          revenue: number | null
          unique_visitors: number | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "site_analytics"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_upcoming_events: {
        Args: { limit_count?: number }
        Returns: {
          address: string | null
          author_id: string | null
          book_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_date: string
          event_url: string | null
          id: string
          image_url: string | null
          location: string
          published: boolean | null
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      identify_abandoned_carts: {
        Args: { hours_threshold?: number }
        Returns: {
          cart_id: string
          cart_total: number
          email: string
          items_count: number
          user_id: string
        }[]
      }
      increment_page_view: { Args: { p_date?: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_editor: { Args: never; Returns: boolean }
      mark_cart_recovered: {
        Args: { p_cart_id: string; p_order_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      subscribe_to_newsletter: {
        Args: { p_email: string; p_source?: string; p_user_id?: string }
        Returns: string
      }
      unsubscribe_from_newsletter: {
        Args: { p_token: string }
        Returns: boolean
      }
      update_daily_order_stats: { Args: never; Returns: undefined }
    }
    Enums: {
      address_type: "billing" | "shipping"
      book_type:
        | "roman"
        | "autobiographie"
        | "essai"
        | "recueil"
        | "revue"
        | "developpement_personnel"
      edition_format:
        | "grand_format"
        | "poche"
        | "broche"
        | "relie"
        | "collector"
        | "numerique"
        | "audio"
      media_type: "instagram" | "article" | "video" | "podcast"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      publish_status: "draft" | "scheduled" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      address_type: ["billing", "shipping"],
      book_type: [
        "roman",
        "autobiographie",
        "essai",
        "recueil",
        "revue",
        "developpement_personnel",
      ],
      edition_format: [
        "grand_format",
        "poche",
        "broche",
        "relie",
        "collector",
        "numerique",
        "audio",
      ],
      media_type: ["instagram", "article", "video", "podcast"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      publish_status: ["draft", "scheduled", "published"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
