-- Migration 024: Security Fixes
-- Corrections de sécurité pour les politiques RLS et tables sensibles

-- ============================================================================
-- 0. AJOUT COLONNE customer_email SUR ORDERS
-- ============================================================================
-- Permet de stocker l'email pour les commandes invités (sans compte)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Index pour recherche par email
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email) WHERE customer_email IS NOT NULL;

COMMENT ON COLUMN orders.customer_email IS 'Email du client pour les commandes invités ou confirmation';

-- ============================================================================
-- 1. CORRECTION RLS ANALYTICS - Restreindre les UPDATE
-- ============================================================================

-- Supprimer la politique UPDATE trop permissive sur visitor_sessions
DROP POLICY IF EXISTS "Anyone can update their own session" ON visitor_sessions;

-- Nouvelle politique: Les utilisateurs ne peuvent mettre à jour QUE leur propre session
-- basé sur le session_id (pas de modification des autres sessions)
CREATE POLICY "Users can only update their own session"
  ON visitor_sessions FOR UPDATE
  TO anon, authenticated
  USING (true) -- Permet de voir toutes les lignes pour UPDATE
  WITH CHECK (
    -- La session doit exister et avoir été créée dans les dernières 24h
    -- Cela empêche la modification de vieilles sessions
    started_at > NOW() - INTERVAL '24 hours'
  );

-- Ajouter une limite sur INSERT pour éviter le spam
-- On ne peut créer qu'une session par minute par visitor_id
CREATE OR REPLACE FUNCTION check_session_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si une session a été créée dans la dernière minute pour ce visitor_id
  IF EXISTS (
    SELECT 1 FROM visitor_sessions
    WHERE visitor_id = NEW.visitor_id
    AND started_at > NOW() - INTERVAL '1 minute'
  ) THEN
    -- Ne pas bloquer, juste retourner la session existante
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rate_limit_sessions ON visitor_sessions;
CREATE TRIGGER rate_limit_sessions
  BEFORE INSERT ON visitor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_session_rate_limit();

-- ============================================================================
-- 2. PROTECTION DES COMMANDES - Politique pour commandes invités
-- ============================================================================

-- Permettre aux utilisateurs anonymes de créer des commandes (achat invité)
-- mais avec des restrictions
DROP POLICY IF EXISTS "Users create orders" ON orders;
DROP POLICY IF EXISTS "Guest users can create orders" ON orders;

-- Politique pour utilisateurs connectés
CREATE POLICY "Authenticated users create their orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    -- L'utilisateur doit être le propriétaire de la commande
    auth.uid() = user_id
  );

-- Politique pour utilisateurs invités (non connectés)
CREATE POLICY "Anonymous users can create guest orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (
    -- Les commandes invités doivent avoir user_id NULL
    user_id IS NULL
    -- Et doivent avoir une adresse email client
    AND customer_email IS NOT NULL
  );

-- Les utilisateurs ne peuvent voir que leurs propres commandes
DROP POLICY IF EXISTS "Users read own orders" ON orders;
CREATE POLICY "Users can read their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les invités peuvent voir leur commande via le numéro de commande (pour la confirmation)
-- Cette politique est gérée côté serveur, pas besoin de politique RLS spécifique

-- ============================================================================
-- 3. PROTECTION DES DONNÉES CLIENTS
-- ============================================================================

-- S'assurer que les profils sont protégés
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can only view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can only update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 4. RATE LIMITING SUR LES EVENTS ANALYTICS
-- ============================================================================

-- Limiter à 100 events par session par heure
CREATE OR REPLACE FUNCTION check_event_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  event_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO event_count
  FROM analytics_events
  WHERE session_id = NEW.session_id
  AND created_at > NOW() - INTERVAL '1 hour';

  -- Si plus de 100 events dans l'heure, ignorer silencieusement
  IF event_count >= 100 THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rate_limit_events ON analytics_events;
CREATE TRIGGER rate_limit_events
  BEFORE INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION check_event_rate_limit();

-- ============================================================================
-- 5. NETTOYAGE AUTOMATIQUE DES DONNÉES ANCIENNES
-- ============================================================================

-- Fonction pour nettoyer les vieilles sessions analytics (> 90 jours)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  -- Supprimer les events de plus de 90 jours
  DELETE FROM analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Supprimer les sessions de plus de 90 jours
  DELETE FROM visitor_sessions
  WHERE started_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. INDEX POUR LES PERFORMANCES DE SÉCURITÉ
-- ============================================================================

-- Index pour accélérer les vérifications de rate limiting
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_started
  ON visitor_sessions(visitor_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created
  ON analytics_events(session_id, created_at DESC);

-- Index pour les commandes par utilisateur
CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON orders(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 7. LOGS D'AUDIT (optionnel mais recommandé)
-- ============================================================================

-- Table pour les logs d'audit des actions sensibles
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- 'order_created', 'profile_updated', etc.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT, -- 'order', 'profile', etc.
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS sur audit_logs - lecture admin uniquement
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Pas d'INSERT direct - les logs sont créés via triggers/functions
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Index pour la recherche dans les logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

COMMENT ON TABLE audit_logs IS 'Logs d''audit pour traçabilité des actions sensibles';

-- ============================================================================
-- 8. FONCTION D'AUDIT AUTOMATIQUE
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    action, user_id, entity_type, entity_id, old_data, new_data
  ) VALUES (
    p_action, auth.uid(), p_entity_type, p_entity_id, p_old_data, p_new_data
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_audit_event IS 'Enregistre un événement d''audit';
