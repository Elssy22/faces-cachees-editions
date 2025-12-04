-- Migration 015: Ajout des auteurs réels de Faces Cachées Éditions

-- Insérer les auteurs réels avec leurs photos
INSERT INTO authors (first_name, last_name, slug, bio, photo_url, instagram_url, twitter_url, facebook_url, youtube_url) VALUES
  (
    'Élise',
    'Saint-Jullian',
    'elise-saint-jullian',
    'Journaliste parisienne ayant collaboré avec Le Monde des religions et Terriennes (TV5MONDE). Elle se consacre à la défense des droits des femmes et l''égalité entre les sexes, et met en lumière des femmes inspirantes d''horizons divers.',
    'https://www.dropbox.com/s/xyfcabmu2jrt8gy/%C3%89lise.jpg?raw=1',
    'https://instagram.com/elise.saintjullian',
    NULL,
    NULL,
    NULL
  ),
  (
    'LK',
    'Imany',
    'lk-imany',
    'Paysagiste devenue écrivaine et illustratrice, explorant la représentation des minorités en France. Elle travaille dans la science-fiction et la fantasy féministe, avec un intérêt pour le streetstyle et les jeux vidéo.',
    'https://www.dropbox.com/s/ka0kiehunlnscsr/Imany.jpg?raw=1',
    'https://instagram.com/lk.imany',
    NULL,
    NULL,
    'https://youtube.com/channel/UCSeoNT75Ut-LB9atql0t6Xw'
  ),
  (
    'Bolewa',
    'Sabourin',
    'bolewa-sabourin',
    'Danseuse formée aux traditions congolaises depuis plus de 20 ans. Co-fondatrice de l''association LOBA ("exprime-toi" en Lingala), utilisant la danse comme outil civique et psychologique en France et au Congo.',
    'https://www.dropbox.com/s/oitkmctj4yguvb0/bolewa-sabourin.jpg?raw=1',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Manu',
    'Key',
    'manu-key',
    'Rappeur né en Guadeloupe en 1971, de son vrai nom Manuel Coudray. Membre fondateur de Mafia K''1 Fry, considéré comme un pionnier du rap français. Il a produit pour 113, Rohff et Oxmo Puccino.',
    'https://www.dropbox.com/s/gjtor4wxa4s6joc/manu-key.jpg?raw=1',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Rachid',
    'Sguini',
    'rachid-sguini',
    'Graphiste né en 1988 au Puy-en-Velay. Créateur du blog "Les Gribouillages de Rakidd", il a collaboré avec Gulli et Universal pour des projets d''illustration.',
    'https://www.dropbox.com/s/qu0wmxuaa5nqrw2/rachid-sguini.png?raw=1',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Balla',
    'Fofana',
    'balla-fofana',
    'Diplômé d''un Master en communication politique. Ancien membre du Bondy Blog et journaliste économique à TF1 (2014-2016). Actuellement à Libération, il mène des projets d''éducation aux médias dans les lycées parisiens.',
    'https://www.dropbox.com/s/2ex7vqyyi612smt/balla-fofana.jpg?raw=1',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Bakary',
    'Sakho',
    'bakary-sakho',
    'Militant engagé sur les questions de droit au logement et d''identité. Co-fondateur de BGA (Braves garçons d''Afrique), il a ensuite travaillé avec Meltin''club et LIDEE. Auteur de "Je suis" publié en 2015.',
    'https://www.dropbox.com/s/win2qv5xd1ft2mz/HA_Bakary_36-2.jpg?raw=1',
    NULL,
    NULL,
    NULL,
    NULL
  )
ON CONFLICT (slug) DO UPDATE SET
  bio = EXCLUDED.bio,
  photo_url = EXCLUDED.photo_url,
  instagram_url = EXCLUDED.instagram_url,
  twitter_url = EXCLUDED.twitter_url,
  facebook_url = EXCLUDED.facebook_url,
  youtube_url = EXCLUDED.youtube_url;

-- Note: Les liens entre auteurs et livres devront être mis à jour manuellement via l'interface admin
