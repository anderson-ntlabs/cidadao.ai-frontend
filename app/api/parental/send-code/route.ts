/**
 * Send Parental Access Code API Route
 *
 * Generates a 6-digit code and sends it to the parent's email.
 * Code is valid for 10 minutes and single-use.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

// Lazy initialization of Resend (only when API key is available)
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Get user's kids profile
    const { data: kidsProfile, error: profileError } = await supabase
      .from('agora_kids_profiles')
      .select('id, child_name, parent_email')
      .eq('parent_user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching kids profile:', profileError)
      return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
    }

    if (!kidsProfile) {
      return NextResponse.json({ error: 'Nenhum perfil Kids ativo encontrado' }, { status: 404 })
    }

    // Generate code using database function
    const { data: code, error: codeError } = await supabase.rpc('generate_parental_access_code', {
      p_user_id: user.id,
      p_kids_profile_id: kidsProfile.id,
      p_email: kidsProfile.parent_email || user.email,
    })

    if (codeError || !code) {
      console.error('Error generating code:', codeError)
      return NextResponse.json({ error: 'Erro ao gerar código' }, { status: 500 })
    }

    // Send email with code
    const parentEmail = kidsProfile.parent_email || user.email

    if (!parentEmail) {
      return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
    }

    // Check if Resend is configured
    const resend = getResendClient()
    if (!resend) {
      // In development, just return the code directly
      console.log(`[DEV] Parental code for ${parentEmail}: ${code}`)
      return NextResponse.json({
        success: true,
        message: 'Código gerado (modo desenvolvimento)',
        email: parentEmail,
        // Only include code in development
        ...(process.env.NODE_ENV === 'development' && { code }),
      })
    }

    const { error: emailError } = await resend.emails.send({
      from: 'Ágora Kids <onboarding@resend.dev>',
      to: parentEmail,
      subject: `Seu código de acesso parental: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <tr>
                <td>
                  <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Ágora Kids</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Dashboard dos Pais</p>
                  </div>

                  <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                      Olá! Você solicitou acesso ao Dashboard dos Pais para acompanhar as atividades de <strong>${kidsProfile.child_name}</strong>.
                    </p>

                    <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                      <p style="color: #166534; font-size: 14px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                        Seu código de acesso
                      </p>
                      <p style="color: #166534; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">
                        ${code}
                      </p>
                    </div>

                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                      <strong>Importante:</strong> Este código é válido por <strong>10 minutos</strong> e só pode ser usado uma vez.
                    </p>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                      Se você não solicitou este código, ignore este email.<br>
                      Ágora Academy - Cidadão.AI
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Código enviado por email',
      email: parentEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
