-- Seed file with real books from faces-cachees.fr
-- This file contains the 21 actual books from the Faces Cachées Éditions catalog

-- First, let's add some real authors (we'll need to create them as the site doesn't list authors)
-- We'll use generic author entries that can be updated later with real information

INSERT INTO authors (name, bio) VALUES
  ('Collectif', 'Auteur collectif'),
  ('Auteur anonyme', 'Auteur non spécifié')
ON CONFLICT (name) DO NOTHING;

-- Get the author IDs for reference
DO $$
DECLARE
  collectif_id UUID;
  anonyme_id UUID;
BEGIN
  SELECT id INTO collectif_id FROM authors WHERE name = 'Collectif';
  SELECT id INTO anonyme_id FROM authors WHERE name = 'Auteur anonyme';

  -- Insert the 21 real books from the catalog
  INSERT INTO books (title, slug, author_id, price, book_type, description, published, stock, release_date) VALUES
    ('Face B - L''amour révèle nos identités', 'face-b-amour-revele-identites', anonyme_id, 2000, 'revue', 'Une exploration des identités à travers l''amour. Face B est une revue qui met en lumière les voix singulières et les récits authentiques.', true, 15, '2024-01-15'),
    ('L''histoire du football africain', 'histoire-football-africain', anonyme_id, 2190, 'essai', 'Un voyage fascinant à travers l''histoire du football africain, de ses origines à aujourd''hui.', true, 12, '2023-09-20'),
    ('Les Buts de ma vie', 'les-buts-de-ma-vie', anonyme_id, 1900, 'autobiographie', 'Un récit personnel sur les objectifs et les réalisations d''une vie marquée par la passion du sport.', true, 10, '2023-08-10'),
    ('PARIS NOIR', 'paris-noir', anonyme_id, 2190, 'roman', 'Une plongée dans les mystères et les secrets de Paris, une ville aux mille visages.', true, 8, '2023-06-15'),
    ('SI TU SAVAIS', 'si-tu-savais', anonyme_id, 1500, 'roman', 'Un roman touchant sur les non-dits et les secrets de famille qui façonnent nos destins.', true, 20, '2023-05-01'),
    ('FACE B N° 1', 'face-b-numero-1', anonyme_id, 2000, 'revue', 'Le premier numéro de la revue Face B, explorant les thèmes de l''identité et de l''authenticité.', true, 10, '2023-03-01'),
    ('Les Dudes', 'les-dudes', anonyme_id, 1500, 'roman', 'Une histoire contemporaine sur l''amitié et les défis de la vie urbaine.', true, 15, '2023-02-14'),
    ('Libéré !', 'libere', anonyme_id, 1800, 'autobiographie', 'Un témoignage puissant sur la libération personnelle et le dépassement de soi.', true, 12, '2023-01-20'),
    ('À bras le corps', 'a-bras-le-corps', anonyme_id, 1500, 'roman', 'Un récit intense sur l''engagement total dans la vie et les passions qui nous animent.', true, 18, '2022-12-01'),
    ('Renaissances', 'renaissances', anonyme_id, 1800, 'developpement_personnel', 'Un guide inspirant sur le renouveau personnel et la transformation de soi.', true, 14, '2022-11-15'),
    ('Des fois, j''écris des trucs', 'des-fois-j-ecris-des-trucs', anonyme_id, 1800, 'recueil', 'Un recueil de textes variés, entre poésie et prose, sur les petits moments de la vie.', true, 16, '2022-10-01'),
    ('Une époque formidable', 'une-epoque-formidable', anonyme_id, 1800, 'essai', 'Une réflexion critique et humoristique sur notre époque et ses contradictions.', true, 10, '2022-09-10'),
    ('Les Liens sacrés (semi-poche)', 'les-liens-sacres-semi-poche', anonyme_id, 1400, 'roman', 'Une histoire émouvante sur les liens familiaux et les valeurs qui nous unissent. Format semi-poche.', true, 25, '2022-08-01'),
    ('Nos silences sont immenses', 'nos-silences-sont-immenses', anonyme_id, 1400, 'roman', 'Un roman poignant sur ce que nous taisons et l''impact du silence dans nos relations.', true, 20, '2022-07-15'),
    ('Récits d''Algérie', 'recits-algerie', collectif_id, 2990, 'recueil', 'Un recueil de témoignages et de récits sur l''Algérie, son histoire et son peuple.', true, 8, '2022-06-01'),
    ('J''étais là', 'j-etais-la', anonyme_id, 1900, 'autobiographie', 'Un témoignage personnel sur les moments marquants d''une vie, les choix et les rencontres.', true, 12, '2022-05-20'),
    ('Musulmanes du monde', 'musulmanes-du-monde', collectif_id, 1500, 'essai', 'Un regard sur la diversité des femmes musulmanes à travers le monde et leurs histoires.', true, 15, '2022-04-10'),
    ('Les Liens sacrés (grand format)', 'les-liens-sacres-grand-format', anonyme_id, 2100, 'roman', 'Une histoire émouvante sur les liens familiaux et les valeurs qui nous unissent. Grand format.', true, 10, '2022-03-01'),
    ('La Rage de vivre', 'la-rage-de-vivre', anonyme_id, 1700, 'autobiographie', 'Un témoignage vibrant sur la détermination et la passion de vivre pleinement.', true, 18, '2022-02-15'),
    ('Gribouillages', 'gribouillages', anonyme_id, 990, 'recueil', 'Un petit recueil de pensées, dessins et textes courts pour capturer l''instant présent.', true, 30, '2022-01-01'),
    ('Je suis', 'je-suis', anonyme_id, 1200, 'developpement_personnel', 'Une réflexion philosophique sur l''identité, l''existence et la quête de soi.', true, 22, '2021-12-01')
  ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    stock = EXCLUDED.stock;

END $$;

-- Note: Les auteurs réels devront être mis à jour manuellement dans l'interface admin
-- ou via un nouveau fichier SQL une fois les informations récupérées.
