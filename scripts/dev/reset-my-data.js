#!/usr/bin/env node
/**
 * Reset User Data Script
 *
 * Resets all Agora/Kids data for a specific email using Supabase REST API.
 * Run: node scripts/dev/reset-my-data.js
 */

require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Change this to your email
const TARGET_EMAIL = 'andersonhs27@gmail.com'

async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: options.method === 'DELETE' ? 'return=minimal' : 'return=representation',
      ...options.headers,
    },
  })

  if (!response.ok && response.status !== 204) {
    const text = await response.text()
    throw new Error(`${response.status}: ${text}`)
  }

  if (response.status === 204 || options.method === 'DELETE') {
    return null
  }

  return response.json()
}

async function resetUserData() {
  console.log(`\n🔄 Resetting data for: ${TARGET_EMAIL}\n`)

  // 1. Find user in agora_profiles by email
  const profiles = await supabaseRequest(
    `agora_profiles?email=eq.${encodeURIComponent(TARGET_EMAIL)}&select=user_id`
  )

  if (!profiles || profiles.length === 0) {
    console.log('❌ User not found in agora_profiles')
    console.log('   Either already deleted or never existed\n')
    return
  }

  const userId = profiles[0].user_id
  console.log(`✅ Found user_id: ${userId}\n`)

  // 2. Get kids profile if exists
  const kidsProfiles = await supabaseRequest(
    `agora_kids_profiles?parent_user_id=eq.${userId}&select=id`
  )
  const kidsProfileId = kidsProfiles?.[0]?.id

  // 3. Delete in order (respecting foreign keys)
  const deletions = [
    kidsProfileId && {
      table: 'agora_kids_sessions',
      filter: `kids_profile_id=eq.${kidsProfileId}`,
    },
    { table: 'agora_parental_codes', filter: `parent_user_id=eq.${userId}` },
    { table: 'agora_kids_profiles', filter: `parent_user_id=eq.${userId}` },
    { table: 'agora_sessions', filter: `user_id=eq.${userId}` },
    { table: 'agora_xp_transactions', filter: `user_id=eq.${userId}` },
    { table: 'agora_diary_entries', filter: `user_id=eq.${userId}` },
    { table: 'agora_consent', filter: `user_id=eq.${userId}` },
    { table: 'agora_calendar_events', filter: `user_id=eq.${userId}` },
    { table: 'agora_video_progress', filter: `user_id=eq.${userId}` },
    { table: 'agora_challenge_progress', filter: `user_id=eq.${userId}` },
    { table: 'agora_profiles', filter: `user_id=eq.${userId}` },
  ].filter(Boolean)

  for (const { table, filter } of deletions) {
    try {
      await supabaseRequest(`${table}?${filter}`, { method: 'DELETE' })
      console.log(`  ✅ ${table}: Deleted`)
    } catch (error) {
      console.log(`  ❌ ${table}: ${error.message}`)
    }
  }

  console.log('\n✨ Reset complete!')
  console.log('\n📋 Next steps:')
  console.log('  1. Clear localStorage in browser (F12 → Application → Local Storage → Clear)')
  console.log('  2. Go to https://cidadao-ai-frontend.vercel.app/pt/agora/login')
  console.log('  3. Login again - you should see the LGPD consent flow\n')
}

resetUserData().catch(console.error)
