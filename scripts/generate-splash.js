const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const splashScreens = [
  // iPhone 14 Pro Max, 15 Pro Max
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796.png' },
  // iPhone 14 Pro, 15 Pro
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556.png' },
  // iPhone 14 Plus, 13 Pro Max, 12 Pro Max
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778.png' },
  // iPhone 14, 13, 13 Pro, 12, 12 Pro
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' },
  // iPhone 13 mini, 12 mini
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' },
  // iPhone SE 3rd gen
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },
  // iPad Pro 12.9"
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' },
  // iPad Pro 11"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' },
  // iPad 10.9"
  { width: 1640, height: 2360, name: 'apple-splash-1640-2360.png' },
  // iPad Mini
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' },
];

async function generateSplashScreens() {
  const outputDir = path.join(__dirname, '..', 'public', 'splash');
  await fs.mkdir(outputDir, { recursive: true });

  for (const splash of splashScreens) {
    const svg = `
      <svg width="${splash.width}" height="${splash.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${splash.width}" height="${splash.height}" fill="#10b981"/>
        <g transform="translate(${splash.width/2}, ${splash.height/2})">
          <circle r="120" fill="none" stroke="#fff" stroke-width="16"/>
          <path d="M-80,0 A80,80 0 0,1 80,0" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
          <circle cx="-40" cy="-27" r="10" fill="#fff"/>
          <circle cx="40" cy="-27" r="10" fill="#fff"/>
          <text y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#fff">AI</text>
        </g>
        <text x="${splash.width/2}" y="${splash.height - 100}" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="500" fill="#fff">Cidadão.AI</text>
      </svg>
    `;

    const outputPath = path.join(outputDir, splash.name);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
      
    console.log(`Generated ${splash.name}`);
  }

  // Create the splash meta tags to add to the layout
  const metaTags = splashScreens.map(splash => 
    `<link rel="apple-touch-startup-image" media="(device-width: ${splash.width/2}px) and (device-height: ${splash.height/2}px) and (-webkit-device-pixel-ratio: 2)" href="/splash/${splash.name}" />`
  ).join('\n');
  
  console.log('\nAdd these meta tags to your layout.tsx:\n');
  console.log(metaTags);
}

generateSplashScreens().catch(console.error);