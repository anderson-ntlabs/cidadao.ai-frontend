# Supabase Security Fixes Guide

This document describes security fixes applied to the Cidadão.AI database based on Supabase Database Linter warnings.

## Issue 1: Function Search Path Mutable (FIXED)

**Status**: ✅ Fixed via migrations

**Problem**: Functions without `SET search_path = ''` can be vulnerable to search path manipulation attacks.

**Solution**: Added `SET search_path = ''` to all affected functions via two migrations:

### Migration 1: `20251209150000_fix_function_search_path.sql`

| Function                         | Source Migration                          | Fixed |
| -------------------------------- | ----------------------------------------- | ----- |
| `generate_parental_code`         | 20251209120000_agora_kids.sql             | ✅    |
| `create_parental_access_code`    | 20251209120000_agora_kids.sql             | ✅    |
| `validate_parental_code`         | 20251209120000_agora_kids.sql             | ✅    |
| `get_kids_daily_stats`           | 20251209120000_agora_kids.sql             | ✅    |
| `update_kids_profile_updated_at` | 20251209120000_agora_kids.sql             | ✅    |
| `get_challenge_period`           | 20251208000000_add_challenge_progress.sql | ✅    |
| `update_updated_at`              | Legacy (database-only)                    | ✅    |

### Migration 2: `20251209160000_fix_remaining_search_path.sql`

| Function                | Source Migration                  | Fixed |
| ----------------------- | --------------------------------- | ----- |
| `calculate_level`       | 00000000000000_initial_schema.sql | ✅    |
| `calculate_rank`        | 00000000000000_initial_schema.sql | ✅    |
| `update_rank_and_level` | 00000000000000_initial_schema.sql | ✅    |
| `get_agora_leaderboard` | 00000000000000_initial_schema.sql | ✅    |
| `get_user_rank`         | 00000000000000_initial_schema.sql | ✅    |

**Reference**: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

## Issue 2: Leaked Password Protection Disabled

**Status**: ⏳ Requires manual configuration in Supabase Dashboard

**Problem**: Supabase Auth can check passwords against HaveIBeenPwned.org database to prevent users from using compromised passwords.

**Requirements**:

- **Pro Plan or above** (not available on free tier)

**Steps to Enable**:

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers** → **Email**
4. Or use direct link: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/providers?provider=Email`
5. Find the **Password Security** section
6. Enable **Leaked Password Protection**
7. Optionally configure:
   - Minimum password length (recommended: 8+)
   - Required character types (digits, lowercase, uppercase, symbols)

**Reference**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Applying the Migration

To apply the search_path fix migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually in SQL Editor
# Copy contents of supabase/migrations/20251209150000_fix_function_search_path.sql
# Paste and execute in Supabase SQL Editor
```

## Verification

After applying fixes, re-run the Database Linter:

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Linter**
3. Verify no more `function_search_path_mutable` warnings appear
4. The `auth_leaked_password_protection` warning will only clear after enabling the feature in Auth settings (requires Pro plan)

---

**Author**: Anderson Henrique da Silva
**Date**: 2025-12-09
