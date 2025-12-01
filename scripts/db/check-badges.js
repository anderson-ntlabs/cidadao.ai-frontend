#!/usr/bin/env node
/**
 * Check badges and survey status in Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkBadges() {
  console.log('🔍 Verificando badges e survey responses...\n')

  // Check all badges
  const { data: badges, error: badgeError } = await supabase.from('user_badges').select('*')

  console.log('📛 user_badges:', badges?.length || 0, 'registros')
  if (badgeError) {
    console.log('   Erro:', badgeError.message)
  }
  if (badges?.length > 0) {
    badges.forEach((b) => console.log('  -', b.badge_type, ':', b.user_id.slice(0, 8) + '...'))
  }

  // Check all survey responses
  const { data: surveys, error: surveyError } = await supabase.from('survey_responses').select('*')

  console.log('\n📋 survey_responses:', surveys?.length || 0, 'registros')
  if (surveyError) {
    console.log('   Erro:', surveyError.message)
  }
  if (surveys?.length > 0) {
    surveys.forEach((s) =>
      console.log(
        '  - user:',
        s.user_id.slice(0, 8) + '...',
        'completed:',
        s.completed_at ? 'YES' : 'NO'
      )
    )
  }

  // Check profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .limit(5)

  console.log('\n👤 profiles:', profiles?.length || 0, 'registros')
  if (profileError) {
    console.log('   Erro:', profileError.message)
  }
  if (profiles?.length > 0) {
    profiles.forEach((p) =>
      console.log('  -', p.full_name || p.email || 'N/A', ':', p.id.slice(0, 8) + '...')
    )
  }
}

checkBadges().catch(console.error)
