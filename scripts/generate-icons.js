const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const inputSvg = path.join(__dirname, '..', 'public', 'icon.svg');
  const outputDir = path.join(__dirname, '..', 'public', 'icons');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Generate PNG icons for each size
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
      
    console.log(`Generated ${outputPath}`);
  }

  // Generate favicon
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
    
  console.log('Generated favicon.ico');
  
  // Generate apple-touch-icon
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'));
    
  console.log('Generated apple-touch-icon.png');
}

generateIcons().catch(console.error);