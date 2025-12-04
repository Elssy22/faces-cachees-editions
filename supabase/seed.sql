-- Seed data for Faces Cachées Éditions

-- Note: Execute after all migrations are applied

-- ============================================================================
-- ADMIN PROFILES
-- ============================================================================

-- Note: Profils admin commentés car ils nécessitent que les utilisateurs
-- existent dans auth.users d'abord.
-- Pour créer un admin :
-- 1. Inscrivez-vous sur le site
-- 2. Dans Supabase Dashboard → Table Editor → profiles
-- 3. Changez le role de 'client' à 'admin'

-- INSERT INTO profiles (id, email, first_name, last_name, role) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'admin@faces-cachees.fr', 'Admin', 'FCE', 'admin'),
--   ('00000000-0000-0000-0000-000000000002', 'editor@faces-cachees.fr', 'Éditeur', 'FCE', 'editor')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- AUTHORS
-- ============================================================================

INSERT INTO authors (id, first_name, last_name, slug, bio, instagram_url, facebook_url) VALUES
  (
    gen_random_uuid(),
    'Jean',
    'Dupont',
    'jean-dupont',
    'Auteur passionné par l''autobiographie et les récits de vie. Son premier ouvrage a été salué par la critique.',
    'https://instagram.com/jean.dupont',
    'https://facebook.com/jeandupont.auteur'
  ),
  (
    gen_random_uuid(),
    'Marie',
    'Martin',
    'marie-martin',
    'Romancière reconnue, Marie Martin explore les thèmes de l''identité et de la mémoire familiale.',
    'https://instagram.com/marie.martin.auteure',
    NULL
  ),
  (
    gen_random_uuid(),
    'Ahmed',
    'Benali',
    'ahmed-benali',
    'Essayiste et penseur contemporain, Ahmed Benali aborde les questions sociétales avec un regard acéré.',
    'https://instagram.com/ahmed.benali',
    'https://facebook.com/ahmedbenali'
  ),
  (
    gen_random_uuid(),
    'Sophie',
    'Leroy',
    'sophie-leroy',
    'Poétesse et auteure de recueils intimistes, Sophie Leroy capte l''essence des émotions humaines.',
    NULL,
    NULL
  ),
  (
    gen_random_uuid(),
    'Thomas',
    'Moreau',
    'thomas-moreau',
    'Spécialiste du développement personnel, Thomas Moreau accompagne ses lecteurs vers l''épanouissement.',
    'https://instagram.com/thomas.moreau.coach',
    'https://facebook.com/thomasmoreau.officiel'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- BOOKS
-- ============================================================================

INSERT INTO books (
  title,
  subtitle,
  slug,
  author_id,
  price,
  summary,
  book_type,
  genre,
  tags,
  page_count,
  isbn,
  publication_date,
  status
)
SELECT
  'Le Chemin des Ombres',
  'Une quête d''identité',
  'le-chemin-des-ombres',
  (SELECT id FROM authors WHERE slug = 'jean-dupont'),
  18.90,
  'Un récit autobiographique bouleversant qui retrace le parcours d''un homme à la recherche de ses racines. Entre ombre et lumière, il découvre les secrets de son passé.',
  'autobiographie'::book_type,
  'Mémoires',
  ARRAY['identité', 'famille', 'mémoire'],
  245,
  '978-2-1234-5678-9',
  NOW() - INTERVAL '30 days',
  'published'::publish_status
WHERE NOT EXISTS (SELECT 1 FROM books WHERE slug = 'le-chemin-des-ombres');

INSERT INTO books (
  title,
  subtitle,
  slug,
  author_id,
  price,
  summary,
  book_type,
  genre,
  tags,
  page_count,
  isbn,
  publication_date,
  status
)
SELECT
  'Les Voix du Silence',
  NULL,
  'les-voix-du-silence',
  (SELECT id FROM authors WHERE slug = 'marie-martin'),
  21.50,
  'Un roman poignant qui explore les non-dits d''une famille sur trois générations. Marie Martin tisse une histoire captivante où le silence en dit plus que les mots.',
  'roman'::book_type,
  'Fiction littéraire',
  ARRAY['famille', 'secrets', 'générations'],
  312,
  '978-2-1234-5679-6',
  NOW() - INTERVAL '60 days',
  'published'::publish_status
WHERE NOT EXISTS (SELECT 1 FROM books WHERE slug = 'les-voix-du-silence');

INSERT INTO books (
  title,
  subtitle,
  slug,
  author_id,
  price,
  summary,
  book_type,
  genre,
  tags,
  page_count,
  isbn,
  publication_date,
  status
)
SELECT
  'Repenser la Société',
  'Essai sur les mutations contemporaines',
  'repenser-la-societe',
  (SELECT id FROM authors WHERE slug = 'ahmed-benali'),
  19.90,
  'Un essai percutant qui décortique les transformations de notre société moderne. Ahmed Benali propose une analyse lucide et des pistes de réflexion innovantes.',
  'essai'::book_type,
  'Sociologie',
  ARRAY['société', 'contemporain', 'réflexion'],
  198,
  '978-2-1234-5680-2',
  NOW() - INTERVAL '45 days',
  'published'::publish_status
WHERE NOT EXISTS (SELECT 1 FROM books WHERE slug = 'repenser-la-societe');

INSERT INTO books (
  title,
  subtitle,
  slug,
  author_id,
  price,
  summary,
  book_type,
  genre,
  tags,
  page_count,
  isbn,
  publication_date,
  status
)
SELECT
  'Instants Fugaces',
  'Recueil de poésies',
  'instants-fugaces',
  (SELECT id FROM authors WHERE slug = 'sophie-leroy'),
  15.90,
  'Un recueil de poésies qui capture la beauté éphémère des moments de vie. Sophie Leroy nous offre une palette d''émotions délicates et profondes.',
  'recueil'::book_type,
  'Poésie',
  ARRAY['poésie', 'émotions', 'instants'],
  128,
  '978-2-1234-5681-9',
  NOW() - INTERVAL '90 days',
  'published'::publish_status
WHERE NOT EXISTS (SELECT 1 FROM books WHERE slug = 'instants-fugaces');

INSERT INTO books (
  title,
  subtitle,
  slug,
  author_id,
  price,
  summary,
  book_type,
  genre,
  tags,
  page_count,
  isbn,
  scheduled_publish_at,
  status
)
SELECT
  'Devenir Soi',
  'Guide pratique pour s''épanouir',
  'devenir-soi',
  (SELECT id FROM authors WHERE slug = 'thomas-moreau'),
  22.90,
  'Un guide complet pour se reconnecter à soi-même et tracer son propre chemin. Thomas Moreau partage des outils concrets et des exercices pratiques pour transformer sa vie.',
  'developpement_personnel'::book_type,
  'Développement personnel',
  ARRAY['épanouissement', 'transformation', 'guide pratique'],
  278,
  '978-2-1234-5682-6',
  NOW() - INTERVAL '5 days',
  'published'::publish_status
WHERE NOT EXISTS (SELECT 1 FROM books WHERE slug = 'devenir-soi');

-- ============================================================================
-- EVENTS
-- ============================================================================

INSERT INTO events (title, description, event_date, location, author_id, published) VALUES
  (
    'Dédicace - Le Chemin des Ombres',
    'Rencontrez Jean Dupont pour une séance de dédicace de son dernier ouvrage autobiographique.',
    NOW() + INTERVAL '15 days',
    'Librairie du Centre, Paris 6e',
    (SELECT id FROM authors WHERE slug = 'jean-dupont'),
    true
  ),
  (
    'Conférence - Repenser la Société',
    'Ahmed Benali animera une conférence suivie d''un débat sur les mutations contemporaines.',
    NOW() + INTERVAL '30 days',
    'Bibliothèque François Mitterrand, Paris',
    (SELECT id FROM authors WHERE slug = 'ahmed-benali'),
    true
  ),
  (
    'Lecture poétique - Instants Fugaces',
    'Sophie Leroy vous invite à une soirée poétique intimiste autour de son nouveau recueil.',
    NOW() + INTERVAL '45 days',
    'Café Littéraire Le Mot Juste, Lyon',
    (SELECT id FROM authors WHERE slug = 'sophie-leroy'),
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BLOG POSTS
-- ============================================================================

INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  tags,
  status,
  published_at,
  author_id
)
SELECT
  'Bienvenue chez Faces Cachées Éditions',
  'bienvenue-chez-faces-cachees-editions',
  'Découvrez l''histoire de notre maison d''édition et notre vision de la littérature.',
  '# Bienvenue chez Faces Cachées Éditions

Nous sommes heureux de vous accueillir dans l''univers de Faces Cachées Éditions, une maison d''édition dédiée à la découverte de voix singulières et de récits authentiques.

## Notre mission

Notre mission est de révéler les faces cachées de l''existence à travers des récits puissants, qu''ils soient autobiographiques, romanesques ou poétiques. Nous croyons en la force des mots pour transformer les vies et créer du lien.

## Notre catalogue

Notre catalogue regroupe des œuvres variées : autobiographies bouleversantes, romans intimistes, essais percutants, recueils de poésie et ouvrages de développement personnel.

Nous espérons que vous trouverez dans nos pages de quoi nourrir votre esprit et votre cœur.',
  ARRAY['actualité', 'maison d''édition'],
  'published'::publish_status,
  NOW() - INTERVAL '120 days',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'bienvenue-chez-faces-cachees-editions');

INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  tags,
  status,
  published_at,
  author_id
)
SELECT
  'Rencontre avec Jean Dupont',
  'rencontre-avec-jean-dupont',
  'Portrait d''un auteur qui a su captiver nos cœurs avec son premier roman autobiographique.',
  '# Rencontre avec Jean Dupont

Jean Dupont nous ouvre les portes de son univers littéraire à travers cette interview exclusive.

## Votre parcours

**FCE** : Jean, comment est née votre vocation d''écrivain ?

**Jean Dupont** : C''est une longue histoire... J''ai toujours eu besoin d''écrire pour comprendre ma vie. L''écriture est devenue ma thérapie, puis ma passion.

## Votre prochain projet

Jean nous confie qu''il travaille actuellement sur un nouveau manuscrit qui promet d''être tout aussi bouleversant que le précédent.

Restez connectés pour ne rien manquer de l''actualité de Jean Dupont !',
  ARRAY['interview', 'auteur'],
  'published'::publish_status,
  NOW() - INTERVAL '60 days',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'rencontre-avec-jean-dupont');

-- ============================================================================
-- NEWSLETTER SUBSCRIPTIONS (Test data)
-- ============================================================================

INSERT INTO newsletter_subscriptions (email, active)
VALUES
  ('test1@example.com', true),
  ('test2@example.com', true)
ON CONFLICT (email) DO NOTHING;

COMMENT ON SCHEMA public IS
  'Seed data loaded for Faces Cachées Éditions development environment';
