#!/usr/bin/env node

/**
 * Generate blur placeholders for images
 *
 * This script generates base64-encoded blur placeholders for images
 * to improve perceived performance and prevent layout shifts.
 *
 * Usage:
 *   node scripts/generation/generate-blur-placeholders.js
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-11-11
 */

const fs = require('fs')
const path = require('path')
const { getPlaiceholder } = require('plaiceholder')

const IMAGE_DIR = path.join(__dirname, '../../public')
const OUTPUT_FILE = path.join(__dirname, '../../lib/blur-data.ts')

// Images to generate placeholders for
const IMAGES_TO_PROCESS = [
  'operarios.png',
  'images/Tarsila_Antropofagia.jpg',
  // Add more images as needed
]

async function generateBlurPlaceholders() {
  console.log('🖼️  Generating blur placeholders...\n')

  const blurData = {}

  for (const imagePath of IMAGES_TO_PROCESS) {
    const fullPath = path.join(IMAGE_DIR, imagePath)

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Image not found: ${imagePath}`)
      continue
    }

    try {
      const file = fs.readFileSync(fullPath)
      const { base64 } = await getPlaiceholder(file)

      blurData[imagePath] = base64
      console.log(`✅ Generated placeholder for: ${imagePath}`)
    } catch (error) {
      console.error(`❌ Error processing ${imagePath}:`, error.message)
    }
  }

  // Generate TypeScript file
  const tsContent = `/**
 * Auto-generated blur placeholders for images
 * Generated: ${new Date().toISOString()}
 *
 * DO NOT EDIT MANUALLY
 * Run: node scripts/generation/generate-blur-placeholders.js
 */

export const blurDataUrls: Record<string, string> = ${JSON.stringify(blurData, null, 2)}
`

  fs.writeFileSync(OUTPUT_FILE, tsContent)
  console.log(`\n✅ Blur data saved to: ${OUTPUT_FILE}`)
  console.log(`📊 Generated ${Object.keys(blurData).length} placeholders\n`)
}

// Check if plaiceholder is installed
try {
  require.resolve('plaiceholder')
} catch (e) {
  console.error('❌ Error: plaiceholder is not installed')
  console.log('\n📦 Install it with: npm install --save-dev plaiceholder sharp')
  process.exit(1)
}

generateBlurPlaceholders().catch(console.error)
