const { chromium } = require('playwright')
const fs = require('fs').promises
const path = require('path')

// Configurações
const BASE_URL = 'http://localhost:3000'
const SCREENSHOTS_DIR = './ux-analysis-screenshots'
const REPORT_FILE = './ux-analysis-report.json'

// Criar diretório para screenshots
async function ensureScreenshotsDir() {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true })
  } catch (error) {
    console.error('Erro ao criar diretório:', error)
  }
}

// Análise de cores e contraste
async function analyzeColorContrast(page) {
  return await page.evaluate(() => {
    const getContrastRatio = (rgb1, rgb2) => {
      const getLuminance = (rgb) => {
        const [r, g, b] = rgb.match(/\d+/g).map(Number)
        const sRGB = [r, g, b].map((val) => {
          val = val / 255
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
      }

      const l1 = getLuminance(rgb1)
      const l2 = getLuminance(rgb2)
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    }

    const issues = []
    const elements = document.querySelectorAll('*')

    elements.forEach((el) => {
      const style = window.getComputedStyle(el)
      const bgColor = style.backgroundColor
      const textColor = style.color

      if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(bgColor, textColor)
        if (contrast < 4.5) {
          issues.push({
            element: el.tagName,
            class: el.className,
            contrast: contrast.toFixed(2),
            bgColor,
            textColor,
            recommendation: 'Contraste insuficiente (mínimo 4.5:1 para texto normal)',
          })
        }
      }
    })

    return issues
  })
}

// Análise de responsividade
async function analyzeResponsiveness(page) {
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ]

  const results = {}

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.waitForTimeout(500)

    const issues = await page.evaluate(() => {
      const problems = []

      // Verificar elementos que vazam horizontalmente
      const bodyWidth = document.body.scrollWidth
      const windowWidth = window.innerWidth
      if (bodyWidth > windowWidth) {
        problems.push({
          type: 'overflow',
          description: 'Conteúdo vazando horizontalmente',
          scrollWidth: bodyWidth,
          windowWidth: windowWidth,
        })
      }

      // Verificar textos muito pequenos
      const texts = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6')
      texts.forEach((el) => {
        const fontSize = parseFloat(window.getComputedStyle(el).fontSize)
        if (fontSize < 14) {
          problems.push({
            type: 'small-text',
            element: el.tagName,
            fontSize: fontSize + 'px',
            text: el.textContent.substring(0, 50),
          })
        }
      })

      // Verificar áreas de toque
      const clickables = document.querySelectorAll('a, button, input, select, textarea')
      clickables.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const minSize = 44 // Mínimo recomendado pelo WCAG
        if (rect.width < minSize || rect.height < minSize) {
          problems.push({
            type: 'small-touch-target',
            element: el.tagName,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
            recommendation: 'Área de toque mínima: 44x44px',
          })
        }
      })

      return problems
    })

    results[viewport.name] = issues
  }

  return results
}

// Análise de acessibilidade
async function analyzeAccessibility(page) {
  return await page.evaluate(() => {
    const issues = []

    // Verificar alt em imagens
    document.querySelectorAll('img').forEach((img) => {
      if (!img.alt) {
        issues.push({
          type: 'missing-alt',
          element: 'img',
          src: img.src,
          recommendation: 'Adicionar texto alternativo descritivo',
        })
      }
    })

    // Verificar labels em formulários
    document.querySelectorAll('input, select, textarea').forEach((input) => {
      const id = input.id
      const label = id ? document.querySelector(`label[for="${id}"]`) : null
      if (!label && !input.getAttribute('aria-label')) {
        issues.push({
          type: 'missing-label',
          element: input.tagName,
          type: input.type,
          recommendation: 'Adicionar label ou aria-label',
        })
      }
    })

    // Verificar estrutura de headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    const headingLevels = headings.map((h) => parseInt(h.tagName.charAt(1)))

    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i - 1] > 1) {
        issues.push({
          type: 'heading-skip',
          from: 'h' + headingLevels[i - 1],
          to: 'h' + headingLevels[i],
          recommendation: 'Evitar pular níveis de heading',
        })
      }
    }

    // Verificar controles de teclado
    const focusables = document.querySelectorAll('a, button, input, select, textarea, [tabindex]')
    focusables.forEach((el) => {
      const tabindex = el.getAttribute('tabindex')
      if (tabindex && parseInt(tabindex) > 0) {
        issues.push({
          type: 'positive-tabindex',
          element: el.tagName,
          tabindex: tabindex,
          recommendation: 'Usar tabindex="0" ou "-1" em vez de valores positivos',
        })
      }
    })

    return issues
  })
}

