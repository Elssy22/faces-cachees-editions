-- Migration 008: Abandoned carts tracking

CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  cart_total DECIMAL(10,2) NOT NULL,
  items_count INTEGER NOT NULL,

  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,

  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  recovery_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_abandoned_carts_user ON abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_cart ON abandoned_carts(cart_id);
CREATE INDEX idx_abandoned_carts_pending ON abandoned_carts(email_sent, created_at)
  WHERE NOT email_sent AND NOT recovered;
CREATE INDEX idx_abandoned_carts_created ON abandoned_carts(created_at DESC);

-- Function to identify abandoned carts
CREATE OR REPLACE FUNCTION identify_abandoned_carts(hours_threshold INTEGER DEFAULT 24)
RETURNS TABLE(
  cart_id UUID,
  user_id UUID,
  email TEXT,
  cart_total DECIMAL,
  items_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS cart_id,
    c.user_id,
    p.email,
    SUM(ci.quantity * b.price) AS cart_total,
    SUM(ci.quantity)::INTEGER AS items_count
  FROM carts c
  JOIN profiles p ON p.id = c.user_id
  JOIN cart_items ci ON ci.cart_id = c.id
  JOIN books b ON b.id = ci.book_id
  WHERE c.user_id IS NOT NULL
    AND c.updated_at < NOW() - (hours_threshold || ' hours')::INTERVAL
    AND NOT EXISTS (
      SELECT 1 FROM abandoned_carts ac
      WHERE ac.cart_id = c.id
        AND (ac.email_sent OR ac.recovered)
    )
  GROUP BY c.id, c.user_id, p.email
  HAVING SUM(ci.quantity) > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to mark cart as recovered
CREATE OR REPLACE FUNCTION mark_cart_recovered(
  p_cart_id UUID,
  p_order_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE abandoned_carts
  SET recovered = true,
      recovered_at = NOW(),
      recovery_order_id = p_order_id
  WHERE cart_id = p_cart_id
    AND NOT recovered;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE abandoned_carts IS
  'Tracking table for carts abandoned by authenticated users for email reminders';
COMMENT ON FUNCTION identify_abandoned_carts IS
  'Identifies carts that have been inactive for specified hours and not yet reminded';
