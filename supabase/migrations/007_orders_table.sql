-- Migration 007: Orders and order items tables

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL DEFAULT generate_order_number(),
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',

  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),

  -- Addresses (snapshot at order time)
  shipping_address JSONB NOT NULL,
  billing_address JSONB,

  -- Payment
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,

  -- Tracking
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Notes
  customer_note TEXT,
  admin_note TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE UNIQUE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe_intent ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,

  -- Snapshot of book at order time
  book_title TEXT NOT NULL,
  book_subtitle TEXT,
  book_cover_url TEXT,
  book_author_name TEXT,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_book ON order_items(book_id);

-- Function to auto-update order timestamps on status change
CREATE OR REPLACE FUNCTION update_order_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    CASE NEW.status
      WHEN 'shipped' THEN
        NEW.shipped_at := COALESCE(NEW.shipped_at, NOW());
      WHEN 'delivered' THEN
        NEW.delivered_at := COALESCE(NEW.delivered_at, NOW());
        NEW.shipped_at := COALESCE(NEW.shipped_at, OLD.shipped_at, NOW() - INTERVAL '1 day');
      WHEN 'cancelled' THEN
        NEW.cancelled_at := COALESCE(NEW.cancelled_at, NOW());
      ELSE
        NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_status_timestamps_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION update_order_status_timestamps();

COMMENT ON TABLE orders IS
  'Customer orders with payment and shipping information';
COMMENT ON COLUMN orders.shipping_address IS
  'JSON snapshot of shipping address at order time';
COMMENT ON COLUMN orders.billing_address IS
  'JSON snapshot of billing address at order time (if different from shipping)';
COMMENT ON TABLE order_items IS
  'Line items in orders with snapshot of book information at order time';
