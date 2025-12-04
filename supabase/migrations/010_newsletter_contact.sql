-- Migration 010: Newsletter and contact tables

-- Enable pgcrypto for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Newsletter subscriptions
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  consent_date TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token TEXT UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  source TEXT DEFAULT 'popup', -- 'popup', 'footer', 'checkout', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_newsletter_email ON newsletter_subscriptions(LOWER(email));
CREATE INDEX idx_newsletter_active ON newsletter_subscriptions(active)
  WHERE active = true;
CREATE INDEX idx_newsletter_token ON newsletter_subscriptions(unsubscribe_token);
CREATE INDEX idx_newsletter_user ON newsletter_subscriptions(user_id);

-- Contact messages
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
  reply_text TEXT,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contact_messages_read ON contact_messages(read);
CREATE INDEX idx_contact_messages_replied ON contact_messages(replied);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_user ON contact_messages(user_id);

-- Function to subscribe to newsletter
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(
  p_email TEXT,
  p_user_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'popup'
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
BEGIN
  INSERT INTO newsletter_subscriptions (email, user_id, source)
  VALUES (LOWER(TRIM(p_email)), p_user_id, p_source)
  ON CONFLICT (email) DO UPDATE
  SET active = true,
      unsubscribed_at = NULL,
      user_id = COALESCE(newsletter_subscriptions.user_id, EXCLUDED.user_id)
  RETURNING id INTO v_subscription_id;

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Function to unsubscribe from newsletter
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE newsletter_subscriptions
  SET active = false,
      unsubscribed_at = NOW()
  WHERE unsubscribe_token = p_token
    AND active = true
  RETURNING true INTO v_updated;

  RETURN COALESCE(v_updated, false);
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE newsletter_subscriptions IS
  'Newsletter email subscriptions with GDPR-compliant unsubscribe tokens';
COMMENT ON TABLE contact_messages IS
  'Contact form submissions';
COMMENT ON FUNCTION subscribe_to_newsletter IS
  'Subscribe email to newsletter, reactivating if previously unsubscribed';
