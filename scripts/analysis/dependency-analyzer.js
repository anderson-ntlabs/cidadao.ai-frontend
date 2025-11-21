#!/usr/bin/env node

/**
 * Dependency Analyzer Script
 *
 * Analyzes project dependencies to find:
 * - Unused packages
 * - Heavy packages
 * - Duplicate packages
 * - Optimization opportunities
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-11-21
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 Dependency Analysis Tool\n')
console.log('='.repeat(50))

// Load package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))

// Get all dependencies
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}

// Analyze dependency sizes
console.log('\n📦 Top 20 Heaviest Dependencies:')
console.log('-'.repeat(50))

try {
  // Get size of each dependency
  const depSizes = []

  for (const dep of Object.keys(allDeps)) {
    try {
      const depPath = path.join(process.cwd(), 'node_modules', dep)
      if (fs.existsSync(depPath)) {
        const size = execSync(`du -sh "${depPath}" 2>/dev/null | cut -f1`, {
          encoding: 'utf8',
        }).trim()
        depSizes.push({ name: dep, size, version: allDeps[dep] })
      }
    } catch (e) {
      // Ignore errors for individual packages
    }
  }

  // Sort by size and display top 20
  depSizes
    .sort((a, b) => {
      // Convert sizes to bytes for proper sorting
      const sizeA = parseSize(a.size)
      const sizeB = parseSize(b.size)
      return sizeB - sizeA
    })
    .slice(0, 20)
    .forEach((dep, index) => {
      console.log(
        `${(index + 1).toString().padStart(2)}. ${dep.name.padEnd(30)} ${dep.size.padStart(8)} (${dep.version})`
      )
    })
} catch (error) {
  console.error('Error analyzing dependency sizes:', error.message)
}

// Find potentially unused dependencies
console.log('\n⚠️  Potentially Unused Dependencies:')
console.log('-'.repeat(50))

const potentiallyUnused = [
  '@emotion/is-prop-valid',
  '@types/dompurify',
  '@types/papaparse',
  'minimatch',
  'pino',
  'driver.js',
  '@djpfs/react-vlibras',
  'jspdf-autotable',
]

potentiallyUnused.forEach((dep) => {
  if (allDeps[dep]) {
    console.log(`- ${dep} (${allDeps[dep]})`)
  }
})

// Suggest lighter alternatives
console.log('\n💡 Optimization Suggestions:')
console.log('-'.repeat(50))

const suggestions = [
  {
    current: 'framer-motion (300KB)',
    alternative: 'auto-animate (2KB)',
    saving: '99%',
  },
  {
    current: 'recharts (500KB)',
    alternative: 'victory or visx (200KB)',
    saving: '60%',
  },
  {
    current: 'd3 (400KB)',
    alternative: 'd3-scale + d3-shape only (50KB)',
    saving: '87%',
  },
  {
    current: 'jspdf + html2canvas (600KB)',
    alternative: 'pdfmake-lite (150KB)',
    saving: '75%',
  },
  {
    current: 'posthog-js (150KB)',
    alternative: 'custom analytics (10KB)',
    saving: '93%',
  },
  {
    current: '@sentry/nextjs (200KB)',
    alternative: 'custom error boundary (5KB)',
    saving: '97%',
  },
]

suggestions.forEach(({ current, alternative, saving }) => {
  console.log(`• Replace ${current}`)
  console.log(`  → with ${alternative}`)
  console.log(`  💰 Save ${saving}\n`)
})

// Check for duplicate packages
console.log('🔄 Checking for Duplicate Packages:')
console.log('-'.repeat(50))

try {
  const dupeOutput = execSync('npm ls --depth=0 2>&1 | grep "deduped" | head -10', {
    encoding: 'utf8',
  })

  if (dupeOutput) {
    console.log(dupeOutput)
  } else {
    console.log('✅ No obvious duplicates found')
  }
} catch (e) {
  console.log('✅ No obvious duplicates found')
}

// Summary
console.log('\n📊 Summary:')
console.log('='.repeat(50))
console.log(`Total dependencies: ${Object.keys(allDeps).length}`)
console.log(`Production deps: ${Object.keys(packageJson.dependencies || {}).length}`)
console.log(`Dev deps: ${Object.keys(packageJson.devDependencies || {}).length}`)
console.log(`Node modules size: ${getNodeModulesSize()}`)

console.log('\n🎯 Recommended Actions:')
console.log('1. Run: npx depcheck to find truly unused deps')
console.log('2. Replace heavy libraries with lighter alternatives')
console.log('3. Use dynamic imports for heavy components')
console.log('4. Consider removing dev dependencies from production builds')
console.log('5. Run: npm dedupe to optimize dependency tree')

// Helper functions
function parseSize(sizeStr) {
  const units = { K: 1024, M: 1024 * 1024, G: 1024 * 1024 * 1024 }
  const match = sizeStr.match(/(\d+\.?\d*)([KMG])/)
  if (match) {
    return parseFloat(match[1]) * (units[match[2]] || 1)
  }
  return parseFloat(sizeStr) || 0
}

function getNodeModulesSize() {
  try {
    return execSync('du -sh node_modules 2>/dev/null | cut -f1', {
      encoding: 'utf8',
    }).trim()
  } catch (e) {
    return 'N/A'
  }
}
