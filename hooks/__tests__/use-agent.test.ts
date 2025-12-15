import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useAgent,
  useAgentOrNull,
  useAgents,
  getAgentById,
  getAgentByIdOrNull,
  isValidAgentId,
  getAllAgents,
  agentMap,
  defaultAgent,
} from '../use-agent'

describe('getAgentById', () => {
  it('returns default agent for null', () => {
    const agent = getAgentById(null)
    expect(agent).toBe(defaultAgent)
    expect(agent.id).toBe('abaporu')
  })

  it('returns default agent for undefined', () => {
    const agent = getAgentById(undefined)
    expect(agent).toBe(defaultAgent)
  })

  it('returns agent by ID', () => {
    const agent = getAgentById('zumbi')
    expect(agent.id).toBe('zumbi')
  })

  it('returns default agent for invalid ID', () => {
    const agent = getAgentById('non-existent-agent')
    expect(agent).toBe(defaultAgent)
  })
})

describe('getAgentByIdOrNull', () => {
  it('returns undefined for null', () => {
    const agent = getAgentByIdOrNull(null)
    expect(agent).toBeUndefined()
  })

  it('returns undefined for undefined', () => {
    const agent = getAgentByIdOrNull(undefined)
    expect(agent).toBeUndefined()
  })

  it('returns agent by ID', () => {
    const agent = getAgentByIdOrNull('anita')
    expect(agent?.id).toBe('anita')
  })

  it('returns undefined for invalid ID', () => {
    const agent = getAgentByIdOrNull('non-existent')
    expect(agent).toBeUndefined()
  })
})

describe('isValidAgentId', () => {
  it('returns false for null', () => {
    expect(isValidAgentId(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidAgentId(undefined)).toBe(false)
  })

  it('returns true for valid ID', () => {
    expect(isValidAgentId('zumbi')).toBe(true)
    expect(isValidAgentId('anita')).toBe(true)
    expect(isValidAgentId('abaporu')).toBe(true)
  })

  it('returns false for invalid ID', () => {
    expect(isValidAgentId('invalid-id')).toBe(false)
  })
})

describe('getAllAgents', () => {
  it('returns all agents', () => {
    const agents = getAllAgents()
    expect(Array.isArray(agents)).toBe(true)
    expect(agents.length).toBeGreaterThan(0)
  })

  it('includes known agents', () => {
    const agents = getAllAgents()
    const agentIds = agents.map((a) => a.id)
    expect(agentIds).toContain('abaporu')
    expect(agentIds).toContain('zumbi')
  })
})

describe('agentMap', () => {
  it('is a Map', () => {
    expect(agentMap).toBeInstanceOf(Map)
  })

  it('contains agents', () => {
    expect(agentMap.size).toBeGreaterThan(0)
    expect(agentMap.has('abaporu')).toBe(true)
  })
})

describe('useAgent hook', () => {
  it('returns default agent for null', () => {
    const { result } = renderHook(() => useAgent(null))
    expect(result.current.id).toBe('abaporu')
  })

  it('returns default agent for undefined', () => {
    const { result } = renderHook(() => useAgent(undefined))
    expect(result.current.id).toBe('abaporu')
  })

  it('returns agent by ID', () => {
    const { result } = renderHook(() => useAgent('zumbi'))
    expect(result.current.id).toBe('zumbi')
  })

  it('returns default agent for invalid ID', () => {
    const { result } = renderHook(() => useAgent('invalid'))
    expect(result.current.id).toBe('abaporu')
  })

  it('memoizes result', () => {
    const { result, rerender } = renderHook(({ id }) => useAgent(id), {
      initialProps: { id: 'zumbi' },
    })
    const firstResult = result.current

    rerender({ id: 'zumbi' })
    expect(result.current).toBe(firstResult)
  })

  it('updates when ID changes', () => {
    const { result, rerender } = renderHook(({ id }) => useAgent(id), {
      initialProps: { id: 'zumbi' as string | null },
    })
    expect(result.current.id).toBe('zumbi')

    rerender({ id: 'anita' })
    expect(result.current.id).toBe('anita')
  })
})

describe('useAgentOrNull hook', () => {
  it('returns null for null input', () => {
    const { result } = renderHook(() => useAgentOrNull(null))
    expect(result.current).toBeNull()
  })

  it('returns null for undefined input', () => {
    const { result } = renderHook(() => useAgentOrNull(undefined))
    expect(result.current).toBeNull()
  })

  it('returns agent for valid ID', () => {
    const { result } = renderHook(() => useAgentOrNull('tiradentes'))
    expect(result.current?.id).toBe('tiradentes')
  })

  it('returns null for invalid ID', () => {
    const { result } = renderHook(() => useAgentOrNull('invalid'))
    expect(result.current).toBeNull()
  })
})

describe('useAgents hook', () => {
  it('returns empty array for empty input', () => {
    const { result } = renderHook(() => useAgents([]))
    expect(result.current).toHaveLength(0)
  })

  it('returns agents for valid IDs', () => {
    const { result } = renderHook(() => useAgents(['zumbi', 'anita']))
    expect(result.current).toHaveLength(2)
    expect(result.current[0].id).toBe('zumbi')
    expect(result.current[1].id).toBe('anita')
  })

  it('returns default agent for invalid IDs', () => {
    const { result } = renderHook(() => useAgents(['invalid', 'zumbi']))
    expect(result.current).toHaveLength(2)
    expect(result.current[0].id).toBe('abaporu') // default
    expect(result.current[1].id).toBe('zumbi')
  })

  it('handles null values', () => {
    const { result } = renderHook(() => useAgents([null, 'zumbi', undefined]))
    expect(result.current).toHaveLength(3)
    expect(result.current[0].id).toBe('abaporu') // default for null
    expect(result.current[1].id).toBe('zumbi')
    expect(result.current[2].id).toBe('abaporu') // default for undefined
  })

  it('memoizes result', () => {
    const ids = ['zumbi', 'anita']
    const { result, rerender } = renderHook(({ ids }) => useAgents(ids), { initialProps: { ids } })
    const firstResult = result.current

    rerender({ ids: ['zumbi', 'anita'] })
    expect(result.current).toBe(firstResult)
  })
})
