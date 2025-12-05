-- Migration 020: Site settings table for featured book management

CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on key
CREATE INDEX idx_site_settings_key ON site_settings(key);

-- Trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default featured book setting
INSERT INTO site_settings (key, value, description)
VALUES (
  'featured_book',
  '{"book_id": null}'::jsonb,
  'ID du livre mis en vedette sur la page d''accueil'
);

-- RLS policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Public can read site_settings" ON site_settings
  FOR SELECT TO public USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update site_settings" ON site_settings
  FOR UPDATE TO authenticated
  USING (is_admin_or_editor())
  WITH CHECK (is_admin_or_editor());

COMMENT ON TABLE site_settings IS
  'Site-wide settings stored as key-value pairs';
