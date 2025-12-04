-- Migration 013: Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_relays ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin/editor
CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- AUTHORS
-- ============================================================================

-- Anyone can read authors
CREATE POLICY "Public read authors"
  ON authors FOR SELECT
  USING (true);

-- Admin/Editor can insert authors
CREATE POLICY "Admin insert authors"
  ON authors FOR INSERT
  WITH CHECK (is_admin_or_editor());

-- Admin/Editor can update authors
CREATE POLICY "Admin update authors"
  ON authors FOR UPDATE
  USING (is_admin_or_editor());

-- Admin can delete authors
CREATE POLICY "Admin delete authors"
  ON authors FOR DELETE
  USING (is_admin());

-- ============================================================================
-- BOOKS
-- ============================================================================

-- Anyone can read published books
CREATE POLICY "Public read published books"
  ON books FOR SELECT
  USING (status = 'published');

-- Admin/Editor can read all books
CREATE POLICY "Admin read all books"
  ON books FOR SELECT
  USING (is_admin_or_editor());

-- Admin/Editor can insert books
CREATE POLICY "Admin insert books"
  ON books FOR INSERT
  WITH CHECK (is_admin_or_editor());

-- Admin/Editor can update books
CREATE POLICY "Admin update books"
  ON books FOR UPDATE
  USING (is_admin_or_editor());

-- Admin can delete books
CREATE POLICY "Admin delete books"
  ON books FOR DELETE
  USING (is_admin());

-- ============================================================================
-- MEDIA RELAYS
-- ============================================================================

-- Anyone can read media relays
CREATE POLICY "Public read media relays"
  ON media_relays FOR SELECT
  USING (true);

-- Admin/Editor can manage media relays
CREATE POLICY "Admin manage media relays"
  ON media_relays FOR ALL
  USING (is_admin_or_editor());

-- ============================================================================
-- ADDRESSES
-- ============================================================================

-- Users can read their own addresses
CREATE POLICY "Users read own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all addresses
CREATE POLICY "Admin read all addresses"
  ON addresses FOR SELECT
  USING (is_admin());

-- ============================================================================
-- CARTS
-- ============================================================================

-- Users can read their own cart
CREATE POLICY "Users read own cart"
  ON carts FOR SELECT
  USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

-- Users can insert their own cart
CREATE POLICY "Users insert own cart"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

-- Users can update their own cart
CREATE POLICY "Users update own cart"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

-- Users can delete their own cart
CREATE POLICY "Users delete own cart"
  ON carts FOR DELETE
  USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

-- ============================================================================
-- CART ITEMS
-- ============================================================================

-- Users can read items in their cart
CREATE POLICY "Users read own cart items"
  ON cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND (carts.user_id = auth.uid() OR carts.session_id = current_setting('app.session_id', true))
    )
  );

-- Users can insert items in their cart
CREATE POLICY "Users insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND (carts.user_id = auth.uid() OR carts.session_id = current_setting('app.session_id', true))
    )
  );

-- Users can update items in their cart
CREATE POLICY "Users update own cart items"
  ON cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND (carts.user_id = auth.uid() OR carts.session_id = current_setting('app.session_id', true))
    )
  );

-- Users can delete items from their cart
CREATE POLICY "Users delete own cart items"
  ON cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND (carts.user_id = auth.uid() OR carts.session_id = current_setting('app.session_id', true))
    )
  );

-- ============================================================================
-- ORDERS
-- ============================================================================

-- Users can read their own orders
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admin read all orders"
  ON orders FOR SELECT
  USING (is_admin_or_editor());

-- Admins can update orders
CREATE POLICY "Admin update orders"
  ON orders FOR UPDATE
  USING (is_admin_or_editor());

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

-- Users can read items from their orders
CREATE POLICY "Users read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins can read all order items
CREATE POLICY "Admin read all order items"
  ON order_items FOR SELECT
  USING (is_admin_or_editor());

-- ============================================================================
-- ABANDONED CARTS
-- ============================================================================

-- Only admins can access abandoned carts
CREATE POLICY "Admin manage abandoned carts"
  ON abandoned_carts FOR ALL
  USING (is_admin());

-- ============================================================================
-- EVENTS
-- ============================================================================

-- Anyone can read published events
CREATE POLICY "Public read published events"
  ON events FOR SELECT
  USING (published = true);

-- Admin/Editor can read all events
CREATE POLICY "Admin read all events"
  ON events FOR SELECT
  USING (is_admin_or_editor());

-- Admin/Editor can manage events
CREATE POLICY "Admin manage events"
  ON events FOR ALL
  USING (is_admin_or_editor());

-- ============================================================================
-- BLOG POSTS
-- ============================================================================

-- Anyone can read published posts
CREATE POLICY "Public read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Admin/Editor can read all posts
CREATE POLICY "Admin read all posts"
  ON blog_posts FOR SELECT
  USING (is_admin_or_editor());

-- Admin/Editor can manage posts
CREATE POLICY "Admin manage posts"
  ON blog_posts FOR ALL
  USING (is_admin_or_editor());

-- ============================================================================
-- NEWSLETTER SUBSCRIPTIONS
-- ============================================================================

-- Anyone can insert newsletter subscription
CREATE POLICY "Public insert newsletter"
  ON newsletter_subscriptions FOR INSERT
  WITH CHECK (true);

-- Users can read their own subscription
CREATE POLICY "Users read own subscription"
  ON newsletter_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all subscriptions
CREATE POLICY "Admin read all subscriptions"
  ON newsletter_subscriptions FOR SELECT
  USING (is_admin());

-- Admins can update subscriptions
CREATE POLICY "Admin update subscriptions"
  ON newsletter_subscriptions FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- CONTACT MESSAGES
-- ============================================================================

-- Anyone can insert contact messages
CREATE POLICY "Public insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Admins can read all messages
CREATE POLICY "Admin read contact messages"
  ON contact_messages FOR SELECT
  USING (is_admin_or_editor());

-- Admins can update messages
CREATE POLICY "Admin update contact messages"
  ON contact_messages FOR UPDATE
  USING (is_admin_or_editor());

-- ============================================================================
-- PAYMENT METHODS
-- ============================================================================

-- Users can read their own payment methods
CREATE POLICY "Users read own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own payment methods
CREATE POLICY "Users insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
CREATE POLICY "Users update own payment methods"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own payment methods
CREATE POLICY "Users delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SITE ANALYTICS
-- ============================================================================

-- Only admins can access analytics
CREATE POLICY "Admin manage analytics"
  ON site_analytics FOR ALL
  USING (is_admin());

COMMENT ON FUNCTION is_admin_or_editor IS
  'Helper function to check if current user has admin or editor role';
COMMENT ON FUNCTION is_admin IS
  'Helper function to check if current user has admin role';
