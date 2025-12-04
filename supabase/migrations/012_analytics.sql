-- Migration 012: Analytics and statistics

CREATE TABLE site_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  new_users_count INTEGER DEFAULT 0,
  newsletter_signups INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_analytics_date ON site_analytics(date DESC);

-- Trigger for updated_at
CREATE TRIGGER update_site_analytics_updated_at
  BEFORE UPDATE ON site_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to get today's stats
CREATE OR REPLACE FUNCTION get_today_stats()
RETURNS site_analytics AS $$
BEGIN
  RETURN (
    SELECT *
    FROM site_analytics
    WHERE date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'today', (
      SELECT json_build_object(
        'orders', COUNT(*),
        'revenue', COALESCE(SUM(total_amount), 0)
      )
      FROM orders
      WHERE created_at >= CURRENT_DATE
        AND payment_status = 'paid'
    ),
    'thisWeek', (
      SELECT json_build_object(
        'orders', COUNT(*),
        'revenue', COALESCE(SUM(total_amount), 0)
      )
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND payment_status = 'paid'
    ),
    'thisMonth', (
      SELECT json_build_object(
        'orders', COUNT(*),
        'revenue', COALESCE(SUM(total_amount), 0)
      )
      FROM orders
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        AND payment_status = 'paid'
    ),
    'bestSellingBook', (
      SELECT json_build_object(
        'bookId', oi.book_id,
        'title', oi.book_title,
        'totalSold', SUM(oi.quantity)
      )
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.payment_status = 'paid'
      GROUP BY oi.book_id, oi.book_title
      ORDER BY SUM(oi.quantity) DESC
      LIMIT 1
    ),
    'recentOrders', (
      SELECT json_agg(
        json_build_object(
          'orderNumber', order_number,
          'totalAmount', total_amount,
          'status', status,
          'createdAt', created_at
        )
      )
      FROM (
        SELECT *
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
      ) recent
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to increment page view
CREATE OR REPLACE FUNCTION increment_page_view(p_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO site_analytics (date, page_views)
  VALUES (p_date, 1)
  ON CONFLICT (date) DO UPDATE
  SET page_views = site_analytics.page_views + 1,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update daily order stats
CREATE OR REPLACE FUNCTION update_daily_order_stats()
RETURNS void AS $$
BEGIN
  INSERT INTO site_analytics (date, orders_count, revenue)
  SELECT
    CURRENT_DATE,
    COUNT(*),
    COALESCE(SUM(total_amount), 0)
  FROM orders
  WHERE created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
    AND payment_status = 'paid'
  ON CONFLICT (date) DO UPDATE
  SET orders_count = EXCLUDED.orders_count,
      revenue = EXCLUDED.revenue,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE site_analytics IS
  'Daily aggregated site statistics for admin dashboard';
COMMENT ON FUNCTION get_dashboard_stats IS
  'Returns comprehensive dashboard statistics in JSON format';
