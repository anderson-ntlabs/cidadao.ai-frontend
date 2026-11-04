/**
 * LGPD Account Deletion API
 *
 * Implements Art. 18, VI of LGPD - right to deletion.
 *
 * Deletion is immediate and irreversible. It runs the database function
 * `public.delete_my_account()` (SECURITY DEFINER), which deletes every row
 * owned by the signed-in user and then the auth user itself in a single
 * transaction. The function only ever acts on `auth.uid()`, so a user can
 * never delete someone else's account.
 *
 * Issued certificates stay verifiable through `public_certificates`, which
 * has no link to the deleted account.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const CONFIRMATION_PHRASE = 'DELETAR MINHA CONTA'
const SUPPORT_EMAIL = 'andersonhs27@gmail.com'

interface DeleteAccountRequest {
  confirmation?: string
}

interface DeleteMyAccountResult {
  user_deleted?: boolean
  deleted_rows?: Record<string, number>
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    let body: DeleteAccountRequest = {}
    try {
      body = (await request.json()) as DeleteAccountRequest
    } catch {
      body = {}
    }

    if (body.confirmation !== CONFIRMATION_PHRASE) {
      return NextResponse.json(
        { error: `Confirmação inválida. Digite "${CONFIRMATION_PHRASE}" para confirmar.` },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.rpc('delete_my_account')

    if (error) {
      console.error('Delete account RPC error:', error.message)
      return NextResponse.json(
        {
          error: `Não foi possível excluir a conta. Tente novamente ou escreva para ${SUPPORT_EMAIL}.`,
        },
        { status: 500 }
      )
    }

    const result = data as DeleteMyAccountResult | null

    if (!result?.user_deleted) {
      console.error('Delete account RPC returned without deleting the user')
      return NextResponse.json(
        { error: `A exclusão não foi concluída. Escreva para ${SUPPORT_EMAIL}.` },
        { status: 500 }
      )
    }

    // The auth user no longer exists: clear the session cookies.
    try {
      await supabase.auth.signOut()
    } catch {
      // Session already invalid; cookies are cleared on the client as well
    }

    return NextResponse.json({
      success: true,
      message: 'Sua conta e todos os seus dados foram excluídos.',
      details: result.deleted_rows ?? {},
      note: 'Certificados emitidos continuam verificáveis pelo código de verificação.',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
