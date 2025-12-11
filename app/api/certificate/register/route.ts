/**
 * Certificate Registration API
 *
 * Registers a certificate in the public_certificates table.
 * Uses service role to insert (RLS blocks client inserts).
 * Called internally when a certificate is generated.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'

// Service role client for public_certificates inserts
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase service role configuration')
  }

  return createClient(url, key)
}

interface RegisterRequest {
  verificationCode: string
  verificationHash: string
  holderName: string
  certificateType: string
  totalHours: number
  totalXp: number
  finalLevel: number
  finalRank: string
  missionsCompleted: number
  programStartDate: string
  programEndDate: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify the request is from an authenticated user
    const authClient = await createAuthClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body: RegisterRequest = await request.json()

    // Validate required fields
    if (!body.verificationCode || !body.holderName) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Use service role to insert into public_certificates
    const supabase = getServiceClient()

    const { error } = await supabase.from('public_certificates').insert({
      verification_code: body.verificationCode,
      verification_hash: body.verificationHash,
      holder_name: body.holderName,
      certificate_type: body.certificateType || 'completion',
      total_hours: body.totalHours,
      total_xp: body.totalXp,
      final_level: body.finalLevel,
      final_rank: body.finalRank,
      missions_completed: body.missionsCompleted || 0,
      program_start_date: body.programStartDate,
      program_end_date: body.programEndDate,
    })

    if (error) {
      // Check if it's a duplicate (certificate already registered)
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Certificado ja registrado' })
      }

      console.error('Failed to register certificate:', error)
      return NextResponse.json({ error: 'Erro ao registrar certificado' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Certificado registrado com sucesso',
      verificationUrl: `/pt/agora/verificar?code=${body.verificationCode}`,
    })
  } catch (error) {
    console.error('Certificate registration error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
