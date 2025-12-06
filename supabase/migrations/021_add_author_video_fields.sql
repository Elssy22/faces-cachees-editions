-- Migration: Ajout des champs vidéo pour les auteurs
-- Permet d'intégrer des vidéos uploadées ou des liens de streaming (YouTube, Vimeo, etc.)

-- Ajouter les colonnes vidéo à la table authors
ALTER TABLE authors
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_type TEXT CHECK (video_type IN ('upload', 'youtube', 'vimeo', 'dailymotion', 'other')),
ADD COLUMN IF NOT EXISTS video_title TEXT;

-- Commentaires pour documentation
COMMENT ON COLUMN authors.video_url IS 'URL de la vidéo (uploadée sur Supabase Storage ou lien externe)';
COMMENT ON COLUMN authors.video_type IS 'Type de vidéo: upload (fichier), youtube, vimeo, dailymotion, other';
COMMENT ON COLUMN authors.video_title IS 'Titre optionnel de la vidéo';
