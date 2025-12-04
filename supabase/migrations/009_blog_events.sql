-- Migration 009: Blog posts and events tables

-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status publish_status DEFAULT 'draft',
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC NULLS LAST)
  WHERE status = 'published';
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX idx_blog_posts_created ON blog_posts(created_at DESC);

-- Full-text search
CREATE INDEX idx_blog_posts_search ON blog_posts USING GIN(
  to_tsvector('french', COALESCE(title, '') || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, ''))
);

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Events table
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_event_dates CHECK (end_date IS NULL OR end_date >= event_date)
);

-- Indexes
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_end_date ON events(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX idx_events_author ON events(author_id);
CREATE INDEX idx_events_book ON events(book_id);
CREATE INDEX idx_events_published ON events(published, event_date)
  WHERE published = true;
CREATE INDEX idx_events_upcoming ON events(event_date)
  WHERE published = true AND event_date >= NOW();

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to get upcoming events
CREATE OR REPLACE FUNCTION get_upcoming_events(limit_count INTEGER DEFAULT 10)
RETURNS SETOF events AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM events
  WHERE published = true
    AND event_date >= NOW()
  ORDER BY event_date ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-publish scheduled blog posts
CREATE OR REPLACE FUNCTION auto_publish_blog_posts()
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET status = 'published',
      published_at = COALESCE(published_at, scheduled_publish_at)
  WHERE status = 'scheduled'
    AND scheduled_publish_at <= NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE blog_posts IS
  'Blog articles from Faces Cachées Éditions';
COMMENT ON TABLE events IS
  'Events such as book signings, conferences, and launch parties';
COMMENT ON FUNCTION get_upcoming_events IS
  'Returns published events starting from now, ordered by date';
