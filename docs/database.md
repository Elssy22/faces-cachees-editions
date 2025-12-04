# Schéma de base de données - Faces Cachées Éditions

## Vue d'ensemble

Base de données PostgreSQL hébergée sur Supabase avec Row Level Security (RLS) activé.

## Tables principales

### 1. `profiles` (Extension de auth.users)

Informations additionnelles des utilisateurs.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  birth_date DATE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'editor', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_profiles_email` ON (email)
- `idx_profiles_role` ON (role)

**RLS:**
- Lecture : utilisateur authentifié peut lire son propre profil
- Mise à jour : utilisateur peut mettre à jour son propre profil
- Admin : accès complet

---

### 2. `authors`

Table des auteurs de la maison d'édition.

```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  photo_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_authors_slug` ON (slug)
- `idx_authors_name` ON (last_name, first_name)

**RLS:**
- Lecture : public
- Écriture : admin/editor seulement

---

### 3. `books`

Catalogue des livres.

```sql
CREATE TYPE book_type AS ENUM (
  'roman',
  'autobiographie',
  'essai',
  'recueil',
  'revue',
  'developpement_personnel'
);

CREATE TYPE publish_status AS ENUM ('draft', 'scheduled', 'published');

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  summary TEXT NOT NULL,
  cover_image_url TEXT,
  book_type book_type NOT NULL,
  genre TEXT,
  tags TEXT[],
  page_count INTEGER,
  dimensions TEXT,
  format_type TEXT,
  ean TEXT,
  isbn TEXT,
  publication_date TIMESTAMPTZ,
  status publish_status DEFAULT 'draft',
  scheduled_publish_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_books_slug` ON (slug)
- `idx_books_author` ON (author_id)
- `idx_books_status` ON (status)
- `idx_books_publication_date` ON (publication_date DESC)
- `idx_books_type` ON (book_type)
- `idx_books_price` ON (price)
- GIN index sur tags : `idx_books_tags` ON (tags)

**RLS:**
- Lecture : public pour status='published', admin/editor pour tous
- Écriture : admin/editor seulement

**Triggers:**
- Auto-update `updated_at` sur modification
- Auto-publish si `scheduled_publish_at` atteint

---

### 4. `media_relays`

Liens médias associés à un livre (Instagram, articles, vidéos).

```sql
CREATE TYPE media_type AS ENUM ('instagram', 'article', 'video', 'podcast');

CREATE TABLE media_relays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  type media_type NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_media_relays_book` ON (book_id)

**RLS:**
- Lecture : public
- Écriture : admin/editor seulement

---

### 5. `addresses`

Adresses de livraison et facturation.

```sql
CREATE TYPE address_type AS ENUM ('billing', 'shipping');

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type address_type NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street TEXT NOT NULL,
  street_complement TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'France',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_addresses_user` ON (user_id)
- `idx_addresses_default` ON (user_id, is_default) WHERE is_default = true

**RLS:**
- Utilisateur peut CRUD ses propres adresses uniquement

---

### 6. `carts`

Paniers des utilisateurs.

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- Pour visiteurs non connectés
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cart_owner_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);
```

**Indexes:**
- `idx_carts_user` ON (user_id)
- `idx_carts_session` ON (session_id)

**RLS:**
- Utilisateur peut voir/modifier son propre panier

---

### 7. `cart_items`

Articles dans les paniers.

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, book_id)
);
```

**Indexes:**
- `idx_cart_items_cart` ON (cart_id)
- `idx_cart_items_book` ON (book_id)

**RLS:**
- Utilisateur peut CRUD les items de son panier

---

### 8. `orders`

Commandes passées.

```sql
CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',

  -- Montants
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Adresses (snapshot au moment de la commande)
  shipping_address JSONB NOT NULL,
  billing_address JSONB,

  -- Paiement
  payment_method TEXT,
  stripe_payment_intent_id TEXT,

  -- Suivi
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_orders_user` ON (user_id)
- `idx_orders_number` ON (order_number)
- `idx_orders_status` ON (status)
- `idx_orders_payment_status` ON (payment_status)
- `idx_orders_created` ON (created_at DESC)

**RLS:**
- Utilisateur peut lire ses propres commandes
- Admin peut tout lire/modifier

---

### 9. `order_items`

Détail des articles commandés.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,

  -- Snapshot du livre au moment de la commande
  book_title TEXT NOT NULL,
  book_subtitle TEXT,
  book_cover_url TEXT,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_order_items_order` ON (order_id)
- `idx_order_items_book` ON (book_id)

**RLS:**
- Utilisateur peut lire les items de ses propres commandes

---

### 10. `abandoned_carts`

Suivi des paniers abandonnés pour relances email.

```sql
CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_abandoned_carts_user` ON (user_id)
- `idx_abandoned_carts_pending` ON (email_sent, created_at) WHERE NOT email_sent

**RLS:**
- Admin seulement

---

### 11. `events`

