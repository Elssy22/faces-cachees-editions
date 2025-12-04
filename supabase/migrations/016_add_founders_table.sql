-- Migration 016: Founders table for "Qui sommes-nous" page

CREATE TABLE founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  photo_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_founders_display_order ON founders(display_order);

-- Trigger for updated_at
CREATE TRIGGER update_founders_updated_at
  BEFORE UPDATE ON founders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default founders
INSERT INTO founders (first_name, last_name, description, display_order)
VALUES
  ('Prénom 1', 'Nom 1', 'Description du premier cofondateur de Faces Cachées Éditions.', 1),
  ('Prénom 2', 'Nom 2', 'Description du second cofondateur de Faces Cachées Éditions.', 2);

COMMENT ON TABLE founders IS
  'Founders/co-founders information for the "Qui sommes-nous" page';
