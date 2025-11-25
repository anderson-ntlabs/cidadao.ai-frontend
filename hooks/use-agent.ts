/**
 * Agent Lookup Hook
 *
 * Provides memoized O(1) lookups for agents by ID
 * Avoids repeated array.find() operations in render loops
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

import { useMemo } from 'react'
import { agents } from '@/data/agents'
import type { Agent } from '@/types/agent'

// Pre-computed Map for O(1) lookups (module-level singleton)
const agentMap = new Map<string, Agent>(agents.map((agent) => [agent.id, agent]))

// Default agent (Abaporu - the orchestrator)
const defaultAgent = agents[0]

/**
 * Get agent by ID with O(1) lookup
 * Falls back to default agent (Abaporu) if not found
 */
export function getAgentById(agentId: string | null | undefined): Agent {
  if (!agentId) return defaultAgent
  return agentMap.get(agentId) || defaultAgent
}

/**
 * Get agent by ID, returns undefined if not found
 */
export function getAgentByIdOrNull(agentId: string | null | undefined): Agent | undefined {
  if (!agentId) return undefined
  return agentMap.get(agentId)
}

/**
 * Check if agent ID exists
 */
export function isValidAgentId(agentId: string | null | undefined): boolean {
  if (!agentId) return false
  return agentMap.has(agentId)
}

/**
 * Hook to get memoized agent by ID
 * Use this in components that need to look up agents frequently
 *
 * @example
 * const agent = useAgent('zumbi')
 * // agent is memoized and won't change unless agentId changes
 */
export function useAgent(agentId: string | null | undefined): Agent {
  return useMemo(() => getAgentById(agentId), [agentId])
}

/**
 * Hook to get memoized agent, returns null if not found
 */
export function useAgentOrNull(agentId: string | null | undefined): Agent | null {
  return useMemo(() => getAgentByIdOrNull(agentId) ?? null, [agentId])
}

/**
 * Hook to get multiple agents by IDs
 * Useful for lists of messages with different agents
 */
export function useAgents(agentIds: (string | null | undefined)[]): Agent[] {
  return useMemo(
    () => agentIds.map((id) => getAgentById(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agentIds.join(',')]
  )
}

/**
 * Get all agents (same as importing from data/agents)
 */
export function getAllAgents(): Agent[] {
  return agents
}

/**
 * Export the agent map for direct access if needed
 */
export { agentMap, defaultAgent }
