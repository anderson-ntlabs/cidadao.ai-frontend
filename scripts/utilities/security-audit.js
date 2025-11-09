#!/usr/bin/env node

/**
 * Security Audit Script
 *
 * Performs comprehensive security checks on the application
 */

const https = require('https')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function section(title) {
  console.log('\n' + '='.repeat(60))
  log(title, colors.bright + colors.cyan)
  console.log('='.repeat(60) + '\n')
}

function pass(message) {
  log(`✓ ${message}`, colors.green)
}

function fail(message) {
  log(`✗ ${message}`, colors.red)
}

function warn(message) {
  log(`⚠ ${message}`, colors.yellow)
}

function info(message) {
  log(`ℹ ${message}`, colors.blue)
}

// Security audit results
const results = {
  passed: [],
  failed: [],
  warnings: [],
}

/**
 * Check npm dependencies for vulnerabilities
 */
function checkDependencies() {
  section('1. Dependency Security Audit')

  try {
    info('Running npm audit...')
    const output = execSync('npm audit --json', { encoding: 'utf-8' })
    const audit = JSON.parse(output)

    const { vulnerabilities } = audit
    const counts = {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    }

    Object.values(vulnerabilities).forEach((vuln) => {
      if (vuln.severity) {
        counts[vuln.severity] = (counts[vuln.severity] || 0) + 1
      }
    })

    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    if (total === 0) {
      pass('No vulnerabilities found in dependencies')
      results.passed.push('No dependency vulnerabilities')
    } else {
      const summary = Object.entries(counts)
        .filter(([_, count]) => count > 0)
        .map(([severity, count]) => `${count} ${severity}`)
        .join(', ')

      if (counts.critical > 0 || counts.high > 0) {
        fail(`Found vulnerabilities: ${summary}`)
        results.failed.push(`Dependency vulnerabilities: ${summary}`)
      } else {
        warn(`Found vulnerabilities: ${summary}`)
        results.warnings.push(`Dependency vulnerabilities: ${summary}`)
      }

      info('Run "npm audit fix" to fix automatically fixable issues')
    }
  } catch (error) {
    warn('npm audit failed or returned errors')
    info('This may indicate vulnerabilities - review manually')
  }
}

/**
 * Check environment variables security
 */
function checkEnvironmentVariables() {
  section('2. Environment Variables Security')

  const envFiles = ['.env.local', '.env.production', '.env']
  let foundSecrets = false

  envFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file)

    if (fs.existsSync(filePath)) {
      info(`Checking ${file}...`)

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      // Check for exposed secrets
      const sensitivePatterns = [
        { name: 'API Key', pattern: /API_KEY=.+/i },
        { name: 'Secret', pattern: /SECRET=.+/i },
        { name: 'Password', pattern: /PASSWORD=.+/i },
        { name: 'Token', pattern: /TOKEN=.+/i },
        { name: 'Database URL', pattern: /DATABASE_URL=.+/i },
      ]

      lines.forEach((line, index) => {
        sensitivePatterns.forEach(({ name, pattern }) => {
          if (pattern.test(line) && !line.startsWith('#')) {
            warn(`Found ${name} in ${file}:${index + 1}`)
            foundSecrets = true
          }
        })
      })
    }
  })

  // Check if .env files are gitignored
  const gitignorePath = path.join(process.cwd(), '.gitignore')

  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8')

    if (gitignore.includes('.env.local') || gitignore.includes('.env*.local')) {
      pass('.env files are properly gitignored')
      results.passed.push('Environment files gitignored')
    } else {
      fail('.env.local is NOT in .gitignore')
      results.failed.push('Environment files not gitignored')
    }
  }

  if (foundSecrets) {
    warn('Sensitive environment variables found - ensure they are not committed')
    results.warnings.push('Sensitive environment variables detected')
  } else {
    pass('No exposed secrets in environment files')
    results.passed.push('No exposed secrets')
  }
}

/**
 * Check security headers configuration
 */
