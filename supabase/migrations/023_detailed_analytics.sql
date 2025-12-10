-- Migration 023: Detailed Analytics and Event Tracking
-- Système complet de tracking des visiteurs et événements

-- Table des sessions visiteurs
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  visitor_id TEXT NOT NULL, -- ID anonyme persistant (cookie)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Si connecté
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  -- Informations de provenance
  referrer TEXT,
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  -- Informations techniques
  user_agent TEXT,
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  -- Métriques de session
  page_views_count INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des événements (page views, clics, etc.)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- page_view, click, scroll, add_to_cart, purchase, etc.
  -- Page info
  page_path TEXT NOT NULL,
  page_title TEXT,
  -- Contexte de l'événement
  entity_type TEXT, -- book, author, event, etc.
  entity_id UUID,
  entity_name TEXT,
  -- Données additionnelles
  event_data JSONB DEFAULT '{}',
  -- Temps passé sur la page précédente (pour page_view)
  time_on_previous_page INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des pages les plus vues (agrégation quotidienne)
CREATE TABLE IF NOT EXISTS page_views_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  entity_type TEXT,
  entity_id UUID,
  views_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, page_path)
);

-- Table des sources de trafic (agrégation quotidienne)
CREATE TABLE IF NOT EXISTS traffic_sources_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  source_type TEXT NOT NULL, -- direct, organic, referral, social, email, paid
  source_name TEXT DEFAULT '', -- google, facebook, newsletter, etc.
  referrer_domain TEXT DEFAULT '',
  sessions_count INTEGER DEFAULT 0,
  page_views_count INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, source_type, source_name, referrer_domain)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_started_at ON visitor_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_referrer_domain ON visitor_sessions(referrer_domain);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity ON analytics_events(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_page_views_daily_date ON page_views_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_daily_entity ON page_views_daily(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_traffic_sources_daily_date ON traffic_sources_daily(date DESC);

-- Fonction pour enregistrer un événement
CREATE OR REPLACE FUNCTION track_event(
  p_session_id TEXT,
  p_visitor_id TEXT,
  p_event_type TEXT,
  p_page_path TEXT,
  p_page_title TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}',
  p_time_on_previous_page INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Insérer l'événement
  INSERT INTO analytics_events (
    session_id, visitor_id, event_type, page_path, page_title,
    entity_type, entity_id, entity_name, event_data, time_on_previous_page
  ) VALUES (
    p_session_id, p_visitor_id, p_event_type, p_page_path, p_page_title,
    p_entity_type, p_entity_id, p_entity_name, p_event_data, p_time_on_previous_page
  )
  RETURNING id INTO v_event_id;

  -- Mettre à jour la session si c'est un page_view
  IF p_event_type = 'page_view' THEN
    UPDATE visitor_sessions
    SET
      last_activity_at = NOW(),
      page_views_count = page_views_count + 1,
      events_count = events_count + 1,
      is_bounce = CASE WHEN page_views_count >= 1 THEN false ELSE is_bounce END
    WHERE session_id = p_session_id;
  ELSE
    UPDATE visitor_sessions
    SET
      last_activity_at = NOW(),
      events_count = events_count + 1
    WHERE session_id = p_session_id;
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer ou récupérer une session
CREATE OR REPLACE FUNCTION get_or_create_session(
  p_session_id TEXT,
  p_visitor_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL
)
RETURNS visitor_sessions AS $$
DECLARE
  v_session visitor_sessions;
  v_referrer_domain TEXT;
BEGIN
  -- Extraire le domaine du referrer
  IF p_referrer IS NOT NULL AND p_referrer != '' THEN
    v_referrer_domain := substring(p_referrer from 'https?://([^/]+)');
  END IF;

  -- Essayer de récupérer la session existante
  SELECT * INTO v_session
  FROM visitor_sessions
  WHERE session_id = p_session_id;

  IF v_session.id IS NOT NULL THEN
    -- Mettre à jour last_activity
    UPDATE visitor_sessions
    SET last_activity_at = NOW(),
        user_id = COALESCE(p_user_id, user_id)
    WHERE session_id = p_session_id;

    SELECT * INTO v_session FROM visitor_sessions WHERE session_id = p_session_id;
  ELSE
    -- Créer une nouvelle session
    INSERT INTO visitor_sessions (
      session_id, visitor_id, user_id,
      referrer, referrer_domain,
      utm_source, utm_medium, utm_campaign,
      user_agent, device_type, browser, os
    ) VALUES (
      p_session_id, p_visitor_id, p_user_id,
      p_referrer, v_referrer_domain,
      p_utm_source, p_utm_medium, p_utm_campaign,
      p_user_agent, p_device_type, p_browser, p_os
    )
    RETURNING * INTO v_session;
  END IF;

  RETURN v_session;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques de trafic
CREATE OR REPLACE FUNCTION get_traffic_stats(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'summary', (
      SELECT json_build_object(
        'total_sessions', COUNT(DISTINCT session_id),
        'total_visitors', COUNT(DISTINCT visitor_id),
        'total_page_views', SUM(page_views_count),
        'avg_pages_per_session', ROUND(AVG(page_views_count)::numeric, 2),
        'bounce_rate', ROUND((COUNT(*) FILTER (WHERE is_bounce = true)::numeric / NULLIF(COUNT(*), 0) * 100), 2)
      )
      FROM visitor_sessions
      WHERE started_at >= p_start_date AND started_at < p_end_date + INTERVAL '1 day'
    ),
    'daily_visitors', (
      SELECT json_agg(daily ORDER BY day)
      FROM (
        SELECT
          DATE(started_at) as day,
          COUNT(DISTINCT visitor_id) as visitors,
          COUNT(DISTINCT session_id) as sessions,
          SUM(page_views_count) as page_views
        FROM visitor_sessions
        WHERE started_at >= p_start_date AND started_at < p_end_date + INTERVAL '1 day'
        GROUP BY DATE(started_at)
      ) daily
    ),
    'top_pages', (
      SELECT json_agg(pages ORDER BY views DESC)
      FROM (
        SELECT
          page_path,
          MAX(page_title) as page_title,
          MAX(entity_type) as entity_type,
          MAX(entity_id) as entity_id,
          MAX(entity_name) as entity_name,
          COUNT(*) as views,
          COUNT(DISTINCT visitor_id) as unique_visitors
        FROM analytics_events
        WHERE event_type = 'page_view'
          AND created_at >= p_start_date AND created_at < p_end_date + INTERVAL '1 day'
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 20
      ) pages
    ),
    'top_books', (
      SELECT json_agg(books ORDER BY views DESC)
      FROM (
        SELECT
          entity_id as book_id,
          MAX(entity_name) as title,
          COUNT(*) as views,
          COUNT(DISTINCT visitor_id) as unique_visitors
        FROM analytics_events
        WHERE event_type = 'page_view'
          AND entity_type = 'book'
          AND created_at >= p_start_date AND created_at < p_end_date + INTERVAL '1 day'
        GROUP BY entity_id
        ORDER BY views DESC
        LIMIT 10
      ) books
    ),
    'top_authors', (
      SELECT json_agg(authors ORDER BY views DESC)
      FROM (
        SELECT
          entity_id as author_id,
          MAX(entity_name) as name,
          COUNT(*) as views,
          COUNT(DISTINCT visitor_id) as unique_visitors
        FROM analytics_events
        WHERE event_type = 'page_view'
          AND entity_type = 'author'
          AND created_at >= p_start_date AND created_at < p_end_date + INTERVAL '1 day'
        GROUP BY entity_id
        ORDER BY views DESC
        LIMIT 10
      ) authors
    ),
    'traffic_sources', (
      SELECT json_agg(sources ORDER BY sessions DESC)
      FROM (
        SELECT
          CASE
            WHEN referrer_domain IS NULL OR referrer_domain = '' THEN 'Direct'
            WHEN utm_source IS NOT NULL THEN utm_source
            WHEN referrer_domain LIKE '%google%' THEN 'Google'
            WHEN referrer_domain LIKE '%facebook%' OR referrer_domain LIKE '%fb.%' THEN 'Facebook'
            WHEN referrer_domain LIKE '%instagram%' THEN 'Instagram'
            WHEN referrer_domain LIKE '%twitter%' OR referrer_domain LIKE '%x.com%' THEN 'Twitter/X'
            WHEN referrer_domain LIKE '%linkedin%' THEN 'LinkedIn'
            ELSE referrer_domain
          END as source,
          COUNT(DISTINCT session_id) as sessions,
          COUNT(DISTINCT visitor_id) as visitors,
          SUM(page_views_count) as page_views,
          ROUND((COUNT(*) FILTER (WHERE is_bounce = true)::numeric / NULLIF(COUNT(*), 0) * 100), 2) as bounce_rate
        FROM visitor_sessions
        WHERE started_at >= p_start_date AND started_at < p_end_date + INTERVAL '1 day'
        GROUP BY
          CASE
            WHEN referrer_domain IS NULL OR referrer_domain = '' THEN 'Direct'
            WHEN utm_source IS NOT NULL THEN utm_source
            WHEN referrer_domain LIKE '%google%' THEN 'Google'
            WHEN referrer_domain LIKE '%facebook%' OR referrer_domain LIKE '%fb.%' THEN 'Facebook'
            WHEN referrer_domain LIKE '%instagram%' THEN 'Instagram'
            WHEN referrer_domain LIKE '%twitter%' OR referrer_domain LIKE '%x.com%' THEN 'Twitter/X'
            WHEN referrer_domain LIKE '%linkedin%' THEN 'LinkedIn'
            ELSE referrer_domain
          END
        ORDER BY sessions DESC
        LIMIT 15
      ) sources
    ),
    'devices', (
      SELECT json_build_object(
        'desktop', COUNT(*) FILTER (WHERE device_type = 'desktop'),
        'mobile', COUNT(*) FILTER (WHERE device_type = 'mobile'),
        'tablet', COUNT(*) FILTER (WHERE device_type = 'tablet'),
        'unknown', COUNT(*) FILTER (WHERE device_type IS NULL OR device_type = '')
      )
      FROM visitor_sessions
      WHERE started_at >= p_start_date AND started_at < p_end_date + INTERVAL '1 day'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les stats en temps réel (dernière heure)
CREATE OR REPLACE FUNCTION get_realtime_stats()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'active_visitors', (
      SELECT COUNT(DISTINCT visitor_id)
      FROM visitor_sessions
      WHERE last_activity_at >= NOW() - INTERVAL '5 minutes'
    ),
    'visitors_last_hour', (
      SELECT COUNT(DISTINCT visitor_id)
      FROM visitor_sessions
      WHERE started_at >= NOW() - INTERVAL '1 hour'
    ),
    'page_views_last_hour', (
      SELECT COUNT(*)
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at >= NOW() - INTERVAL '1 hour'
    ),
    'current_pages', (
      SELECT json_agg(pages)
      FROM (
        SELECT
          page_path,
          MAX(page_title) as page_title,
          COUNT(DISTINCT visitor_id) as active_visitors
        FROM analytics_events
        WHERE event_type = 'page_view'
          AND created_at >= NOW() - INTERVAL '5 minutes'
        GROUP BY page_path
        ORDER BY active_visitors DESC
        LIMIT 10
      ) pages
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Policies RLS
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources_daily ENABLE ROW LEVEL SECURITY;

-- Lecture seule pour les admins
CREATE POLICY "Admins can read visitor_sessions"
  ON visitor_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can read analytics_events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can read page_views_daily"
  ON page_views_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can read traffic_sources_daily"
  ON traffic_sources_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Permettre l'insertion anonyme pour le tracking
CREATE POLICY "Anyone can insert visitor_sessions"
  ON visitor_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own session"
  ON visitor_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert analytics_events"
  ON analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE visitor_sessions IS 'Sessions de visiteurs avec informations de provenance et métriques';
COMMENT ON TABLE analytics_events IS 'Événements de tracking (page views, clics, etc.)';
COMMENT ON FUNCTION track_event IS 'Enregistre un événement de tracking';
COMMENT ON FUNCTION get_traffic_stats IS 'Retourne les statistiques de trafic pour une période donnée';
COMMENT ON FUNCTION get_realtime_stats IS 'Retourne les statistiques en temps réel';
