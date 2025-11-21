#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Optimizes agent avatars and creates multiple formats (WebP, AVIF)
 * for better performance and smaller file sizes
 */

const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

const AGENTS_DIR = path.join(__dirname, '../public/agents')
const OPTIMIZED_DIR = path.join(__dirname, '../public/agents/optimized')

// Target sizes for responsive images
const SIZES = [
  { width: 64, suffix: '-64' }, // Small avatar
  { width: 128, suffix: '-128' }, // Medium avatar
  { width: 256, suffix: '-256' }, // Large avatar
  { width: 512, suffix: '-512' }, // Extra large (original quality)
]

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error)
  }
}

async function optimizeImage(imagePath) {
  const filename = path.basename(imagePath, path.extname(imagePath))
  const image = sharp(imagePath)
  const metadata = await image.metadata()

  console.log(`\nOptimizing ${filename}...`)
  console.log(`Original size: ${metadata.width}x${metadata.height}`)

  const results = []

  for (const size of SIZES) {
    // Skip if image is smaller than target size
    if (metadata.width < size.width) continue

    // WebP format (best browser support)
    const webpPath = path.join(OPTIMIZED_DIR, `${filename}${size.suffix}.webp`)
    await image
      .resize(size.width, size.width, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toFile(webpPath)

    const webpStats = await fs.stat(webpPath)
    results.push({
      format: 'webp',
      size: size.width,
      fileSize: (webpStats.size / 1024).toFixed(2) + ' KB',
    })

    // AVIF format (best compression, newer)
    const avifPath = path.join(OPTIMIZED_DIR, `${filename}${size.suffix}.avif`)
    await image
      .resize(size.width, size.width, {
        fit: 'cover',
        position: 'center',
      })
      .avif({ quality: 80 })
      .toFile(avifPath)

    const avifStats = await fs.stat(avifPath)
    results.push({
      format: 'avif',
      size: size.width,
      fileSize: (avifStats.size / 1024).toFixed(2) + ' KB',
    })

    // Optimized PNG (fallback)
    const pngPath = path.join(OPTIMIZED_DIR, `${filename}${size.suffix}.png`)
    await image
      .resize(size.width, size.width, {
        fit: 'cover',
        position: 'center',
      })
      .png({
        quality: 90,
        compressionLevel: 9,
        palette: true,
      })
      .toFile(pngPath)

    const pngStats = await fs.stat(pngPath)
    results.push({
      format: 'png',
      size: size.width,
      fileSize: (pngStats.size / 1024).toFixed(2) + ' KB',
    })
  }

  // Create blur placeholder (base64)
  const placeholderBuffer = await image
    .resize(20, 20, {
      fit: 'cover',
      position: 'center',
    })
    .blur(10)
    .toBuffer()

  const placeholder = `data:image/png;base64,${placeholderBuffer.toString('base64')}`

  // Save placeholder to JSON
  const placeholderPath = path.join(OPTIMIZED_DIR, `${filename}-placeholder.json`)
  await fs.writeFile(placeholderPath, JSON.stringify({ placeholder }, null, 2))

  return { filename, results, placeholder: placeholder.length }
}

async function main() {
  console.log('🖼️  Image Optimization Script')
  console.log('============================')

  // Ensure optimized directory exists
  await ensureDir(OPTIMIZED_DIR)

  // Get all PNG images
  const files = await fs.readdir(AGENTS_DIR)
  const images = files.filter((file) => file.endsWith('.png'))

  console.log(`Found ${images.length} images to optimize`)

  const summary = []

  for (const image of images) {
    const imagePath = path.join(AGENTS_DIR, image)
    try {
      const result = await optimizeImage(imagePath)
      summary.push(result)
    } catch (error) {
      console.error(`Error optimizing ${image}:`, error)
    }
  }

  // Generate summary report
  console.log('\n\n📊 Optimization Summary')
  console.log('=======================')

  for (const item of summary) {
    console.log(`\n${item.filename}:`)
    console.log(`  Placeholder: ${(item.placeholder / 1024).toFixed(2)} KB`)

    // Group by size
    const bySize = {}
    for (const result of item.results) {
      if (!bySize[result.size]) bySize[result.size] = {}
      bySize[result.size][result.format] = result.fileSize
    }

    for (const size of Object.keys(bySize).sort((a, b) => a - b)) {
      console.log(
        `  ${size}px: WebP ${bySize[size].webp}, AVIF ${bySize[size].avif}, PNG ${bySize[size].png}`
      )
    }
  }

  // Create image manifest
  const manifest = {
    generated: new Date().toISOString(),
    images: summary.reduce((acc, item) => {
      acc[item.filename] = {
        sizes: SIZES.map((s) => s.width),
        formats: ['avif', 'webp', 'png'],
        placeholder: `${item.filename}-placeholder.json`,
      }
      return acc
    }, {}),
  }

  const manifestPath = path.join(OPTIMIZED_DIR, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

  console.log('\n✅ Optimization complete!')
  console.log(`📁 Output directory: ${OPTIMIZED_DIR}`)
  console.log(`📋 Manifest saved to: ${manifestPath}`)
}

// Check if sharp is installed
try {
  require.resolve('sharp')
  main().catch(console.error)
} catch (error) {
  console.error('⚠️  Sharp is not installed!')
  console.log('Please run: npm install --save-dev sharp')
  process.exit(1)
}
