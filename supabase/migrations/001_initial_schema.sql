-- Migration 001: Initial schema setup
-- Extensions et types de base

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- Create custom types
CREATE TYPE book_type AS ENUM (
  'roman',
  'autobiographie',
  'essai',
  'recueil',
  'revue',
  'developpement_personnel'
);

CREATE TYPE publish_status AS ENUM ('draft', 'scheduled', 'published');

CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE TYPE address_type AS ENUM ('billing', 'shipping');

CREATE TYPE media_type AS ENUM ('instagram', 'article', 'video', 'podcast');

-- Utility function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'FCE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
         LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number() IS
  'Generates unique order numbers in format FCE-YYYYMMDD-XXXX';
