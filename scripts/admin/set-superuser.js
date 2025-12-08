/**
 * Set Superuser Script
 * Sets is_superuser=true for a given email in agora_profiles
 *
 * Usage: node scripts/admin/set-superuser.js <email>
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const email = process.argv[2]

if (!email) {
  console.error('Usage: node scripts/admin/set-superuser.js <email>')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function setSuperuser() {
  console.log(`\nSetting superuser for: ${email}\n`)

  // First, find the user by email in auth.users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error('Error listing users:', usersError.message)
    // Try direct profile update by email
    console.log('Trying direct profile update...')

    const { data: profile, error: profileError } = await supabase
      .from('agora_profiles')
      .update({ is_superuser: true })
      .eq('email', email)
      .select()
      .single()

    if (profileError) {
      console.error('Error updating profile:', profileError.message)
      process.exit(1)
    }

    console.log('Profile updated:', profile)
    return
  }

  const user = users.users.find((u) => u.email === email)

  if (!user) {
    console.error(`User not found with email: ${email}`)
    console.log('\nAvailable users:')
    users.users.forEach((u) => console.log(`  - ${u.email}`))
    process.exit(1)
  }

  console.log(`Found user: ${user.id}`)

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('agora_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (existingProfile) {
    // Update existing profile
    const { data: profile, error: updateError } = await supabase
      .from('agora_profiles')
      .update({ is_superuser: true })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError.message)
      process.exit(1)
    }

    console.log('Profile updated successfully!')
    console.log('is_superuser:', profile.is_superuser)
  } else {
    // Create profile with superuser flag
    const { data: profile, error: insertError } = await supabase
      .from('agora_profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Superuser',
        is_superuser: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating profile:', insertError.message)
      process.exit(1)
    }

    console.log('Profile created with superuser!')
    console.log('is_superuser:', profile.is_superuser)
  }

  // Also reset onboarding for clean testing
  const { error: resetError } = await supabase
    .from('agora_profiles')
    .update({
      has_completed_onboarding: false,
      has_accepted_terms: false,
      onboarding_step: 0,
      total_xp: 0,
      current_level: 1,
      current_rank: 'novato',
      tracks: [],
    })
    .eq('user_id', user.id)

  if (resetError) {
    console.error('Error resetting onboarding:', resetError.message)
  } else {
    console.log('Onboarding reset for clean testing')
  }

  console.log('\n Done! You can now test the full onboarding flow.')
}

setSuperuser().catch(console.error)