function checkSecurityHeaders() {
  section('3. Security Headers Configuration')

  const middlewarePath = path.join(process.cwd(), 'middleware.ts')

  if (!fs.existsSync(middlewarePath)) {
    fail('middleware.ts not found')
    results.failed.push('Missing middleware.ts')
    return
  }

  const middleware = fs.readFileSync(middlewarePath, 'utf-8')

  const requiredHeaders = [
    { name: 'Content-Security-Policy', check: 'Content-Security-Policy' },
    { name: 'X-Content-Type-Options', check: 'X-Content-Type-Options' },
    { name: 'X-Frame-Options', check: 'X-Frame-Options' },
    { name: 'Strict-Transport-Security', check: 'Strict-Transport-Security' },
    { name: 'Referrer-Policy', check: 'Referrer-Policy' },
  ]

  requiredHeaders.forEach(({ name, check }) => {
    if (middleware.includes(check)) {
      pass(`${name} header configured`)
      results.passed.push(`${name} configured`)
    } else {
      fail(`${name} header NOT configured`)
      results.failed.push(`${name} not configured`)
    }
  })
}

/**
 * Check rate limiting implementation
 */
function checkRateLimiting() {
  section('4. Rate Limiting')

  const rateLimitPath = path.join(process.cwd(), 'lib/security/rate-limit.ts')

  if (fs.existsSync(rateLimitPath)) {
    pass('Rate limiting module exists')
    results.passed.push('Rate limiting implemented')

    const content = fs.readFileSync(rateLimitPath, 'utf-8')

    if (content.includes('rateLimitConfigs')) {
      pass('Rate limit configurations defined')
      results.passed.push('Rate limit configs defined')
    } else {
      warn('Rate limit configurations may be missing')
      results.warnings.push('Rate limit configs unclear')
    }
  } else {
    fail('Rate limiting NOT implemented')
    results.failed.push('Rate limiting missing')
  }

  // Check if middleware uses rate limiting
  const middlewarePath = path.join(process.cwd(), 'middleware.ts')

  if (fs.existsSync(middlewarePath)) {
    const middleware = fs.readFileSync(middlewarePath, 'utf-8')

    if (middleware.includes('rateLimit')) {
      pass('Rate limiting integrated in middleware')
      results.passed.push('Rate limiting in middleware')
    } else {
      fail('Rate limiting NOT integrated in middleware')
      results.failed.push('Rate limiting not in middleware')
    }
  }
}

/**
 * Check input validation implementation
 */
function checkInputValidation() {
  section('5. Input Validation & Sanitization')

  const validationPath = path.join(process.cwd(), 'lib/security/input-validation.ts')

  if (fs.existsSync(validationPath)) {
    pass('Input validation module exists')
    results.passed.push('Input validation implemented')

    const content = fs.readFileSync(validationPath, 'utf-8')

    const validators = ['sanitizeHTML', 'isValidEmail', 'isValidURL', 'isValidCPF', 'isValidCNPJ']

    validators.forEach((validator) => {
      if (content.includes(validator)) {
        pass(`${validator} implemented`)
      } else {
        warn(`${validator} may be missing`)
      }
    })
  } else {
    fail('Input validation NOT implemented')
    results.failed.push('Input validation missing')
  }
}

/**
 * Check CSRF protection
 */
function checkCSRFProtection() {
  section('6. CSRF Protection')

  const csrfPath = path.join(process.cwd(), 'lib/security/csrf.ts')

  if (fs.existsSync(csrfPath)) {
    pass('CSRF protection module exists')
    results.passed.push('CSRF protection implemented')

    const content = fs.readFileSync(csrfPath, 'utf-8')

    if (content.includes('verifyCSRFToken')) {
      pass('CSRF verification function implemented')
      results.passed.push('CSRF verification implemented')
    } else {
      warn('CSRF verification may be incomplete')
      results.warnings.push('CSRF verification unclear')
    }
  } else {
    warn('CSRF protection NOT implemented')
    results.warnings.push('CSRF protection missing')
    info('CSRF protection is recommended for production')
  }
}

/**
 * Check CSP configuration
 */
