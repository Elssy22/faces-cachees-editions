-- Migration 003: Authors table

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

-- Indexes
CREATE INDEX idx_authors_slug ON authors(slug);
CREATE INDEX idx_authors_name ON authors(last_name, first_name);
CREATE INDEX idx_authors_created ON authors(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to auto-generate slug
CREATE OR REPLACE FUNCTION generate_author_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  counter INTEGER := 0;
  new_slug TEXT;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := LOWER(REGEXP_REPLACE(
      UNACCENT(NEW.first_name || '-' || NEW.last_name),
      '[^a-z0-9]+', '-', 'g'
    ));

    new_slug := base_slug;

    WHILE EXISTS (SELECT 1 FROM authors WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := new_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_author_slug_trigger
  BEFORE INSERT OR UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION generate_author_slug();

COMMENT ON TABLE authors IS
  'Authors published by Faces Cachées Éditions';
COMMENT ON COLUMN authors.slug IS
  'URL-friendly identifier, auto-generated from name if not provided';
