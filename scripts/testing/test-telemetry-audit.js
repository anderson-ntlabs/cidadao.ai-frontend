/**
 * Agora Telemetry Audit Script
 * Tests that all telemetry data is being properly stored in Supabase
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testTelemetry() {
  console.log('\n📊 ÁGORA - AUDITORIA DE TELEMETRIA\n')
  console.log('='.repeat(60))

  const tables = [
    { name: 'agora_profiles', label: 'Perfis de Usuarios' },
    { name: 'agora_xp_transactions', label: 'Transacoes de XP' },
    { name: 'agora_sessions', label: 'Sessoes de Estudo' },
    { name: 'agora_video_progress', label: 'Progresso em Videos' },
    { name: 'agora_reading_progress', label: 'Progresso em Leituras' },
    { name: 'agora_calendar_events', label: 'Eventos do Calendario' },
    { name: 'agora_diary_entries', label: 'Entradas do Diario' },
    { name: 'agora_certificates', label: 'Certificados' },
    { name: 'agora_consent', label: 'Consentimentos LGPD' },
    { name: 'agora_badges', label: 'Badges/Conquistas' },
  ]

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })

      const label = table.label.padEnd(25)
      if (error) {
        console.log('X ' + label + ' | Erro: ' + error.message)
      } else {
        console.log('V ' + label + ' | ' + count + ' registros')
      }
    } catch (e) {
      const label = table.label.padEnd(25)
      console.log('X ' + label + ' | Tabela nao existe')
    }
  }

  // Get sample XP transactions for audit
  console.log('\n' + '='.repeat(60))
  console.log('📝 ULTIMAS 5 TRANSACOES DE XP (AUDIT LOG)\n')

  const { data: xpTx, error: xpError } = await supabase
    .from('agora_xp_transactions')
    .select('created_at, amount, description, source_type, balance_after')
    .order('created_at', { ascending: false })
    .limit(5)

  if (xpError) {
    console.log('Erro ao buscar transacoes:', xpError.message)
  } else if (xpTx && xpTx.length > 0) {
    xpTx.forEach((tx, i) => {
      const date = new Date(tx.created_at).toLocaleString('pt-BR')
      console.log(
        i +
          1 +
          '. [' +
          date +
          '] +' +
          tx.amount +
          'XP | ' +
          tx.description +
          ' (' +
          tx.source_type +
          ')'
      )
    })
  } else {
    console.log('Nenhuma transacao registrada ainda.')
  }

  // Get sample sessions
  console.log('\n' + '='.repeat(60))
  console.log('⏱️ ULTIMAS 5 SESSOES DE ESTUDO\n')

  const { data: sessions, error: sessError } = await supabase
    .from('agora_sessions')
    .select('started_at, ended_at, duration_minutes, xp_earned, status')
    .order('started_at', { ascending: false })
    .limit(5)

  if (sessError) {
    console.log('Erro ao buscar sessoes:', sessError.message)
  } else if (sessions && sessions.length > 0) {
    sessions.forEach((s, i) => {
      const date = new Date(s.started_at).toLocaleString('pt-BR')
      console.log(
        i +
          1 +
          '. [' +
          date +
          '] ' +
          (s.duration_minutes || 0) +
          'min | +' +
          (s.xp_earned || 0) +
          'XP | ' +
          s.status
      )
    })
  } else {
    console.log('Nenhuma sessao registrada ainda.')
  }

  // Check profiles summary
  console.log('\n' + '='.repeat(60))
  console.log('👤 RESUMO DE PERFIS\n')

  const { data: profiles, error: profError } = await supabase
    .from('agora_profiles')
    .select(
      'full_name, total_xp, current_level, current_rank, total_sessions, total_time_minutes, current_streak'
    )
    .order('total_xp', { ascending: false })
    .limit(5)

  if (profError) {
    console.log('Erro ao buscar perfis:', profError.message)
  } else if (profiles && profiles.length > 0) {
    profiles.forEach((p, i) => {
      const name = (p.full_name || 'Anonimo').substring(0, 20).padEnd(20)
      console.log(
        i +
          1 +
          '. ' +
          name +
          ' | ' +
          p.total_xp +
          'XP | Lv' +
          p.current_level +
          ' | ' +
          p.current_rank +
          ' | ' +
          p.total_sessions +
          ' sessoes | ' +
          p.total_time_minutes +
          'min | streak:' +
          p.current_streak
      )
    })
  } else {
    console.log('Nenhum perfil registrado ainda.')
  }

  console.log('\n' + '='.repeat(60))
  console.log('V Auditoria concluida\n')
}

testTelemetry().catch(console.error)
