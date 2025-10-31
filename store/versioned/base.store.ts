/**
 * Versioned Store Base
 * Provides migration and versioning for Zustand stores
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { StateCreator } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { z } from 'zod'

export interface StoreVersion {
  version: number
  migrate: (state: any, fromVersion: number) => any
}

export interface VersionedStoreOptions<T> {
  name: string
  version: number
  schema: z.ZodType<T>
  migrations: Record<number, (state: any) => any>
  debug?: boolean
}

/**
 * Creates a versioned store with automatic migrations
 */
export function createVersionedStore<T>(
  creator: StateCreator<T>,
  options: VersionedStoreOptions<T>
) {
  const { name, version, schema, migrations, debug = false } = options

  return persist(
    devtools(creator, {
      name: `${name}-store`,
      enabled: process.env.NODE_ENV === 'development'
    }),
    {
      name: `${name}-storage`,
      version,

      // Migration function
      migrate: (persistedState: any, persistedVersion: number) => {
        if (debug) {
          console.log(`[${name}] Migrating from v${persistedVersion} to v${version}`)
        }

        let state = persistedState

        // Apply migrations sequentially
        for (let v = persistedVersion + 1; v <= version; v++) {
          const migration = migrations[v]
          if (migration) {
            if (debug) {
              console.log(`[${name}] Applying migration v${v}`)
            }
            state = migration(state)
          }
        }

        // Validate final state
        try {
          const validated = schema.parse(state)
          if (debug) {
            console.log(`[${name}] Migration successful, state validated`)
          }
          return validated
        } catch (error) {
          console.error(`[${name}] State validation failed after migration:`, error)
          // Return fresh state if validation fails
          return creator(undefined as any, undefined as any, undefined as any)
        }
      },

      // Storage options
      partialize: (state) => {
        // Remove non-serializable data before persisting
        const { ...serializable } = state as any

        // Remove functions and undefined values
        Object.keys(serializable).forEach(key => {
          if (typeof serializable[key] === 'function' ||
              serializable[key] === undefined) {
            delete serializable[key]
          }
        })

        return serializable
      },

      // Merge strategy
      merge: (persistedState, currentState) => {
        // Deep merge for nested objects
        return {
          ...currentState,
          ...persistedState,
        }
      }
    }
  )
}

/**
 * Example migrations for reference
 */
export const exampleMigrations = {
  // Version 1 to 2: Add new field
  2: (state: any) => ({
    ...state,
    newField: 'default value'
  }),

  // Version 2 to 3: Rename field
  3: (state: any) => {
    const { oldFieldName, ...rest } = state
    return {
      ...rest,
      newFieldName: oldFieldName || 'default'
    }
  },

  // Version 3 to 4: Transform data structure
  4: (state: any) => ({
    ...state,
    settings: {
      theme: state.theme || 'light',
      language: state.language || 'pt'
    }
  })
}