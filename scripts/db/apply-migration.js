#!/usr/bin/env node
/**
 * Apply SQL migration directly to Supabase
 *
 * Usage: node scripts/db/apply-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  console.error('')
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  console.error('You can find it in: Supabase Dashboard > Settings > API > service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function applyMigration() {
  console.log('🚀 Applying migration to Supabase...\n')

  const migrationPath = path.join(
    __dirname,
    '../../supabase/migrations/20251201_create_missing_tables.sql'
  )
  const sql = fs.readFileSync(migrationPath, 'utf8')

  // Split into individual statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

  let success = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    const preview = statement.substring(0, 60).replace(/\n/g, ' ')

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️  [${i + 1}/${statements.length}] Skipped: ${preview}...`)
          skipped++
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`)
          errors++
        }
      } else {
        console.log(`✅ [${i + 1}/${statements.length}] Applied: ${preview}...`)
        success++
      }
    } catch (err) {
      console.error(`❌ [${i + 1}/${statements.length}] Exception: ${err.message}`)
      errors++
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   ✅ Success: ${success}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
}

applyMigration().catch(console.error)
