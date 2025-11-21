#!/usr/bin/env node

/**
 * Script to optimize lucide-react imports from barrel imports to direct imports
 * This reduces bundle size significantly
 *
 * Before: import { Home, User, Settings } from 'lucide-react'
 * After:  import Home from 'lucide-react/dist/esm/icons/home'
 *         import User from 'lucide-react/dist/esm/icons/user'
 *         import Settings from 'lucide-react/dist/esm/icons/settings'
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Convert icon name to kebab-case for file path
function toKebabCase(str) {
  // Handle special cases
  const specialCases = {
    X: 'x',
    LogOut: 'log-out',
    UserIcon: 'user',
    ChevronRight: 'chevron-right',
    ChevronLeft: 'chevron-left',
    ChevronDown: 'chevron-down',
    RefreshCw: 'refresh-cw',
    RefreshCcw: 'refresh-ccw',
    AlertCircle: 'alert-circle',
    AlertTriangle: 'alert-triangle',
    CheckCircle: 'check-circle',
    XCircle: 'x-circle',
    TrendingUp: 'trending-up',
    TrendingDown: 'trending-down',
    MessageSquare: 'message-square',
    FileSearch: 'file-search',
    LayoutDashboard: 'layout-dashboard',
    MicOff: 'mic-off',
    Loader2: 'loader-2',
    VolumeX: 'volume-x',
    Volume2: 'volume-2',
    GraduationCap: 'graduation-cap',
    BarChart3: 'bar-chart-3',
    ThumbsUp: 'thumbs-up',
    ThumbsDown: 'thumbs-down',
    Share2: 'share-2',
    Trash2: 'trash-2',
    WifiOff: 'wifi-off',
    ImageOff: 'image-off',
    EyeOff: 'eye-off',
    MoreVertical: 'more-vertical',
    CheckCheck: 'check-check',
    Maximize2: 'maximize-2',
    QrCodeIcon: 'qr-code',
    PlayCircle: 'play-circle',
    ArrowRight: 'arrow-right',
    LogIn: 'log-in',
    LucideIcon: null, // special type, should not be converted
    'type LucideIcon': null, // special type import
  }

  if (specialCases[str] !== undefined) {
    return specialCases[str]
  }

  // Convert PascalCase to kebab-case
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function optimizeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Pattern to match lucide-react imports
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g
  const typeImportRegex =
    /import\s+(?:type\s+)?{\s*type\s+LucideIcon[^}]*}\s+from\s+['"]lucide-react['"]/g

  // First, handle type imports separately (keep them as is)
  const typeImports = content.match(typeImportRegex)

  // Process regular imports
  content = content.replace(importRegex, (match, icons) => {
    // Check if this is a type-only import
    if (match.includes('type LucideIcon')) {
      return match // Keep as is
    }

    const iconList = icons
      .split(',')
      .map((icon) => icon.trim())
      .filter((icon) => icon && icon !== 'type LucideIcon' && !icon.startsWith('type '))

    // Handle mixed imports (both type and regular)
    const hasTypeImport = icons.includes('type LucideIcon')

    if (iconList.length === 0 && hasTypeImport) {
      return match // Keep type-only imports as is
    }

    const directImports = []

    // Create direct imports for each icon
    for (const icon of iconList) {
      const cleanIcon = icon.replace(/\s+as\s+\w+/, '') // Remove 'as' aliases
      const alias = icon.includes(' as ') ? icon.split(' as ')[1].trim() : null
      const iconName = alias || cleanIcon
      const kebabName = toKebabCase(cleanIcon)

      if (kebabName === null) {
        continue // Skip type imports
      }

      if (alias) {
        directImports.push(`import ${iconName} from 'lucide-react/dist/esm/icons/${kebabName}'`)
      } else {
        directImports.push(`import ${iconName} from 'lucide-react/dist/esm/icons/${kebabName}'`)
      }
    }

    modified = true

    // If we had a mixed import with LucideIcon type, keep the type import separate
    if (hasTypeImport) {
      directImports.unshift(`import { type LucideIcon } from 'lucide-react'`)
    }

    return directImports.join('\n')
  })

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✅ Optimized: ${path.relative(process.cwd(), filePath)}`)
    return true
  }

  return false
}

function main() {
  console.log('🔍 Searching for files with lucide-react imports...\n')

  const patterns = ['components/**/*.{tsx,ts}', 'app/**/*.{tsx,ts}', 'lib/**/*.{tsx,ts}']

  let totalFiles = 0
  let optimizedFiles = 0

  patterns.forEach((pattern) => {
    const files = glob.sync(pattern, {
      ignore: ['**/node_modules/**', '**/*.test.{tsx,ts}', '**/*.spec.{tsx,ts}', '**/stories/**'],
    })

    files.forEach((file) => {
      totalFiles++
      if (optimizeFile(file)) {
        optimizedFiles++
      }
    })
  })

  console.log(`\n📊 Results:`)
  console.log(`   Total files scanned: ${totalFiles}`)
  console.log(`   Files optimized: ${optimizedFiles}`)
  console.log(`\n✨ Optimization complete!`)
  console.log(`\n💡 Next steps:`)
  console.log(`   1. Run 'npm run type-check' to verify types`)
  console.log(`   2. Run 'npm run build' to check build`)
  console.log(`   3. Check bundle size reduction with 'npm run analyze'`)
}

// Run the script
main()
