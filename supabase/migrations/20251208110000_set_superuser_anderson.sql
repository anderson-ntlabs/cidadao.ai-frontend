-- Migration: Set superuser for Anderson
-- Description: Sets is_superuser=true for andersonhs27@gmail.com
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-08

-- Update or insert profile with superuser flag
INSERT INTO agora_profiles (user_id, email, full_name, is_superuser, has_completed_onboarding, onboarding_step)
SELECT
  id as user_id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Anderson') as full_name,
  true as is_superuser,
  false as has_completed_onboarding,
  0 as onboarding_step
FROM auth.users
WHERE email = 'andersonhs27@gmail.com'
ON CONFLICT (user_id)
DO UPDATE SET
  is_superuser = true,
  has_completed_onboarding = false,
  has_accepted_terms = false,
  onboarding_step = 0,
  total_xp = 0,
  current_level = 1,
  current_rank = 'novato',
  tracks = '{}';
