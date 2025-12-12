#!/usr/bin/env node
/**
 * Validate YouTube videos in Agora tracks
 * Checks if videos are accessible via YouTube oEmbed API
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkYouTubeVideo(youtubeId) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`,
      { method: 'HEAD' }
    )
    return response.ok ? 'valid' : 'unavailable'
  } catch {
    return 'invalid'
  }
}

async function validateVideos() {
  console.log('🔍 Validando vídeos do YouTube...\n')

  // Get all adult videos
  const { data: adultVideos, error: e1 } = await supabase
    .from('agora_module_videos')
    .select('id, youtube_id, title')
    .order('id')

  if (e1) {
    console.log('Erro ao buscar vídeos adultos:', e1.message)
    return
  }

  // Get unique YouTube IDs
  const uniqueAdultIds = [...new Set(adultVideos.map((v) => v.youtube_id))]
  console.log(`📚 Validando ${uniqueAdultIds.length} vídeos adultos únicos...\n`)

  const adultResults = {}
  let valid = 0,
    invalid = 0

  for (const youtubeId of uniqueAdultIds) {
    const status = await checkYouTubeVideo(youtubeId)
    adultResults[youtubeId] = status
    if (status === 'valid') valid++
    else invalid++
    process.stdout.write(`\r  Progresso: ${valid + invalid}/${uniqueAdultIds.length}`)
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log('\n')
  console.log(`✅ Válidos: ${valid}`)
  console.log(`❌ Inválidos/Indisponíveis: ${invalid}`)

  // Show broken videos
  const brokenAdultIds = Object.entries(adultResults)
    .filter(([, status]) => status !== 'valid')
    .map(([id]) => id)

  if (brokenAdultIds.length > 0) {
    console.log('\n❌ Vídeos adultos quebrados:')
    for (const id of brokenAdultIds) {
      const videos = adultVideos.filter((v) => v.youtube_id === id)
      console.log(`  - ${id}: ${videos[0]?.title || 'Unknown'}`)
    }
  }

  // Update validation status in database
  console.log('\n📝 Atualizando status de validação no banco...')
  for (const [youtubeId, status] of Object.entries(adultResults)) {
    const { error } = await supabase
      .from('agora_module_videos')
      .update({ validation_status: status, last_validated_at: new Date().toISOString() })
      .eq('youtube_id', youtubeId)

    if (error) console.log(`   Erro ao atualizar ${youtubeId}:`, error.message)
  }

  // Validate kids videos
  console.log('\n👶 Validando vídeos kids...\n')
  const { data: kidsVideos, error: e2 } = await supabase
    .from('agora_kids_videos')
    .select('id, youtube_id, title')
    .order('id')

  if (e2) {
    console.log('Erro ao buscar vídeos kids:', e2.message)
    return
  }

  const uniqueKidsIds = [...new Set(kidsVideos.map((v) => v.youtube_id))]
  const kidsResults = {}
  valid = 0
  invalid = 0

  for (const youtubeId of uniqueKidsIds) {
    const status = await checkYouTubeVideo(youtubeId)
    kidsResults[youtubeId] = status
    if (status === 'valid') valid++
    else invalid++
    process.stdout.write(`\r  Progresso: ${valid + invalid}/${uniqueKidsIds.length}`)
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log('\n')
  console.log(`✅ Válidos: ${valid}`)
  console.log(`❌ Inválidos/Indisponíveis: ${invalid}`)

  const brokenKidsIds = Object.entries(kidsResults)
    .filter(([, status]) => status !== 'valid')
    .map(([id]) => id)

  if (brokenKidsIds.length > 0) {
    console.log('\n❌ Vídeos kids quebrados:')
    for (const id of brokenKidsIds) {
      const videos = kidsVideos.filter((v) => v.youtube_id === id)
      console.log(`  - ${id}: ${videos[0]?.title || 'Unknown'}`)
    }
  }

  // Update kids validation status
  console.log('\n📝 Atualizando status de validação kids no banco...')
  for (const [youtubeId, status] of Object.entries(kidsResults)) {
    const { error } = await supabase
      .from('agora_kids_videos')
      .update({ validation_status: status, last_validated_at: new Date().toISOString() })
      .eq('youtube_id', youtubeId)

    if (error) console.log(`   Erro ao atualizar ${youtubeId}:`, error.message)
  }

  console.log('\n✅ Validação concluída!')
}

validateVideos()
