-- Migration 019: Add stock management to books

-- Add stock columns to books table
ALTER TABLE books
ADD COLUMN initial_stock INTEGER DEFAULT 100 CHECK (initial_stock >= 0),
ADD COLUMN current_stock INTEGER DEFAULT 100 CHECK (current_stock >= 0);

-- Update all existing books to have 100 in stock
UPDATE books
SET initial_stock = 100, current_stock = 100
WHERE initial_stock IS NULL OR current_stock IS NULL;

-- Add comment to explain the fields
COMMENT ON COLUMN books.initial_stock IS 'Stock initial du livre (stock de départ)';
COMMENT ON COLUMN books.current_stock IS 'Stock actuel disponible du livre';
