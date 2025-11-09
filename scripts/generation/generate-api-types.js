#!/usr/bin/env node

/**
 * Generate TypeScript types from Backend OpenAPI Schema
 *
 * Autor: Anderson Henrique da Silva
 * Data: 2025-01-25
 *
 * Fetches OpenAPI schema from backend and generates TypeScript types
 * using openapi-typescript.
 *
 * Usage:
 *   npm run generate:types
 *   # or
 *   node scripts/generate-api-types.js
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'
const OPENAPI_ENDPOINT = '/openapi.json'
const OUTPUT_FILE = path.join(__dirname, '../types/generated/backend-api.ts')
const SCHEMA_CACHE = path.join(__dirname, '../.cache/openapi-schema.json')

console.log('🔧 API Type Generation\n')
console.log('━'.repeat(50))
console.log(`Backend URL: ${BACKEND_URL}`)
console.log(`OpenAPI Endpoint: ${OPENAPI_ENDPOINT}`)
console.log(`Output: ${OUTPUT_FILE}`)
console.log('━'.repeat(50) + '\n')

/**
 * Fetch OpenAPI schema from backend
 */
async function fetchOpenAPISchema() {
  console.log('📡 Fetching OpenAPI schema from backend...')

  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}${OPENAPI_ENDPOINT}`

    https
      .get(
        url,
        {
          headers: {
            Accept: 'application/json',
          },
          timeout: 10000,
        },
        (res) => {
          let data = ''

          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const schema = JSON.parse(data)
                console.log(`✅ Schema fetched successfully (${data.length} bytes)\n`)
                resolve(schema)
              } catch (error) {
                reject(new Error(`Failed to parse JSON: ${error.message}`))
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusText}`))
            }
          })
        }
      )
      .on('error', (error) => {
        reject(error)
      })
      .on('timeout', () => {
        reject(new Error('Request timeout'))
      })
  })
}

/**
 * Cache schema locally for offline development
 */
function cacheSchema(schema) {
  const cacheDir = path.dirname(SCHEMA_CACHE)
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  fs.writeFileSync(SCHEMA_CACHE, JSON.stringify(schema, null, 2))
  console.log(`💾 Schema cached to ${SCHEMA_CACHE}\n`)
}

/**
 * Load cached schema if available
 */
function loadCachedSchema() {
  if (fs.existsSync(SCHEMA_CACHE)) {
    console.log('📦 Using cached schema...\n')
    return JSON.parse(fs.readFileSync(SCHEMA_CACHE, 'utf-8'))
  }
  return null
}

/**
 * Generate TypeScript types from schema
 *
 * This is a basic implementation. For production, use openapi-typescript:
 * npm install -D openapi-typescript
 * npx openapi-typescript $BACKEND_URL/openapi.json -o types/generated/backend-api.ts
 */
function generateTypes(schema) {
  console.log('⚙️  Generating TypeScript types...\n')

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const typeDefinitions = []

  // Header
  typeDefinitions.push('/**')
  typeDefinitions.push(' * AUTO-GENERATED FILE - DO NOT EDIT')
  typeDefinitions.push(' *')
  typeDefinitions.push(' * Generated from: ' + BACKEND_URL + OPENAPI_ENDPOINT)
  typeDefinitions.push(' * Generated at: ' + new Date().toISOString())
  typeDefinitions.push(' *')
  typeDefinitions.push(' * To regenerate: npm run generate:types')
  typeDefinitions.push(' */')
  typeDefinitions.push('')

  // Extract schemas
  if (schema.components && schema.components.schemas) {
    const schemas = schema.components.schemas

    Object.entries(schemas).forEach(([name, definition]) => {
      const tsType = convertSchemaToType(name, definition)
      if (tsType) {
        typeDefinitions.push(tsType)
        typeDefinitions.push('')
      }
    })
  }

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, typeDefinitions.join('\n'))
  console.log(`✅ Types generated successfully!\n`)
  console.log(`📝 Output: ${OUTPUT_FILE}`)
  console.log(`📊 ${Object.keys(schema.components?.schemas || {}).length} types generated\n`)
}

/**
 * Convert OpenAPI schema to TypeScript type
 * Basic implementation - for production use openapi-typescript
 */
function convertSchemaToType(name, definition) {
  if (definition.type === 'object') {
    const props = definition.properties || {}
    const required = definition.required || []

    let typeStr = `export interface ${name} {\n`

    Object.entries(props).forEach(([propName, propDef]) => {
      const isRequired = required.includes(propName)
      const optional = isRequired ? '' : '?'
      const tsType = mapOpenAPITypeToTS(propDef)

      if (propDef.description) {
        typeStr += `  /** ${propDef.description} */\n`
      }

      typeStr += `  ${propName}${optional}: ${tsType};\n`
    })

    typeStr += '}'
    return typeStr
  }

  return null
}

/**
 * Map OpenAPI types to TypeScript types
 */
function mapOpenAPITypeToTS(propDef) {
  if (propDef.type === 'string') {
    return propDef.enum ? propDef.enum.map((e) => `'${e}'`).join(' | ') : 'string'
  }
  if (propDef.type === 'number' || propDef.type === 'integer') {
    return 'number'
  }
  if (propDef.type === 'boolean') {
    return 'boolean'
  }
  if (propDef.type === 'array') {
    const itemType = mapOpenAPITypeToTS(propDef.items || { type: 'any' })
    return `${itemType}[]`
  }
  if (propDef.type === 'object') {
    return 'Record<string, any>'
  }
  if (propDef.$ref) {
    // Extract type name from $ref
    const refParts = propDef.$ref.split('/')
    return refParts[refParts.length - 1]
  }
  return 'any'
}

/**
 * Main execution
 */
async function main() {
  try {
    let schema

    // Try to fetch from backend
    try {
      schema = await fetchOpenAPISchema()
      cacheSchema(schema)
    } catch (error) {
      console.warn(`⚠️  Failed to fetch from backend: ${error.message}`)
      console.warn('Trying cached schema...\n')

      schema = loadCachedSchema()

      if (!schema) {
        throw new Error('No cached schema available. Backend must be accessible for first run.')
      }
    }

    // Generate types
    generateTypes(schema)

    console.log('━'.repeat(50))
    console.log('✅ Type generation completed successfully!\n')
    console.log('📝 Next steps:')
    console.log('   1. Review generated types in types/generated/backend-api.ts')
    console.log('   2. Import types in your code:')
    console.log('      import type { ChatResponse } from "@/types/generated/backend-api"')
    console.log('   3. Add to git: git add types/generated/')
    console.log('   4. Commit changes\n')
    console.log('🔄 To update types after backend changes:')
    console.log('   npm run generate:types\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Type generation failed:', error.message)
    console.error('\n💡 Troubleshooting:')
    console.error('   - Check backend is accessible: curl ' + BACKEND_URL + '/health')
    console.error('   - Verify OpenAPI endpoint: curl ' + BACKEND_URL + OPENAPI_ENDPOINT)
    console.error('   - Check network connection')
    console.error('   - Try with cached schema: use --cached flag (future feature)\n')
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

module.exports = { fetchOpenAPISchema, generateTypes }
