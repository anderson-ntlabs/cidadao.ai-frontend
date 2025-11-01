# Mobile UI Audit - Cidadão.AI Frontend

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-29 10:30:00 -0300

## Objetivo

Identificar e documentar todos os problemas de interface mobile em todas as páginas e componentes do sistema Cidadão.AI Frontend.

## Contexto

Usuário reportou "problemas significativos" na interface mobile que necessitam revisão completa. Esta auditoria visa:

1. Identificar todos os problemas de UX/UI mobile
2. Priorizar correções por severidade
3. Planejar implementação de fixes

## Escopo da Auditoria

### Páginas Públicas (Landing)

- [x] `/pt` - Landing page principal
- [ ] `/pt/about` - Sobre o projeto
- [ ] `/pt/agents` - Listagem de agentes
- [ ] `/pt/manifesto` - Manifesto
- [ ] `/pt/system` - Sistema
- [x] `/pt/login` - Página de login (recém otimizada)

### Páginas Autenticadas

- [ ] `/pt/app` - Home do sistema autenticado
- [ ] `/pt/app/chat` - Chat com IAs
- [ ] `/pt/app/dashboard` - Dashboard
- [ ] `/pt/app/investigacoes` - Investigações
- [ ] `/pt/app/mapa` - Mapa de transparência
- [ ] `/pt/app/perfil` - Perfil do usuário
- [ ] `/pt/app/notificacoes` - Notificações
- [ ] `/pt/app/configuracoes` - Configurações

### Componentes Críticos

- [x] `components/header.tsx` - Header global
- [x] `components/navigation.tsx` - Sistema de navegação (recém corrigido)
- [x] `components/mobile-nav.tsx` - Navegação mobile bottom bar
- [ ] `components/footer.tsx` - Footer
- [ ] Outros componentes compartilhados

## Problemas Identificados

### 🔴 CRÍTICOS (Bloqueadores de uso)

#### 1. Menu Hamburguer Não Funcionava

**Status**: ✅ RESOLVIDO (commit e50ad06)

- **Descrição**: Menu mobile não abria em nenhum contexto
- **Causa**: `window.location.href` forçava page reload
- **Solução**: Delegado navegação para Next.js Link component

### 🟡 ALTOS (Prejudicam experiência)

#### 2. Landing Page - Banner Verde (Login)

**Status**: ✅ RESOLVIDO (commit 02533aa)

- **Descrição**: Banner informativo ocupava toda tela mobile na página de login
- **Solução**: Layout centralizado sem banner, otimizado para mobile

#### 3. [A INVESTIGAR] Layout Responsivo Landing Page

**Status**: ⏳ PENDENTE

- **Páginas Afetadas**: `/pt`, `/pt/about`, `/pt/agents`, etc.
- **Sintomas Possíveis**:
  - Textos pequenos demais
  - Elementos sobrepostos
  - Scroll horizontal indesejado
  - Imagens não responsivas
  - Padding/margin inadequados

#### 4. [A INVESTIGAR] Header Mobile

**Status**: ⏳ PENDENTE

- **Possíveis Problemas**:
  - Logo muito grande
  - Ícones muito pequenos ou grandes
  - Menu não acessível
  - Altura excessiva do header

#### 5. [A INVESTIGAR] Footer Mobile

**Status**: ⏳ PENDENTE

- **Possíveis Problemas**:
  - Links muito pequenos
  - Texto ilegível
  - Layout quebrado

### 🟢 MÉDIOS (Melhorias de UX)

#### 6. [A INVESTIGAR] Navegação Bottom Bar

**Status**: ⏳ PENDENTE

- **Componente**: `components/mobile-nav.tsx`
- **Observações**:
  - Botão "Mais" está comentado (incompleto)
  - Apenas 2 itens ativos (Início, Chat)
  - Pode precisar mais opções visíveis

#### 7. [A INVESTIGAR] Formulários Mobile

**Status**: ⏳ PENDENTE

- **Páginas Afetadas**: Login, Perfil, Configurações
- **Possíveis Problemas**:
  - Inputs muito pequenos
  - Labels não legíveis
  - Botões difíceis de tocar

### 🔵 BAIXOS (Polimento)

#### 8. [A INVESTIGAR] Animações e Transições

**Status**: ⏳ PENDENTE

- Performance em dispositivos móveis
- Animações muito lentas/rápidas

#### 9. [A INVESTIGAR] Touch Targets

**Status**: ⏳ PENDENTE

- Verificar se todos os botões têm mínimo 44x44px
- Espaçamento adequado entre elementos clicáveis

## Metodologia de Teste

### Dispositivos/Viewports

- [ ] iPhone SE (375x667) - Pequeno
- [ ] iPhone 12/13 (390x844) - Médio
- [ ] iPhone 14 Pro Max (430x932) - Grande
- [ ] Samsung Galaxy S20 (360x800) - Android pequeno
- [ ] Samsung Galaxy S21+ (384x854) - Android médio
- [ ] iPad Mini (768x1024) - Tablet pequeno

### Checklist por Página

- [ ] Não há scroll horizontal indesejado
- [ ] Todos os textos são legíveis (min 16px)
- [ ] Botões têm área de toque adequada (44x44px)
- [ ] Imagens são responsivas
- [ ] Navegação é acessível
- [ ] Forms são usáveis
- [ ] Performance é aceitável (< 3s para interação)

## Próximos Passos

1. ⏳ Executar teste manual em cada página (DevTools responsive)
2. ⏳ Documentar screenshots dos problemas
3. ⏳ Priorizar correções
4. ⏳ Implementar fixes em ordem de prioridade
5. ⏳ Testar em dispositivos reais

## Notas Técnicas

### Breakpoints Atuais (Tailwind)

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Classes Mobile-First Importantes

- `px-4 sm:px-6`: Padding horizontal responsivo
- `text-base md:text-lg`: Tamanho de texto responsivo
- `hidden md:block`: Esconder em mobile
- `md:hidden`: Mostrar apenas em mobile

## Issues Relacionados

- Login page banner: commit 02533aa
- Mobile menu broken: commit e50ad06

## Atualizações

### 2025-01-29 10:30

- Auditoria iniciada
- 2 problemas críticos já resolvidos
- Iniciando investigação sistemática
