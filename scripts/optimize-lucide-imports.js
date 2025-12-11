#!/usr/bin/env node
/**
 * Lucide React Import Optimizer
 *
 * Analyzes lucide-react usage in the project.
 * The actual optimization is done via next.config.js modularizeImports.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-11
 */

const { execSync } = require('child_process')

// Get all files with lucide-react imports
const files = execSync(
  "grep -rl \"from 'lucide-react'\" --include='*.tsx' --include='*.ts' . 2>/dev/null || true",
  { encoding: 'utf-8', cwd: process.cwd() }
)
  .trim()
  .split('\n')
  .filter(Boolean)

console.log(`Found ${files.length} files with lucide-react imports`)

// Count unique icons
const icons = execSync(
  "grep -rhoP \"import \\{[^}]+\\} from ['\"]lucide-react['\"]\" --include='*.tsx' --include='*.ts' . 2>/dev/null | sed 's/import {//g; s/} from.*//g' | tr ',' '\\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sort -u | grep -v '^$'",
  { encoding: 'utf-8', cwd: process.cwd() }
)
  .trim()
  .split('\n')
  .filter(Boolean)

console.log(`Found ${icons.length} unique icons used`)
console.log('\nIcons:', icons.join(', '))
