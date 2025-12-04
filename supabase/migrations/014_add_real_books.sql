-- Seed file with real books from faces-cachees.fr
-- This file contains the 21 actual books from the Faces Cachées Éditions catalog

-- First, add generic authors (to be updated later with real information)
INSERT INTO authors (first_name, last_name, slug, bio) VALUES
  ('Collectif', '', 'collectif', 'Auteur collectif'),
  ('Auteur', 'Anonyme', 'auteur-anonyme', 'Auteur non spécifié')
ON CONFLICT (slug) DO NOTHING;

-- Insert the 21 real books from the catalog
INSERT INTO books (title, slug, author_id, price, book_type, summary, status, publication_date) VALUES
  (
    'Face B - L''amour révèle nos identités',
    'face-b-amour-revele-identites',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    20.00,
    'revue'::book_type,
    'Une exploration des identités à travers l''amour. Face B est une revue qui met en lumière les voix singulières et les récits authentiques.',
    'published'::publish_status,
    '2024-01-15'
  ),
  (
    'L''histoire du football africain',
    'histoire-football-africain',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    21.90,
    'essai'::book_type,
    'Un voyage fascinant à travers l''histoire du football africain, de ses origines à aujourd''hui.',
    'published'::publish_status,
    '2023-09-20'
  ),
  (
    'Les Buts de ma vie',
    'les-buts-de-ma-vie',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    19.00,
    'autobiographie'::book_type,
    'Un récit personnel sur les objectifs et les réalisations d''une vie marquée par la passion du sport.',
    'published'::publish_status,
    '2023-08-10'
  ),
  (
    'PARIS NOIR',
    'paris-noir',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    21.90,
    'roman'::book_type,
    'Une plongée dans les mystères et les secrets de Paris, une ville aux mille visages.',
    'published'::publish_status,
    '2023-06-15'
  ),
  (
    'SI TU SAVAIS',
    'si-tu-savais',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    15.00,
    'roman'::book_type,
    'Un roman touchant sur les non-dits et les secrets de famille qui façonnent nos destins.',
    'published'::publish_status,
    '2023-05-01'
  ),
  (
    'FACE B N° 1',
    'face-b-numero-1',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    20.00,
    'revue'::book_type,
    'Le premier numéro de la revue Face B, explorant les thèmes de l''identité et de l''authenticité.',
    'published'::publish_status,
    '2023-03-01'
  ),
  (
    'Les Dudes',
    'les-dudes',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    15.00,
    'roman'::book_type,
    'Une histoire contemporaine sur l''amitié et les défis de la vie urbaine.',
    'published'::publish_status,
    '2023-02-14'
  ),
  (
    'Libéré !',
    'libere',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    18.00,
    'autobiographie'::book_type,
    'Un témoignage puissant sur la libération personnelle et le dépassement de soi.',
    'published'::publish_status,
    '2023-01-20'
  ),
  (
    'À bras le corps',
    'a-bras-le-corps',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    15.00,
    'roman'::book_type,
    'Un récit intense sur l''engagement total dans la vie et les passions qui nous animent.',
    'published'::publish_status,
    '2022-12-01'
  ),
  (
    'Renaissances',
    'renaissances',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    18.00,
    'developpement_personnel'::book_type,
    'Un guide inspirant sur le renouveau personnel et la transformation de soi.',
    'published'::publish_status,
    '2022-11-15'
  ),
  (
    'Des fois, j''écris des trucs',
    'des-fois-j-ecris-des-trucs',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    18.00,
    'recueil'::book_type,
    'Un recueil de textes variés, entre poésie et prose, sur les petits moments de la vie.',
    'published'::publish_status,
    '2022-10-01'
  ),
  (
    'Une époque formidable',
    'une-epoque-formidable',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    18.00,
    'essai'::book_type,
    'Une réflexion critique et humoristique sur notre époque et ses contradictions.',
    'published'::publish_status,
    '2022-09-10'
  ),
  (
    'Les Liens sacrés (semi-poche)',
    'les-liens-sacres-semi-poche',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    14.00,
    'roman'::book_type,
    'Une histoire émouvante sur les liens familiaux et les valeurs qui nous unissent. Format semi-poche.',
    'published'::publish_status,
    '2022-08-01'
  ),
  (
    'Nos silences sont immenses',
    'nos-silences-sont-immenses',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    14.00,
    'roman'::book_type,
    'Un roman poignant sur ce que nous taisons et l''impact du silence dans nos relations.',
    'published'::publish_status,
    '2022-07-15'
  ),
  (
    'Récits d''Algérie',
    'recits-algerie',
    (SELECT id FROM authors WHERE slug = 'collectif'),
    29.90,
    'recueil'::book_type,
    'Un recueil de témoignages et de récits sur l''Algérie, son histoire et son peuple.',
    'published'::publish_status,
    '2022-06-01'
  ),
  (
    'J''étais là',
    'j-etais-la',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    19.00,
    'autobiographie'::book_type,
    'Un témoignage personnel sur les moments marquants d''une vie, les choix et les rencontres.',
    'published'::publish_status,
    '2022-05-20'
  ),
  (
    'Musulmanes du monde',
    'musulmanes-du-monde',
    (SELECT id FROM authors WHERE slug = 'collectif'),
    15.00,
    'essai'::book_type,
    'Un regard sur la diversité des femmes musulmanes à travers le monde et leurs histoires.',
    'published'::publish_status,
    '2022-04-10'
  ),
  (
    'Les Liens sacrés (grand format)',
    'les-liens-sacres-grand-format',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    21.00,
    'roman'::book_type,
    'Une histoire émouvante sur les liens familiaux et les valeurs qui nous unissent. Grand format.',
    'published'::publish_status,
    '2022-03-01'
  ),
  (
    'La Rage de vivre',
    'la-rage-de-vivre',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    17.00,
    'autobiographie'::book_type,
    'Un témoignage vibrant sur la détermination et la passion de vivre pleinement.',
    'published'::publish_status,
    '2022-02-15'
  ),
  (
    'Gribouillages',
    'gribouillages',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    9.90,
    'recueil'::book_type,
    'Un petit recueil de pensées, dessins et textes courts pour capturer l''instant présent.',
    'published'::publish_status,
    '2022-01-01'
  ),
  (
    'Je suis',
    'je-suis',
    (SELECT id FROM authors WHERE slug = 'auteur-anonyme'),
    12.00,
    'developpement_personnel'::book_type,
    'Une réflexion philosophique sur l''identité, l''existence et la quête de soi.',
    'published'::publish_status,
    '2021-12-01'
  )
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price;

-- Note: Les auteurs réels devront être mis à jour manuellement via l'interface admin