// Análise de performance visual
async function analyzeVisualPerformance(page) {
  const metrics = await page.evaluate(() => {
    const getAnimations = () => {
      const animated = []
      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el)
        if (style.animation !== 'none' || style.transition !== 'none 0s ease 0s') {
          animated.push({
            element: el.tagName,
            class: el.className,
            animation: style.animation,
            transition: style.transition,
          })
        }
      })
      return animated
    }

    const getFonts = () => {
      const fonts = new Set()
      document.querySelectorAll('*').forEach((el) => {
        const fontFamily = window.getComputedStyle(el).fontFamily
        if (fontFamily) fonts.add(fontFamily)
      })
      return Array.from(fonts)
    }

    return {
      animations: getAnimations(),
      fonts: getFonts(),
      domNodes: document.querySelectorAll('*').length,
    }
  })

  return metrics
}

// Análise de consistência de design
async function analyzeDesignConsistency(page) {
  return await page.evaluate(() => {
    const getColors = () => {
      const colors = new Set()
      const colorProps = ['color', 'backgroundColor', 'borderColor']

      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el)
        colorProps.forEach((prop) => {
          const color = style[prop]
          if (color && color !== 'rgba(0, 0, 0, 0)') {
            colors.add(color)
          }
        })
      })

      return Array.from(colors)
    }

    const getSpacings = () => {
      const spacings = new Set()
      const spacingProps = ['padding', 'margin', 'gap']

      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el)
        spacingProps.forEach((prop) => {
          const value = style[prop]
          if (value && value !== '0px') {
            spacings.add(value)
          }
        })
      })

      return Array.from(spacings)
    }

    const getBorderRadii = () => {
      const radii = new Set()
      document.querySelectorAll('*').forEach((el) => {
        const radius = window.getComputedStyle(el).borderRadius
        if (radius && radius !== '0px') {
          radii.add(radius)
        }
      })
      return Array.from(radii)
    }

    return {
      colors: getColors(),
      spacings: getSpacings(),
      borderRadii: getBorderRadii(),
      recommendations: [],
    }
  })
}

// Análise de navegação
async function analyzeNavigation(page) {
  const navigationFlow = []

  // Analisar página inicial
  await page.goto(BASE_URL + '/pt')
  await page.waitForLoadState('networkidle')

  const homeAnalysis = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a')).map((a) => ({
      text: a.textContent.trim(),
      href: a.href,
      visible: a.offsetParent !== null,
    }))

    const buttons = Array.from(document.querySelectorAll('button')).map((btn) => ({
      text: btn.textContent.trim(),
      visible: btn.offsetParent !== null,
      disabled: btn.disabled,
    }))

    return { links, buttons }
  })

  navigationFlow.push({
    page: 'home',
    url: page.url(),
    analysis: homeAnalysis,
  })

  // Testar fluxo de login
  await page.goto(BASE_URL + '/pt/login')
  await page.waitForLoadState('networkidle')

  const loginFormAnalysis = await page.evaluate(() => {
    const forms = document.querySelectorAll('form')
    const inputs = document.querySelectorAll('input')
    const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]')

    return {
      formCount: forms.length,
      inputCount: inputs.length,
      submitButtonCount: submitButtons.length,
      inputTypes: Array.from(inputs).map((i) => i.type),
    }
  })

  navigationFlow.push({
    page: 'login',
    url: page.url(),
    analysis: loginFormAnalysis,
  })

  return navigationFlow
}

