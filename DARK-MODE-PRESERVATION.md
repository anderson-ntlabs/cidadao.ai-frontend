# 🌙 Guia de Preservação do Dark Mode - Cidadão.AI

**Autor:** Anderson Henrique da Silva  
**Data:** 29 de setembro de 2025  
**Status:** PRESERVAR COMO ESTÁ ✅

## Visual Atual do Dark Mode (MANTER)

### 🎨 Elementos que Devem Ser Preservados

#### 1. Gradientes Característicos
```css
/* MANTER EXATAMENTE ASSIM */
background: linear-gradient(to bottom right, 
  from-gray-900 
  via-gray-800 
  to-gray-900
);

/* Overlay de gradiente verde-azul */
background: linear-gradient(to top right,
  from-green-900/20
  to-blue-900/20  
);
```

#### 2. Glassmorphism Atual
```css
/* NÃO ALTERAR */
backdrop-filter: blur(12px);
background: rgba(31, 41, 55, 0.8); /* gray-800 com transparência */
border: 1px solid rgba(55, 65, 81, 0.5); /* gray-700/50 */
```

#### 3. Cores de Destaque
- **Verde principal:** `#10b981` (green-500)
- **Azul complementar:** `#3b82f6` (blue-500)
- **Amarelo accent:** `#eab308` (yellow-500)
- **Gradiente do logo:** verde → amarelo → azul

#### 4. Tons de Cinza (Dark Mode)
```css
/* PALETA ATUAL - PRESERVAR */
--gray-900: #111827;
--gray-800: #1f2937;
--gray-700: #374151;
--gray-600: #4b5563;
--gray-400: #9ca3af;
--gray-300: #d1d5db;
--gray-100: #f3f4f6;
```

## ❌ O Que NÃO Mudar

1. **Não alterar** os gradientes de fundo
2. **Não modificar** a transparência dos cards
3. **Não mudar** as cores principais (verde/azul/amarelo)
4. **Não ajustar** os valores de blur do glassmorphism
5. **Não mexer** nos tons de cinza estabelecidos

## ✅ Refinamentos Permitidos (Sprint 7)

### 1. Consistência entre Páginas
- Verificar se TODAS as páginas usam os mesmos valores
- Corrigir apenas inconsistências, mantendo o padrão atual

### 2. Transições Suaves
```css
/* Adicionar apenas se faltar */
transition: background-color 0.3s ease, color 0.3s ease;
```

### 3. Sincronização com Sistema
```javascript
// Adicionar opção de seguir preferência do sistema
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

### 4. Pequenos Ajustes de Contraste
- Apenas onde necessário para acessibilidade
- Sempre mantendo a estética atual
- Usar as cores já definidas, não criar novas

## 📋 Checklist de Preservação

Ao trabalhar no dark mode, sempre verificar:

- [ ] Os gradientes estão idênticos ao original?
- [ ] O glassmorphism mantém o blur atual?
- [ ] As cores são exatamente as mesmas?
- [ ] A transparência dos elementos foi preservada?
- [ ] O contraste está similar ao atual?
- [ ] As transições são suaves mas não chamativas?

## 🚨 Alerta para Desenvolvedores

**IMPORTANTE:** O dark mode atual é considerado perfeito pelo usuário. Qualquer mudança deve ser:
1. Discutida previamente
2. Justificada por necessidade técnica
3. Aprovada antes da implementação
4. Testada para garantir preservação do visual

## 💬 Feedback do Usuário

> "eu adoro o dark mode que temos atualmente, acho ele lindo"
> - Anderson Henrique, 29/09/2025

Este feedback deve guiar todas as decisões relacionadas ao dark mode.

## 🎯 Objetivo do Sprint 7 para Dark Mode

**Meta:** Garantir que o dark mode continue lindo como está, apenas com:
- Consistência em 100% das páginas
- Transições melhoradas entre temas
- Opção de seguir preferência do sistema
- Zero mudanças visuais na estética atual

---

**Lembrete Final:** O dark mode atual é uma das features mais apreciadas do projeto. Preserve-o com carinho! 💚