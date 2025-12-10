-- Migration 022: Ajouter support multi-auteurs et multi-éditions pour les livres
-- Cette migration permet:
-- 1. D'avoir plusieurs auteurs par livre (co-auteurs)
-- 2. D'avoir plusieurs éditions/formats par livre (poche, grand format, etc.)

-- ============================================
-- PARTIE 1: TABLE DE LIAISON LIVRE-AUTEURS
-- ============================================

-- Table de liaison pour la relation many-to-many entre livres et auteurs
CREATE TABLE book_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'author', -- 'author', 'co-author', 'illustrator', 'translator', 'preface', etc.
  display_order INTEGER DEFAULT 0, -- Pour l'ordre d'affichage des auteurs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un auteur ne peut être lié qu'une fois à un livre avec le même rôle
  UNIQUE(book_id, author_id, role)
);

-- Index pour les recherches
CREATE INDEX idx_book_authors_book ON book_authors(book_id);
CREATE INDEX idx_book_authors_author ON book_authors(author_id);

-- RLS pour book_authors
ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les relations livre-auteur"
  ON book_authors FOR SELECT
  USING (true);

CREATE POLICY "Les admins peuvent gérer les relations livre-auteur"
  ON book_authors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PARTIE 2: TABLE DES ÉDITIONS/FORMATS
-- ============================================

-- Type enum pour les formats d'édition
CREATE TYPE edition_format AS ENUM (
  'grand_format',
  'poche',
  'broche',
  'relie',
  'collector',
  'numerique',
  'audio'
);

-- Table des éditions (chaque format d'un livre)
CREATE TABLE book_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

  -- Informations de l'édition
  format edition_format NOT NULL,
  format_label TEXT, -- Label personnalisé si besoin (ex: "Édition Collector Limitée")

  -- Prix et stock (déplacés de la table books)
  price DECIMAL(10,2) NOT NULL,
  initial_stock INTEGER DEFAULT 100,
  current_stock INTEGER DEFAULT 100,

  -- Caractéristiques physiques
  page_count INTEGER,
  dimensions TEXT, -- ex: "14 x 21 cm"
  weight_grams INTEGER, -- Poids en grammes (utile pour frais de port)

  -- Identifiants
  ean TEXT,
  isbn TEXT,

  -- Image de couverture spécifique à cette édition (optionnel)
  cover_image_url TEXT,

  -- Statut de disponibilité
  is_available BOOLEAN DEFAULT true,
  is_preorder BOOLEAN DEFAULT false,
  preorder_date TIMESTAMPTZ,

  -- Ordre d'affichage
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un livre ne peut avoir qu'une seule édition par format
  UNIQUE(book_id, format)
);

-- Index pour les recherches
CREATE INDEX idx_book_editions_book ON book_editions(book_id);
CREATE INDEX idx_book_editions_format ON book_editions(format);
CREATE INDEX idx_book_editions_available ON book_editions(is_available);
CREATE INDEX idx_book_editions_price ON book_editions(price);

-- Trigger pour updated_at
CREATE TRIGGER update_book_editions_updated_at
  BEFORE UPDATE ON book_editions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS pour book_editions
ALTER TABLE book_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les éditions"
  ON book_editions FOR SELECT
  USING (true);

CREATE POLICY "Les admins peuvent gérer les éditions"
  ON book_editions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PARTIE 3: MIGRATION DES DONNÉES EXISTANTES
-- ============================================

-- Migrer les relations auteur existantes vers book_authors
INSERT INTO book_authors (book_id, author_id, role, display_order)
SELECT id, author_id, 'author', 0
FROM books
WHERE author_id IS NOT NULL;

-- Migrer les informations de prix/stock existantes vers book_editions
-- On considère que les livres existants sont en "grand format" par défaut
INSERT INTO book_editions (
  book_id,
  format,
  price,
  initial_stock,
  current_stock,
  page_count,
  dimensions,
  ean,
  isbn,
  cover_image_url,
  is_available
)
SELECT
  id,
  'grand_format'::edition_format,
  price,
  COALESCE(initial_stock, 100),
  COALESCE(current_stock, 100),
  page_count,
  dimensions,
  ean,
  isbn,
  cover_image_url,
  true
FROM books
WHERE price IS NOT NULL;

-- ============================================
-- PARTIE 4: VUES UTILES
-- ============================================

-- Vue pour obtenir tous les auteurs d'un livre avec leur rôle
CREATE OR REPLACE VIEW book_authors_view AS
SELECT
  ba.book_id,
  ba.author_id,
  ba.role,
  ba.display_order,
  a.first_name,
  a.last_name,
  a.slug as author_slug,
  a.photo_url
FROM book_authors ba
JOIN authors a ON ba.author_id = a.id
ORDER BY ba.book_id, ba.display_order;

-- Vue pour obtenir le prix minimum d'un livre (toutes éditions confondues)
CREATE OR REPLACE VIEW book_min_prices AS
SELECT
  book_id,
  MIN(price) as min_price,
  MAX(price) as max_price,
  COUNT(*) as edition_count
FROM book_editions
WHERE is_available = true
GROUP BY book_id;

-- ============================================
-- PARTIE 5: COMMENTAIRES
-- ============================================

COMMENT ON TABLE book_authors IS 'Table de liaison pour permettre plusieurs auteurs par livre';
COMMENT ON COLUMN book_authors.role IS 'Rôle de l''auteur: author, co-author, illustrator, translator, preface';
COMMENT ON COLUMN book_authors.display_order IS 'Ordre d''affichage des auteurs (0 = auteur principal)';

COMMENT ON TABLE book_editions IS 'Différentes éditions/formats d''un même livre';
COMMENT ON COLUMN book_editions.format IS 'Format de l''édition: grand_format, poche, broche, relie, collector, numerique, audio';
COMMENT ON COLUMN book_editions.format_label IS 'Label personnalisé pour l''édition si le format standard ne suffit pas';
COMMENT ON COLUMN book_editions.weight_grams IS 'Poids en grammes, utile pour calculer les frais de port';
