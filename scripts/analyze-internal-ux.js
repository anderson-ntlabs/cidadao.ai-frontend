const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configurações
const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './ux-internal-screenshots';
const REPORT_FILE = './ux-internal-analysis-report.json';

// Criar diretório para screenshots
async function ensureScreenshotsDir() {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório:', error);
  }
}

// Fazer login no sistema
async function performLogin(page) {
  console.log('🔐 Fazendo login...');
  await page.goto(BASE_URL + '/pt/login');
  await page.waitForLoadState('networkidle');
  
  // Clicar no botão de login com Google (primeiro provider)
  const loginButton = await page.locator('button:has-text("Entrar com Google")').first();
  await loginButton.click();
  
  // Aguardar redirecionamento para home (conforme código)
  await page.waitForURL(/.*\/home.*/);
  console.log('✅ Login realizado com sucesso');
}

// Análise de cores e consistência visual
async function analyzeColorConsistency(page) {
  return await page.evaluate(() => {
    const colorMap = new Map();
    const elements = document.querySelectorAll('*');
    
    // Coletar todas as cores usadas
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const props = ['color', 'backgroundColor', 'borderColor'];
      
      props.forEach(prop => {
        const value = style[prop];
        if (value && value !== 'rgba(0, 0, 0, 0)') {
          if (!colorMap.has(value)) {
            colorMap.set(value, []);
          }
          colorMap.get(value).push({
            element: el.tagName,
            class: el.className,
            property: prop
          });
        }
      });
    });

    // Analisar padrões de cores
    const analysis = {
      totalColors: colorMap.size,
      colorUsage: [],
      recommendations: []
    };

    // Converter Map para array ordenado por frequência
    for (const [color, usage] of colorMap) {
      analysis.colorUsage.push({
        color,
        count: usage.length,
        examples: usage.slice(0, 3)
      });
    }

    analysis.colorUsage.sort((a, b) => b.count - a.count);

    // Recomendações baseadas na análise
    if (analysis.totalColors > 15) {
      analysis.recommendations.push('Reduzir número de cores únicas para melhorar consistência');
    }

    // Verificar se há muitas variações de cinza
    const grays = analysis.colorUsage.filter(item => 
      item.color.includes('gray') || 
      item.color.match(/rgb\((\d+), \1, \1\)/)
    );
    
    if (grays.length > 5) {
      analysis.recommendations.push('Padronizar escala de cinzas - encontradas ' + grays.length + ' variações');
    }

    return analysis;
  });
}

// Análise de navegação e hierarquia
async function analyzeNavigation(page) {
  return await page.evaluate(() => {
    const nav = {
      mainNav: [],
      sideNav: [],
      breadcrumbs: [],
      issues: []
    };

    // Analisar navegação principal
    const mainNavs = document.querySelectorAll('nav, [role="navigation"]');
    mainNavs.forEach(navEl => {
      const links = navEl.querySelectorAll('a');
      links.forEach(link => {
        nav.mainNav.push({
          text: link.textContent.trim(),
          href: link.href,
          isActive: link.classList.contains('active') || link.getAttribute('aria-current')
        });
      });
    });

    // Analisar sidebar se existir
    const sidebar = document.querySelector('aside, [role="complementary"], .sidebar');
    if (sidebar) {
      const sideLinks = sidebar.querySelectorAll('a');
      sideLinks.forEach(link => {
        nav.sideNav.push({
          text: link.textContent.trim(),
          href: link.href
        });
      });
    }

    // Verificar breadcrumbs
    const breadcrumbNav = document.querySelector('[aria-label*="breadcrumb"], .breadcrumb');
    if (breadcrumbNav) {
      const items = breadcrumbNav.querySelectorAll('li, a');
      items.forEach(item => {
        nav.breadcrumbs.push(item.textContent.trim());
      });
    }

    // Identificar problemas
    if (nav.mainNav.length === 0) {
      nav.issues.push('Navegação principal não encontrada');
    }
    
    if (!breadcrumbNav) {
      nav.issues.push('Breadcrumbs não encontrados - importante para orientação');
    }

    // Verificar se há indicação visual clara da página atual
    const activeLinks = nav.mainNav.filter(link => link.isActive);
    if (activeLinks.length === 0) {
      nav.issues.push('Nenhuma indicação visual da página atual na navegação');
    }

    return nav;
  });
}

