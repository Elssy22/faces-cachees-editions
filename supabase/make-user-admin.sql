-- Script pour donner les droits admin à un utilisateur
-- Remplacez 'votre.email@example.com' par l'email de l'utilisateur

-- Option 1: Si vous connaissez l'email de l'utilisateur
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'votre.email@example.com'
);

-- Option 2: Voir tous les utilisateurs et leur rôle actuel
SELECT
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Option 3: Donner les droits admin au premier utilisateur créé
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = (
--   SELECT id FROM auth.users
--   ORDER BY created_at ASC
--   LIMIT 1
-- );
