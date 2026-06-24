-- ================================================================
-- 🔐 Script de création d'un utilisateur admin de test
-- ================================================================
--
-- Email    : admin@test.com
-- Password : Test123456!
--
-- ⚠️ IMPORTANT : Exécutez ce script dans l'éditeur SQL de Supabase
-- ================================================================

-- Créer un utilisateur admin avec un mot de passe sécurisé
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  FALSE,
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Vérifier que l'utilisateur a bien été créé
SELECT email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'admin@test.com';