// Análise de componentes e padronização
async function analyzeComponents(page) {
  return await page.evaluate(() => {
    const components = {
      buttons: [],
      cards: [],
      forms: [],
      tables: [],
      inconsistencies: []
    };

    // Analisar botões
    const buttons = document.querySelectorAll('button, [role="button"]');
    const buttonStyles = new Map();
    
    buttons.forEach(btn => {
      const style = window.getComputedStyle(btn);
      const key = `${style.backgroundColor}-${style.color}-${style.borderRadius}`;
      
      if (!buttonStyles.has(key)) {
        buttonStyles.set(key, 0);
      }
      buttonStyles.set(key, buttonStyles.get(key) + 1);
      
      components.buttons.push({
        text: btn.textContent.trim(),
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderRadius: style.borderRadius,
        padding: style.padding
      });
    });

    // Verificar inconsistências em botões
    if (buttonStyles.size > 5) {
      components.inconsistencies.push({
        type: 'buttons',
        issue: `${buttonStyles.size} estilos diferentes de botões encontrados`,
        recommendation: 'Padronizar para 3-4 variantes máximo (primário, secundário, ghost, danger)'
      });
    }

    // Analisar cards
    const cards = document.querySelectorAll('.card, [class*="card"], article');
    const cardStyles = new Set();
    
    cards.forEach(card => {
      const style = window.getComputedStyle(card);
      cardStyles.add(`${style.borderRadius}-${style.boxShadow}`);
    });

    if (cardStyles.size > 3) {
      components.inconsistencies.push({
        type: 'cards',
        issue: `${cardStyles.size} estilos diferentes de cards`,
        recommendation: 'Unificar estilo de cards para consistência visual'
      });
    }

    // Analisar formulários
    const inputs = document.querySelectorAll('input, select, textarea');
    const inputStyles = new Set();
    
    inputs.forEach(input => {
      const style = window.getComputedStyle(input);
      inputStyles.add(`${style.borderRadius}-${style.borderColor}-${style.height}`);
    });

    if (inputStyles.size > 3) {
      components.inconsistencies.push({
        type: 'forms',
        issue: `${inputStyles.size} estilos diferentes de campos de formulário`,
        recommendation: 'Padronizar campos de entrada'
      });
    }

    return components;
  });
}

// Análise de espaçamento e grid
async function analyzeSpacing(page) {
  return await page.evaluate(() => {
    const spacings = new Map();
    const elements = document.querySelectorAll('*');
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const props = ['padding', 'margin', 'gap'];
      
      props.forEach(prop => {
        const value = style[prop];
        if (value && value !== '0px' && value !== 'normal') {
          if (!spacings.has(value)) {
            spacings.set(value, 0);
          }
          spacings.set(value, spacings.get(value) + 1);
        }
      });
    });

    const analysis = {
      uniqueSpacings: spacings.size,
      mostUsed: [],
      recommendations: []
    };

    // Converter e ordenar
    for (const [spacing, count] of spacings) {
      analysis.mostUsed.push({ spacing, count });
    }
    analysis.mostUsed.sort((a, b) => b.count - a.count);
    analysis.mostUsed = analysis.mostUsed.slice(0, 10);

    // Recomendações
    if (spacings.size > 20) {
      analysis.recommendations.push('Implementar escala de espaçamento consistente (ex: 4, 8, 16, 24, 32, 48px)');
    }

    return analysis;
  });
}

// Análise de responsividade interna
async function analyzeInternalResponsiveness(page) {
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  const results = {};

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);

    results[viewport.name] = await page.evaluate(() => {
      const issues = [];
      
      // Verificar overflow horizontal
      if (document.body.scrollWidth > window.innerWidth) {
        issues.push({
          type: 'overflow',
          description: 'Conteúdo vazando horizontalmente'
        });
      }

      // Verificar navegação mobile
      const nav = document.querySelector('nav');
      if (nav && window.innerWidth < 768) {
        const navHeight = nav.offsetHeight;
        if (navHeight > 80) {
          issues.push({
            type: 'navigation',
            description: 'Navegação muito alta em mobile',
            height: navHeight
          });
        }
      }

      // Verificar tabelas
      const tables = document.querySelectorAll('table');
      tables.forEach((table, index) => {
        if (table.scrollWidth > table.parentElement.offsetWidth) {
          issues.push({
            type: 'table-overflow',
            description: `Tabela ${index + 1} não responsiva`
          });
        }
      });

      return issues;
    });
  }

  return results;
}

// Capturar screenshots das principais telas
async function captureInternalScreenshots(page) {
  const screens = [
    { path: '/pt/home', name: 'home' },
    { path: '/pt/dashboard', name: 'dashboard' },
    { path: '/pt/chat', name: 'chat' },
    { path: '/pt/investigacoes', name: 'investigations' },
    { path: '/pt/perfil', name: 'profile' },
    { path: '/pt/configuracoes', name: 'settings' },
    { path: '/pt/notificacoes', name: 'notifications' }
  ];

  for (const screen of screens) {
    try {
      console.log(`📸 Capturando ${screen.name}...`);
      await page.goto(BASE_URL + screen.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Aguardar animações
      
      // Capturar desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${screen.name}-desktop.png`), 
        fullPage: true 
      });
      
      // Capturar mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${screen.name}-mobile.png`), 
        fullPage: false 
      });
    } catch (error) {
      console.error(`❌ Erro ao capturar ${screen.name}:`, error.message);
    }
  }
}

