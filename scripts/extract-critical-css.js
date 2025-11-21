#!/usr/bin/env node

/**
 * Critical CSS Extraction Script
 *
 * Extracts critical CSS for above-the-fold content
 * to inline in HTML for faster initial render
 */

const critical = require('critical')
const path = require('path')
const fs = require('fs').promises

const PAGES = [
  { url: 'http://localhost:3000/pt', output: 'critical-pt.css' },
  { url: 'http://localhost:3000/pt/login', output: 'critical-login.css' },
  { url: 'http://localhost:3000/pt/app/dashboard', output: 'critical-dashboard.css' },
  { url: 'http://localhost:3000/pt/app/chat', output: 'critical-chat.css' },
]

const OUTPUT_DIR = path.join(__dirname, '../public/css')

async function extractCriticalCSS() {
  console.log('🎨 Critical CSS Extraction')
  console.log('=========================')

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  for (const page of PAGES) {
    console.log(`\nExtracting critical CSS for: ${page.url}`)

    try {
      const result = await critical.generate({
        src: page.url,
        dimensions: [
          {
            width: 375,
            height: 812, // iPhone X
          },
          {
            width: 1440,
            height: 900, // Desktop
          },
        ],
        inline: false,
        extract: true,
        penthouse: {
          timeout: 30000,
        },
      })

      // Save critical CSS
      const outputPath = path.join(OUTPUT_DIR, page.output)
      await fs.writeFile(outputPath, result.css)

      const stats = await fs.stat(outputPath)
      const sizeKB = (stats.size / 1024).toFixed(2)

      console.log(`✅ Saved to ${page.output} (${sizeKB} KB)`)
    } catch (error) {
      console.error(`❌ Error extracting ${page.url}:`, error.message)
    }
  }

  // Create a combined critical CSS file
  console.log('\n📦 Creating combined critical CSS...')

  let combinedCSS = '/* Combined Critical CSS */\n'
  for (const page of PAGES) {
    try {
      const css = await fs.readFile(path.join(OUTPUT_DIR, page.output), 'utf-8')
      combinedCSS += `\n/* ${page.output} */\n${css}\n`
    } catch (error) {
      // Skip if file doesn't exist
    }
  }

  // Deduplicate CSS rules
  const rules = new Set()
  const cssLines = combinedCSS.split('\n')
  const deduplicatedCSS = cssLines
    .filter((line) => {
      if (line.trim() === '' || line.startsWith('/*')) return true
      if (rules.has(line)) return false
      rules.add(line)
      return true
    })
    .join('\n')

  await fs.writeFile(path.join(OUTPUT_DIR, 'critical-combined.css'), deduplicatedCSS)

  const stats = await fs.stat(path.join(OUTPUT_DIR, 'critical-combined.css'))
  const sizeKB = (stats.size / 1024).toFixed(2)

  console.log(`✅ Combined critical CSS: ${sizeKB} KB`)
  console.log('\n✨ Critical CSS extraction complete!')
}

// Check if critical is installed
try {
  require.resolve('critical')
} catch (error) {
  console.log('📦 Installing critical...')
  const { execSync } = require('child_process')
  execSync('npm install --save-dev critical', { stdio: 'inherit' })
}

// Run extraction
extractCriticalCSS().catch(console.error)
