-- Migration 004: Books and media relays tables

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
  tags TEXT[] DEFAULT '{}',
  page_count INTEGER CHECK (page_count > 0),
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

-- Indexes
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_publication_date ON books(publication_date DESC NULLS LAST);
CREATE INDEX idx_books_type ON books(book_type);
CREATE INDEX idx_books_price ON books(price);
CREATE INDEX idx_books_created ON books(created_at DESC);
CREATE INDEX idx_books_tags ON books USING GIN(tags);

-- Full-text search index
CREATE INDEX idx_books_search ON books USING GIN(
  to_tsvector('french', COALESCE(title, '') || ' ' || COALESCE(subtitle, '') || ' ' || COALESCE(summary, ''))
);

-- Trigger for updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to auto-publish scheduled books
CREATE OR REPLACE FUNCTION auto_publish_books()
RETURNS void AS $$
BEGIN
  UPDATE books
  SET status = 'published',
      publication_date = COALESCE(publication_date, scheduled_publish_at)
  WHERE status = 'scheduled'
    AND scheduled_publish_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Media relays table
CREATE TABLE media_relays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  type media_type NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_media_relays_book ON media_relays(book_id);
CREATE INDEX idx_media_relays_type ON media_relays(type);

COMMENT ON TABLE books IS
  'Books catalog published by Faces Cachées Éditions';
COMMENT ON COLUMN books.status IS
  'Publication status: draft, scheduled (auto-publish at scheduled_publish_at), published';
COMMENT ON TABLE media_relays IS
  'Media coverage and social media posts related to books';