// Função principal
async function runInternalAnalysis() {
  console.log('🔍 Iniciando análise do sistema interno...\n');
  
  await ensureScreenshotsDir();
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const report = {
    timestamp: new Date().toISOString(),
    analyses: {}
  };

  try {
    // Fazer login
    await performLogin(page);
    
    // 1. Capturar screenshots primeiro
    await captureInternalScreenshots(page);
    
    // 2. Analisar home/dashboard
    console.log('📊 Analisando home/dashboard...');
    await page.goto(BASE_URL + '/pt/home');
    await page.waitForLoadState('networkidle');
    
    report.analyses.colorConsistency = await analyzeColorConsistency(page);
    report.analyses.navigation = await analyzeNavigation(page);
    report.analyses.components = await analyzeComponents(page);
    report.analyses.spacing = await analyzeSpacing(page);
    
    // 3. Analisar responsividade
    console.log('📱 Analisando responsividade interna...');
    report.analyses.responsiveness = await analyzeInternalResponsiveness(page);
    
    // 4. Analisar tela de chat
    console.log('💬 Analisando interface de chat...');
    await page.goto(BASE_URL + '/pt/chat');
    await page.waitForLoadState('networkidle');
    
    report.analyses.chatInterface = await page.evaluate(() => {
      const analysis = {
        elements: {},
        issues: []
      };
      
      // Verificar elementos principais do chat
      const chatInput = document.querySelector('textarea, input[type="text"]');
      const sendButton = document.querySelector('button[type="submit"]');
      const messageList = document.querySelector('[role="log"], .messages, .chat-messages');
      
      analysis.elements = {
        hasInput: !!chatInput,
        hasSendButton: !!sendButton,
        hasMessageList: !!messageList
      };
      
      if (!chatInput) analysis.issues.push('Campo de entrada do chat não encontrado');
      if (!sendButton) analysis.issues.push('Botão de enviar não encontrado');
      if (!messageList) analysis.issues.push('Área de mensagens não encontrada');
      
      return analysis;
    });
    
    // Salvar relatório
    await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2));
    console.log('\n✅ Análise interna concluída!');
    console.log('📁 Relatório salvo em:', REPORT_FILE);
    console.log('📁 Screenshots salvos em:', SCREENSHOTS_DIR);

  } catch (error) {
    console.error('❌ Erro durante análise:', error);
  } finally {
    await browser.close();
  }

  // Gerar resumo
  generateInternalSummary(report);
}

// Gerar resumo da análise interna
function generateInternalSummary(report) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DA ANÁLISE DO SISTEMA INTERNO');
  console.log('='.repeat(50) + '\n');

  // Cores
  const colors = report.analyses.colorConsistency;
  if (colors) {
    console.log(`🎨 Consistência de Cores:`);
    console.log(`   - Total de cores únicas: ${colors.totalColors}`);
    console.log(`   - Cores mais usadas:`);
    colors.colorUsage.slice(0, 5).forEach(item => {
      console.log(`     ${item.color}: ${item.count} usos`);
    });
    if (colors.recommendations.length > 0) {
      console.log(`   - Recomendações:`);
      colors.recommendations.forEach(rec => console.log(`     • ${rec}`));
    }
  }

  // Navegação
  const nav = report.analyses.navigation;
  if (nav) {
    console.log(`\n🧭 Navegação:`);
    console.log(`   - Items no menu principal: ${nav.mainNav.length}`);
    console.log(`   - Items na sidebar: ${nav.sideNav.length}`);
    console.log(`   - Breadcrumbs: ${nav.breadcrumbs.length > 0 ? 'Sim' : 'Não'}`);
    if (nav.issues.length > 0) {
      console.log(`   - Problemas encontrados:`);
      nav.issues.forEach(issue => console.log(`     • ${issue}`));
    }
  }

  // Componentes
  const components = report.analyses.components;
  if (components && components.inconsistencies.length > 0) {
    console.log(`\n🧩 Inconsistências em Componentes:`);
    components.inconsistencies.forEach(inc => {
      console.log(`   - ${inc.type}: ${inc.issue}`);
      console.log(`     Recomendação: ${inc.recommendation}`);
    });
  }

  // Espaçamento
  const spacing = report.analyses.spacing;
  if (spacing) {
    console.log(`\n📏 Espaçamento:`);
    console.log(`   - Valores únicos: ${spacing.uniqueSpacings}`);
    if (spacing.recommendations.length > 0) {
      spacing.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
  }

  // Responsividade
  const resp = report.analyses.responsiveness;
  if (resp) {
    console.log(`\n📱 Problemas de Responsividade:`);
    Object.entries(resp).forEach(([viewport, issues]) => {
      if (issues.length > 0) {
        console.log(`   ${viewport}: ${issues.length} problemas`);
        issues.forEach(issue => console.log(`     • ${issue.description}`));
      }
    });
  }

  console.log('\n' + '='.repeat(50));
}

// Executar análise
runInternalAnalysis().catch(console.error);