function checkCSPConfiguration() {
  section('7. Content Security Policy')

  const cspPath = path.join(process.cwd(), 'lib/security/csp.config.ts')

  if (fs.existsSync(cspPath)) {
    pass('CSP configuration exists')
    results.passed.push('CSP configuration exists')

    const content = fs.readFileSync(cspPath, 'utf-8')

    const directives = [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'connect-src',
      'object-src',
      'frame-ancestors',
    ]

    directives.forEach((directive) => {
      if (content.includes(directive)) {
        pass(`${directive} directive configured`)
      } else {
        warn(`${directive} directive may be missing`)
      }
    })
  } else {
    fail('CSP configuration NOT found')
    results.failed.push('CSP configuration missing')
  }
}

/**
 * Check for common security issues in code
 */
function checkCodePatterns() {
  section('8. Code Security Patterns')

  info('Scanning for dangerous patterns...')

  const srcPath = path.join(process.cwd(), 'app')

  if (!fs.existsSync(srcPath)) {
    warn('app directory not found')
    return
  }

  let dangerousPatterns = 0

  // Recursively check files
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir)

    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath)
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf-8')

        // Check for dangerouslySetInnerHTML
        if (content.includes('dangerouslySetInnerHTML')) {
          warn(`dangerouslySetInnerHTML found in ${filePath}`)
          dangerousPatterns++
        }

        // Check for eval
        if (content.includes('eval(')) {
          warn(`eval() found in ${filePath}`)
          dangerousPatterns++
        }
      }
    })
  }

  scanDirectory(srcPath)

  if (dangerousPatterns === 0) {
    pass('No dangerous patterns found')
    results.passed.push('No dangerous code patterns')
  } else {
    warn(`Found ${dangerousPatterns} potentially dangerous patterns`)
    results.warnings.push(`${dangerousPatterns} dangerous patterns found`)
    info('Review these patterns for security implications')
  }
}

/**
 * Generate summary report
 */
function generateReport() {
  section('Security Audit Summary')

  log(`Total checks passed: ${results.passed.length}`, colors.green)
  log(`Total warnings: ${results.warnings.length}`, colors.yellow)
  log(`Total failures: ${results.failed.length}`, colors.red)

  if (results.failed.length > 0) {
    log('\nFailed Checks:', colors.red + colors.bright)
    results.failed.forEach((item) => fail(item))
  }

  if (results.warnings.length > 0) {
    log('\nWarnings:', colors.yellow + colors.bright)
    results.warnings.forEach((item) => warn(item))
  }

  if (results.passed.length > 0) {
    log('\nPassed Checks:', colors.green + colors.bright)
    results.passed.forEach((item) => pass(item))
  }

  console.log('\n' + '='.repeat(60))

  const score =
    (results.passed.length /
      (results.passed.length + results.failed.length + results.warnings.length)) *
    100

  log(`\nSecurity Score: ${Math.round(score)}%`, colors.bright)

  if (score >= 90) {
    log('Status: EXCELLENT', colors.green + colors.bright)
  } else if (score >= 70) {
    log('Status: GOOD', colors.blue + colors.bright)
  } else if (score >= 50) {
    log('Status: NEEDS IMPROVEMENT', colors.yellow + colors.bright)
  } else {
    log('Status: CRITICAL', colors.red + colors.bright)
  }

  console.log('='.repeat(60) + '\n')

  // Save report to file
  const reportPath = path.join(process.cwd(), 'security-audit-report.json')
  const report = {
    timestamp: new Date().toISOString(),
    score: Math.round(score),
    results,
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  info(`Detailed report saved to: security-audit-report.json`)

  // Exit with error code if critical failures
  if (results.failed.length > 5) {
    process.exit(1)
  }
}

/**
 * Main execution
 */
function main() {
  log('\n🔒 Security Audit for Cidadão.AI Frontend', colors.bright + colors.cyan)
  log('Running comprehensive security checks...\n', colors.cyan)

  checkDependencies()
  checkEnvironmentVariables()
  checkSecurityHeaders()
  checkRateLimiting()
  checkInputValidation()
  checkCSRFProtection()
  checkCSPConfiguration()
  checkCodePatterns()

  generateReport()
}

main()