Événements (dédicaces, conférences, sorties).

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  address TEXT,
  event_url TEXT,
  image_url TEXT,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_events_date` ON (event_date)
- `idx_events_author` ON (author_id)
- `idx_events_book` ON (book_id)
- `idx_events_published` ON (published)

**RLS:**
- Lecture : public si published=true
- Écriture : admin/editor seulement

---

### 12. `blog_posts`

Articles de blog.

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[],
  status publish_status DEFAULT 'draft',
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_blog_posts_slug` ON (slug)
- `idx_blog_posts_status` ON (status)
- `idx_blog_posts_published` ON (published_at DESC)
- `idx_blog_posts_author` ON (author_id)
- GIN index sur tags : `idx_blog_posts_tags` ON (tags)

**RLS:**
- Lecture : public si status='published'
- Écriture : admin/editor seulement

---

### 13. `newsletter_subscriptions`

Inscriptions newsletter.

```sql
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  consent_date TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_newsletter_email` ON (email)
- `idx_newsletter_active` ON (active) WHERE active = true
- `idx_newsletter_token` ON (unsubscribe_token)

**RLS:**
- Lecture : admin seulement
- Création : public (inscription)

---

### 14. `contact_messages`

Messages de contact.

```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_contact_messages_read` ON (read)
- `idx_contact_messages_created` ON (created_at DESC)

**RLS:**
- Création : public
- Lecture : admin seulement

---

### 15. `site_analytics`

Statistiques du site (vues, ventes quotidiennes).

```sql
CREATE TABLE site_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_analytics_date` ON (date DESC)

**RLS:**
- Admin seulement

---

### 16. `payment_methods`

Moyens de paiement des utilisateurs (via Stripe).

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'card', 'sepa_debit', etc.
  last4 TEXT,
  brand TEXT, -- 'visa', 'mastercard', etc.
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_payment_methods_user` ON (user_id)
- `idx_payment_methods_default` ON (user_id, is_default) WHERE is_default = true

**RLS:**
- Utilisateur peut CRUD ses propres moyens de paiement

---

## Relations

```
profiles (1) ──< (N) addresses
profiles (1) ──< (N) carts
profiles (1) ──< (N) orders
profiles (1) ──< (N) payment_methods
profiles (1) ──< (N) blog_posts (author)

authors (1) ──< (N) books
authors (1) ──< (N) events

books (1) ──< (N) media_relays
books (1) ──< (N) cart_items
books (1) ──< (N) order_items
books (1) ──< (N) events

carts (1) ──< (N) cart_items
carts (1) ──< (1) abandoned_carts

orders (1) ──< (N) order_items
```

## Fonctions utilitaires

### 1. Génération automatique du numéro de commande

```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'FCE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
         LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

### 2. Mise à jour automatique de `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Appliqué à toutes les tables avec `updated_at`.

### 3. Auto-publication des livres programmés

```sql
CREATE OR REPLACE FUNCTION auto_publish_books()
RETURNS void AS $$
BEGIN
  UPDATE books
  SET status = 'published',
      publication_date = scheduled_publish_at
  WHERE status = 'scheduled'
    AND scheduled_publish_at <= NOW();
END;
$$ LANGUAGE plpgsql;
```

Exécuté via CRON job.

### 4. Calcul du total d'une commande

```sql
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  subtotal DECIMAL;
BEGIN
  SELECT COALESCE(SUM(total_price), 0)
  INTO subtotal
  FROM order_items
  WHERE order_id = order_uuid;

  RETURN subtotal;
END;
$$ LANGUAGE plpgsql;
```

## Politiques de sécurité (RLS)

### Exemple : Table `books`

```sql
-- Lecture publique des livres publiés
CREATE POLICY "Public read published books"
  ON books FOR SELECT
  USING (status = 'published');

-- Admin/Editor peuvent tout voir
CREATE POLICY "Admin read all books"
  ON books FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Seuls admin/editor peuvent créer/modifier
CREATE POLICY "Admin insert books"
  ON books FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );
```

## Migrations

Les migrations sont versionnées dans `/supabase/migrations/` et numérotées séquentiellement :

1. `001_initial_schema.sql` - Tables de base
2. `002_auth_tables.sql` - Profils et authentification
3. `003_books_authors.sql` - Catalogue
4. `004_orders_cart.sql` - Commandes et panier
5. `005_blog_events.sql` - Blog et événements
6. `006_analytics.sql` - Analytics
7. `007_rls_policies.sql` - Politiques de sécurité
8. `008_functions_triggers.sql` - Fonctions et triggers

## Commandes Supabase CLI

```bash
# Initialiser Supabase localement
supabase init

# Démarrer Supabase localement
supabase start

# Créer une nouvelle migration
supabase migration new <migration_name>

# Appliquer les migrations
supabase db push

# Générer les types TypeScript
supabase gen types typescript --local > src/types/database.ts

# Reset la DB locale
supabase db reset
```

## Seed data

Le fichier `supabase/seed.sql` contient des données de test :
- 2 profils admin
- 5 auteurs
- 20 livres
- 5 articles de blog
- 3 événements

## Performances

### Stratégies d'optimisation

1. **Indexes** : Tous les champs fréquemment filtrés/triés sont indexés
2. **Partitionnement** : Envisager pour `orders` si volume important
3. **Matérialized views** : Pour les statistiques agrégées
4. **Connection pooling** : Via Supabase
5. **Caching** : Next.js ISR pour données peu changeantes

### Monitoring

- Supabase Dashboard pour les métriques DB
- Slow query log activé
- Index usage statistics régulières
