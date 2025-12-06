#!/usr/bin/env node

/**
 * Diagnose Academy Persistence Issues
 *
 * Checks:
 * 1. If academy tables exist
 * 2. If RLS is enabled on tables
 * 3. If policies exist
 * 4. Row counts in tables
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-06
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ACADEMY_TABLES = [
  'academy_profiles',
  'academy_consent',
  'academy_sessions',
  'academy_diary_entries',
  'academy_certificates',
  'academy_xp_transactions',
  'academy_video_progress',
  'academy_reading_progress',
]

async function diagnose() {
  console.log('='.repeat(60))
  console.log('ACADEMY PERSISTENCE DIAGNOSTIC')
  console.log('='.repeat(60))
  console.log()

  // 1. Check current auth session
  console.log('1. CHECKING AUTH SESSION')
  console.log('-'.repeat(40))

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.log('  Session error:', sessionError.message)
  } else if (session) {
    console.log('  User ID:', session.user.id)
    console.log('  Email:', session.user.email)
    console.log('  Provider:', session.user.app_metadata?.provider || 'unknown')
  } else {
    console.log('  No active session (anonymous user)')
    console.log('  Note: RLS policies will only show your own data')
  }
  console.log()

  // 2. Check tables exist and row counts
  console.log('2. CHECKING TABLES')
  console.log('-'.repeat(40))

  for (const table of ACADEMY_TABLES) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`  ${table}: TABLE NOT FOUND`)
      } else if (error.code === '42501') {
        console.log(`  ${table}: PERMISSION DENIED (RLS blocking)`)
      } else {
        console.log(`  ${table}: ERROR - ${error.message} (${error.code})`)
      }
    } else {
      console.log(`  ${table}: ${count ?? 'unknown'} rows`)
    }
  }
  console.log()

  // 3. Try a test insert to academy_profiles (if authenticated)
  if (session) {
    console.log('3. TESTING INSERT (authenticated user)')
    console.log('-'.repeat(40))

    // First check if profile already exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('academy_profiles')
      .select('id, full_name, email')
      .eq('user_id', session.user.id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.log('  Select error:', selectError.message)
    }

    if (existingProfile) {
      console.log('  Profile already exists:')
      console.log('    ID:', existingProfile.id)
      console.log('    Name:', existingProfile.full_name)
      console.log('    Email:', existingProfile.email)
    } else {
      console.log('  No profile found. Attempting insert...')

      const { error: insertError, data: insertData } = await supabase
        .from('academy_profiles')
        .insert({
          user_id: session.user.id,
          full_name: session.user.user_metadata?.full_name || 'Test User',
          email: session.user.email,
          main_track: 'backend',
        })
        .select()
        .single()

      if (insertError) {
        console.log('  INSERT FAILED:', insertError.message)
        console.log('  Error code:', insertError.code)
        console.log('  Error details:', JSON.stringify(insertError, null, 2))
      } else {
        console.log('  INSERT SUCCESS!')
        console.log('  Created profile ID:', insertData?.id)
      }
    }

    // Check consent
    console.log()
    console.log('  Checking consent record...')
    const { data: consent, error: consentError } = await supabase
      .from('academy_consent')
      .select('id, accepted_at')
      .eq('user_id', session.user.id)
      .single()

    if (consentError && consentError.code !== 'PGRST116') {
      console.log('  Consent select error:', consentError.message)
    }

    if (consent) {
      console.log('  Consent exists:')
      console.log('    ID:', consent.id)
      console.log('    Accepted at:', consent.accepted_at)
    } else {
      console.log('  No consent record found')
    }
  } else {
    console.log('3. SKIPPING INSERT TEST (not authenticated)')
    console.log('-'.repeat(40))
    console.log('  Login to the app first, then run this script again')
  }
  console.log()

  // 4. Check public tables (no RLS)
  console.log('4. CHECKING PUBLIC TABLES (no auth required)')
  console.log('-'.repeat(40))

  const publicTables = ['academy_videos', 'academy_required_readings', 'academy_events']

  for (const table of publicTables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`  ${table}: ERROR - ${error.message}`)
    } else {
      console.log(`  ${table}: ${count ?? 'unknown'} rows`)
    }
  }
  console.log()

  // 5. Summary
  console.log('='.repeat(60))
  console.log('DIAGNOSTIC SUMMARY')
  console.log('='.repeat(60))
  console.log()
  console.log('If tables show "PERMISSION DENIED" or "0 rows" even when')
  console.log('you are logged in, the issue is likely:')
  console.log()
  console.log('  1. RLS policies not applied correctly')
  console.log('  2. Migration not fully applied')
  console.log('  3. auth.uid() not matching user_id in RLS check')
  console.log()
  console.log('To fix, run in Supabase SQL Editor:')
  console.log()
  console.log('  -- Check if policies exist')
  console.log("  SELECT * FROM pg_policies WHERE tablename LIKE 'academy%';")
  console.log()
  console.log('  -- Check RLS status')
  console.log('  SELECT relname, relrowsecurity FROM pg_class')
  console.log("  WHERE relname LIKE 'academy%';")
  console.log()
}

diagnose()
  .then(() => {
    console.log('Diagnostic complete.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Diagnostic failed:', err)
    process.exit(1)
  })
