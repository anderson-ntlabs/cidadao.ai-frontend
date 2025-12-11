/**
 * Certificate Verification API
 *
 * Public endpoint to verify certificate authenticity.
 * Works even after account deletion (LGPD compliant).
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for public certificate access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface VerificationResult {
  success: boolean
  valid: boolean
  certificate?: {
    holderName: string
    certificateType: string
    totalHours: number
    finalRank: string
    issuedAt: string
    programName: string
    verificationCode: string
  }
  error?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<VerificationResult>> {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Codigo de verificacao obrigatorio' },
        { status: 400 }
      )
    }

    // Clean and normalize the code
    const cleanCode = code.trim().toUpperCase()

    // Call the verification function
    const { data, error } = await supabase.rpc('verify_certificate', {
      p_code: cleanCode,
    })

    if (error) {
      console.error('Certificate verification error:', error)
      return NextResponse.json(
        { success: false, valid: false, error: 'Erro ao verificar certificado' },
        { status: 500 }
      )
    }

    // Check if certificate was found
    if (!data || data.length === 0 || !data[0].holder_name) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Certificado nao encontrado',
      })
    }

    const cert = data[0]

    // Return verification result
    return NextResponse.json({
      success: true,
      valid: cert.is_valid,
      certificate: {
        holderName: cert.holder_name,
        certificateType: cert.certificate_type,
        totalHours: parseFloat(cert.total_hours),
        finalRank: cert.final_rank,
        issuedAt: cert.issued_at,
        programName: cert.program_name,
        verificationCode: cleanCode,
      },
    })
  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json(
      { success: false, valid: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
