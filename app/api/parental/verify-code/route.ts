/**
 * Verify Parental Access Code API Route
 *
 * Validates a 6-digit code and returns parent dashboard access.
 * Code is marked as used after successful verification.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { code, email } = body

    if (!code || !email) {
      return NextResponse.json({ error: 'Código e email são obrigatórios' }, { status: 400 })
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Código inválido. Digite os 6 dígitos.' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify code using database function
    const { data, error } = await supabase.rpc('verify_parental_access_code', {
      p_code: code,
      p_email: email,
    })

    if (error) {
      console.error('Error verifying code:', error)
      return NextResponse.json({ error: 'Erro ao verificar código' }, { status: 500 })
    }

    // Database function returns array with one row
    const result = data?.[0]

    if (!result || !result.is_valid) {
      return NextResponse.json(
        {
          error: 'Código inválido ou expirado. Solicite um novo código.',
          isValid: false,
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      isValid: true,
      userId: result.user_id,
      kidsProfileId: result.kids_profile_id,
      childName: result.child_name,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