// Função principal
async function runAnalysis() {
  console.log('🔍 Iniciando análise de UX/UI...\n')

  await ensureScreenshotsDir()

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  const report = {
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    analyses: {},
  }

  try {
    // 1. Análise de navegação
    console.log('📍 Analisando navegação...')
    await page.goto(BASE_URL + '/pt')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-home.png'), fullPage: true })
    report.analyses.navigation = await analyzeNavigation(page)

    // 2. Análise de cores e contraste
    console.log('🎨 Analisando cores e contraste...')
    report.analyses.colorContrast = await analyzeColorContrast(page)

    // 3. Análise de responsividade
    console.log('📱 Analisando responsividade...')
    report.analyses.responsiveness = await analyzeResponsiveness(page)

    // Screenshots em diferentes viewports
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize(vp)
      await page.goto(BASE_URL + '/pt')
      await page.waitForLoadState('networkidle')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `02-home-${vp.name}.png`),
        fullPage: true,
      })
    }

    // 4. Análise de acessibilidade
    console.log('♿ Analisando acessibilidade...')
    await page.setViewportSize({ width: 1920, height: 1080 })
    report.analyses.accessibility = await analyzeAccessibility(page)

    // 5. Análise de performance visual
    console.log('⚡ Analisando performance visual...')
    report.analyses.visualPerformance = await analyzeVisualPerformance(page)

    // 6. Análise de consistência de design
    console.log('🎯 Analisando consistência de design...')
    report.analyses.designConsistency = await analyzeDesignConsistency(page)

    // Testar páginas principais
    const mainPages = [
      { path: '/pt/login', name: 'login' },
      { path: '/pt/sobre', name: 'sobre' },
      { path: '/pt/agentes', name: 'agentes' },
      { path: '/pt/privacidade', name: 'privacidade' },
    ]

    for (const mp of mainPages) {
      console.log(`📸 Capturando ${mp.name}...`)
      await page.goto(BASE_URL + mp.path)
      await page.waitForLoadState('networkidle')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `03-${mp.name}.png`),
        fullPage: true,
      })
    }

    // Salvar relatório
    await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2))
    console.log('\n✅ Análise concluída! Relatório salvo em:', REPORT_FILE)
    console.log('📁 Screenshots salvos em:', SCREENSHOTS_DIR)
  } catch (error) {
    console.error('❌ Erro durante análise:', error)
  } finally {
    await browser.close()
  }

  // Gerar resumo
  generateSummary(report)
}

// Gerar resumo da análise
function generateSummary(report) {
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMO DA ANÁLISE DE UX/UI')
  console.log('='.repeat(50) + '\n')

  // Contraste
  const contrastIssues = report.analyses.colorContrast || []
  console.log(`🎨 Problemas de Contraste: ${contrastIssues.length}`)
  if (contrastIssues.length > 0) {
    console.log('   Principais problemas:')
    contrastIssues.slice(0, 3).forEach((issue) => {
      console.log(`   - ${issue.element}: contraste ${issue.contrast} (mínimo 4.5)`)
    })
  }

  // Responsividade
  const responsiveIssues = report.analyses.responsiveness || {}
  console.log(`\n📱 Problemas de Responsividade:`)
  Object.entries(responsiveIssues).forEach(([viewport, issues]) => {
    console.log(`   ${viewport}: ${issues.length} problemas`)
  })

  // Acessibilidade
  const a11yIssues = report.analyses.accessibility || []
  console.log(`\n♿ Problemas de Acessibilidade: ${a11yIssues.length}`)
  const a11yByType = {}
  a11yIssues.forEach((issue) => {
    a11yByType[issue.type] = (a11yByType[issue.type] || 0) + 1
  })
  Object.entries(a11yByType).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`)
  })

  // Performance Visual
  const perfData = report.analyses.visualPerformance || {}
  console.log(`\n⚡ Performance Visual:`)
  console.log(`   - Animações: ${perfData.animations?.length || 0}`)
  console.log(`   - Fontes únicas: ${perfData.fonts?.length || 0}`)
  console.log(`   - Nós DOM: ${perfData.domNodes || 'N/A'}`)

  // Consistência de Design
  const designData = report.analyses.designConsistency || {}
  console.log(`\n🎯 Consistência de Design:`)
  console.log(`   - Cores únicas: ${designData.colors?.length || 0}`)
  console.log(`   - Espaçamentos únicos: ${designData.spacings?.length || 0}`)
  console.log(`   - Border radius únicos: ${designData.borderRadii?.length || 0}`)

  console.log('\n' + '='.repeat(50))
}

// Executar análise
runAnalysis().catch(console.error)
