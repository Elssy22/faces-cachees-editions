-- Migration 018: Update additional book covers and add authors

-- Update book covers for the 8 additional books
UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/379948638/plat-1.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'des-fois-j-ecris-des-trucs';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/377573383/Sinik-couv.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'une-epoque-formidable';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/377573449/plat-1v3.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'nos-silences-sont-immenses';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/346856944/Front-Cover_1.jpg?auto=format&fit=max&h=1200&w=1200', page_count = 296, dimensions = '17 x 22 cm', price = 29.90
WHERE slug = 'recits-d-algerie';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/300069393/MUSULMANES-DU-MONDE-Cover.jpg?auto=format&fit=max&h=1200&w=1200', page_count = 88, price = 15.00
WHERE slug = 'musulmanes-du-monde';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/299512224/COVER-La-Rage-de-Vivre-2020.jpg?auto=format&fit=max&h=1200&w=1200', price = 17.00, isbn = '9791094926048'
WHERE slug = 'la-rage-de-vivre';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/299511327/Maquette-COVER-Gribouillages_04.jpg?auto=format&fit=max&h=1200&w=1200', price = 9.90
WHERE slug = 'gribouillages';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/298824363/Je-suis_Couv_HD-1.jpg?auto=format&fit=max&h=1200&w=1200', price = 12.00
WHERE slug = 'je-suis';

-- Add new authors (only if they don't already exist)
INSERT INTO authors (first_name, last_name, bio, slug)
VALUES
  ('Wad''z', '', 'Auteur de "Des fois, j''écris des trucs", collection d''environ 200 phrases explorant les thèmes de la famille, de l''amitié, de la résilience, de la foi, de la guérison et de la consolation.', 'wadz'),
  ('Sinik', '', 'Rappeur francophone ayant vendu plus de 1,4 million d''albums dans les années 2000. Auteur de l''autobiographie "Une époque formidable".', 'sinik'),
  ('Farah', 'Khodja', 'Auteure de "Récits d''Algérie", un projet collaboratif compilant plus de vingt témoignages d''Algériens et d''anciens soldats français documentant les mémoires de la guerre d''indépendance algérienne.', 'farah-khodja'),
  ('Élise', 'Saint-Jullian', 'Auteure de "Musulmanes du monde", ouvrage présentant 30 portraits de femmes musulmanes inspirantes à travers le monde.', 'elise-saint-jullian'),
  ('LK.', 'Imany', 'Illustratrice de "Musulmanes du monde".', 'lk-imany'),
  ('Bolewa', 'Sabourin', 'Co-auteur de "La Rage de vivre", autobiographie avec préface d''Andréa Bescond.', 'bolewa-sabourin'),
  ('Balla', 'Fofana', 'Co-auteur de "La Rage de vivre", autobiographie avec préface d''Andréa Bescond.', 'balla-fofana'),
  ('Rachid', 'Sguini', 'Auteur et illustrateur de "Gribouillages" (sous le pseudonyme Rakidd), un roman graphique documentant son parcours vers le métier d''illustrateur.', 'rachid-sguini'),
  ('Bakhary', 'Sakho', 'Auteur de "Je suis", un essai abordant les émeutes de 2005 et leur impact.', 'bakhary-sakho')
ON CONFLICT (slug) DO NOTHING;

-- Connect authors to their books by updating author_id
-- Note: For books with multiple authors, we set the primary author

-- Des fois, j'écris des trucs - Wad'z
UPDATE books
SET author_id = (SELECT id FROM authors WHERE slug = 'wadz')
WHERE slug = 'des-fois-j-ecris-des-trucs';

-- Une époque formidable - Sinik
UPDATE books
SET author_id = (SELECT id FROM authors WHERE slug = 'sinik')
WHERE slug = 'une-epoque-formidable';

-- Récits d'Algérie - Farah Khodja
UPDATE books
SET author_id = (SELECT id FROM authors WHERE slug = 'farah-khodja')
WHERE slug = 'recits-d-algerie';

-- Musulmanes du monde - Élise Saint-Jullian (primary author for text)
UPDATE books
SET author_id = (SELECT id FROM authors WHERE slug = 'elise-saint-jullian')
WHERE slug = 'musulmanes-du-monde';

-- La Rage de vivre - Bolewa Sabourin (primary co-author)
UPDATE books
SET author_id = (SELECT id FROM authors WHERE slug = 'bolewa-sabourin')
WHERE slug = 'la-rage-de-vivre';

-- Gribouillages - Rachid Sguini
UPDATE books
SET author_id = (SELECT id FROM authors WHERE slug = 'rachid-sguini')
WHERE slug = 'gribouillages';

-- Je suis - Bakhary Sakho
UPDATE books
SET author_id = (SELECT id FROM authors WHERE slug = 'bakhary-sakho')
WHERE slug = 'je-suis';
