import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const getUser = vi.fn()
const rpc = vi.fn()
const signOut = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser, signOut },
    rpc,
  })),
}))

import { POST } from '../route'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/user/delete-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const signedIn = { data: { user: { id: 'user-1', email: 'a@example.com' } }, error: null }

describe('POST /api/user/delete-account', () => {
  beforeEach(() => {
    getUser.mockReset()
    rpc.mockReset()
    signOut.mockReset()
    signOut.mockResolvedValue({ error: null })
  })

  it('returns 401 when no user is signed in', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })

    const response = await POST(makeRequest({ confirmation: 'DELETAR MINHA CONTA' }))

    expect(response.status).toBe(401)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('returns 400 without the confirmation phrase', async () => {
    getUser.mockResolvedValue(signedIn)

    const response = await POST(makeRequest({ confirmation: 'nope' }))

    expect(response.status).toBe(400)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('deletes the account through the delete_my_account RPC', async () => {
    getUser.mockResolvedValue(signedIn)
    rpc.mockResolvedValue({
      data: { user_deleted: true, deleted_rows: { agora_profiles: 1, chat_messages: 3 } },
      error: null,
    })

    const response = await POST(makeRequest({ confirmation: 'DELETAR MINHA CONTA' }))
    const body = await response.json()

    expect(rpc).toHaveBeenCalledWith('delete_my_account')
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.details).toEqual({ agora_profiles: 1, chat_messages: 3 })
    expect(signOut).toHaveBeenCalled()
  })

  it('returns 500 when the RPC fails', async () => {
    getUser.mockResolvedValue(signedIn)
    rpc.mockResolvedValue({ data: null, error: { message: 'permission denied' } })

    const response = await POST(makeRequest({ confirmation: 'DELETAR MINHA CONTA' }))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBeUndefined()
    expect(signOut).not.toHaveBeenCalled()
  })

  it('does not report success when the user was not deleted', async () => {
    getUser.mockResolvedValue(signedIn)
    rpc.mockResolvedValue({ data: { user_deleted: false, deleted_rows: {} }, error: null })

    const response = await POST(makeRequest({ confirmation: 'DELETAR MINHA CONTA' }))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBeUndefined()
  })
})
