#!/usr/bin/env node

/**
 * Generate Favicon for Cidadão.AI
 *
 * Creates a minimalist Abaporu-inspired favicon using the project's
 * color palette (Tarsila's colors: yellow, green, blue).
 *
 * Generates:
 * - favicon.ico (multi-size ICO)
 * - favicon-16x16.png
 * - favicon-32x32.png
 * - apple-touch-icon.png (180x180)
 * - android-chrome-192x192.png
 * - android-chrome-512x512.png
 *
 * Usage: node scripts/generation/generate-favicon.js
 */

const fs = require('fs')
const path = require('path')

// SVG template for Abaporu-inspired minimalist favicon
// Stylized silhouette with Tarsila's characteristic colors
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16a34a"/>
      <stop offset="100%" style="stop-color:#15803d"/>
    </linearGradient>
    <linearGradient id="sun" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24"/>
      <stop offset="100%" style="stop-color:#f59e0b"/>
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)"/>

  <!-- Sun (Tarsila's iconic sun) -->
  <circle cx="380" cy="130" r="60" fill="url(#sun)"/>

  <!-- Abaporu silhouette - minimalist interpretation -->
  <!-- Large foot (characteristic of Abaporu) -->
  <ellipse cx="200" cy="400" rx="120" ry="50" fill="#1e3a5f"/>

  <!-- Body -->
  <ellipse cx="280" cy="280" rx="60" ry="100" fill="#1e3a5f"/>

  <!-- Head (small, as in original) -->
  <circle cx="320" cy="160" r="35" fill="#1e3a5f"/>

  <!-- Arm -->
  <ellipse cx="200" cy="250" rx="80" ry="25" fill="#1e3a5f" transform="rotate(-20 200 250)"/>

  <!-- Cactus hint -->
  <rect x="420" y="280" width="20" height="120" rx="10" fill="#22c55e"/>
  <rect x="400" y="320" width="15" height="40" rx="7" fill="#22c55e" transform="rotate(-30 400 320)"/>
</svg>`

// Alternative simpler version
const faviconSVGSimple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16a34a"/>
      <stop offset="100%" style="stop-color:#15803d"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>

  <!-- Stylized "C" from Cidadão with Abaporu influence -->
  <!-- The C has an organic, flowing shape like Abaporu's curves -->
  <path d="M 340 150
           C 200 150, 120 220, 120 300
           C 120 380, 200 450, 340 450
           L 340 380
           C 240 380, 190 350, 190 300
           C 190 250, 240 220, 340 220
           Z"
        fill="#fbbf24"/>

  <!-- Small sun accent -->
  <circle cx="380" cy="120" r="40" fill="#fbbf24" opacity="0.6"/>

  <!-- Dot representing AI/tech -->
  <circle cx="400" cy="300" r="30" fill="#fbbf24"/>
</svg>`

// Most minimal version - just the essence
const faviconSVGMinimal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16a34a"/>
      <stop offset="100%" style="stop-color:#15803d"/>
    </linearGradient>
  </defs>

  <!-- Rounded square background -->
  <rect width="512" height="512" rx="108" fill="url(#grad)"/>

  <!-- Abstract Abaporu - large foot shape with small head -->
  <!-- This captures the essence: disproportion between body parts -->
  <g fill="#fbbf24">
    <!-- Large organic foot/base shape -->
    <ellipse cx="256" cy="360" rx="160" ry="80"/>

    <!-- Small head -->
    <circle cx="300" cy="160" r="50"/>

    <!-- Connecting body -->
    <path d="M 270 200 Q 230 280 180 340 L 330 340 Q 340 280 320 200 Z"/>
  </g>

  <!-- Sun -->
  <circle cx="420" cy="100" r="45" fill="#fbbf24" opacity="0.7"/>
</svg>`

const publicDir = path.join(__dirname, '../../public')

// Save SVG
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVGMinimal)

console.log('SVG favicon created: public/favicon.svg')
console.log('')
console.log('To generate PNG versions, run:')
console.log('')
console.log('# Install sharp if not already installed')
console.log('npm install sharp --save-dev')
console.log('')
console.log('# Or use ImageMagick:')
console.log('convert -background none public/favicon.svg -resize 32x32 public/favicon-32x32.png')
console.log('convert -background none public/favicon.svg -resize 16x16 public/favicon-16x16.png')
console.log(
  'convert -background none public/favicon.svg -resize 180x180 public/apple-touch-icon.png'
)
console.log(
  'convert -background none public/favicon.svg -resize 192x192 public/android-chrome-192x192.png'
)
console.log(
  'convert -background none public/favicon.svg -resize 512x512 public/android-chrome-512x512.png'
)
console.log('')
console.log('# Create ICO file:')
console.log('convert public/favicon-32x32.png public/favicon-16x16.png public/favicon.ico')
