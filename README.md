# Cidadão.AI Frontend

<div align="center">
  <img src="public/operarios.png" alt="Cidadão.AI - Operários" width="600">
  
  <h3>🇧🇷 Plataforma de Transparência Pública com Inteligência Artificial</h3>
  
  <p>
    <a href="#-sobre">Sobre</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-instalação">Instalação</a> •
    <a href="#-uso">Uso</a> •
    <a href="#-estrutura">Estrutura</a> •
    <a href="#-componentes">Componentes</a> •
    <a href="#-contribuindo">Contribuindo</a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
    <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa" alt="PWA">
  </p>
</div>

## 📖 Sobre

O **Cidadão.AI Frontend** é a interface web da plataforma de transparência pública brasileira que utiliza inteligência artificial para democratizar o acesso aos dados governamentais. O sistema conta com 17 agentes de IA especializados, cada um com identidade cultural brasileira única.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação Social**: Login com Google, Gov.br, GitHub e X
- 📊 **Dashboard de Investigações**: Visualização em tempo real de anomalias detectadas
- 💬 **Chat com IAs**: Converse com agentes especializados em transparência
- 🎨 **Design Cultural**: Interface inspirada na obra "Operários" de Tarsila do Amaral
- 📱 **PWA**: Aplicação progressiva com funcionamento offline
- 🌐 **Bilíngue**: Interface em português e inglês

## 🚀 Tecnologias

- **Framework**: [Next.js 15](https://nextjs.org/) com App Router
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) 5.0+
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) 3.4
- **Estado**: [Zustand](https://zustand-demo.pmnd.rs/) para gerenciamento
- **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa) para funcionalidades offline
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Hospedagem**: Otimizado para [Vercel](https://vercel.com/)

## 💻 Instalação

### Pré-requisitos

- Node.js 18.0 ou superior
- npm 9.0 ou superior

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/anderson-ufrj/cidadao.ai-frontend.git
cd cidadao.ai-frontend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente** (opcional)
```bash
cp .env.example .env.local
```

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
```
http://localhost:3000
```

## 🎯 Uso

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
npm run type-check   # Verificação de tipos TypeScript
```

### Fluxo de Navegação

1. **Landing Page** (`/pt` ou `/en`): Apresentação da plataforma
2. **Login** (`/pt/login`): Autenticação mockada
3. **Dashboard** (`/pt/dashboard`): Métricas e investigações
4. **Chat** (`/pt/chat`): Conversação com agentes de IA

## 📁 Estrutura

```
cidadao.ai-frontend/
├── app/                    # Páginas e layouts (App Router)
│   ├── pt/                # Páginas em português
│   │   ├── page.tsx       # Landing page PT
│   │   ├── login/         # Página de login
│   │   ├── dashboard/     # Dashboard de investigações
│   │   └── chat/          # Chat com IAs
│   ├── en/                # Páginas em inglês
│   └── layout.tsx         # Layout raiz
├── components/            # Componentes reutilizáveis
│   ├── header.tsx        # Cabeçalho com navegação
│   ├── footer.tsx        # Rodapé
│   ├── toast.tsx         # Sistema de notificações
│   ├── tour.tsx          # Tour guiado
│   └── breadcrumbs.tsx   # Navegação breadcrumb
├── data/                  # Dados estáticos
│   └── agents.ts         # Configuração dos 17 agentes
├── hooks/                 # React hooks customizados
│   ├── use-chat.ts       # Hook para chat com backend
│   └── use-toast.ts      # Hook para notificações
├── lib/                   # Utilitários
│   └── i18n.ts           # Internacionalização
├── public/               # Arquivos públicos
│   ├── operarios.png     # Imagem de fundo principal
│   └── agents/           # Avatares dos agentes
└── styles/               # Estilos globais
    └── globals.css       # CSS global e animações
```

## 🧩 Componentes

### Componentes Principais

#### Toast (Sistema de Notificações)
```tsx
import { toast } from '@/hooks/use-toast'

// Uso
toast.success('Operação realizada com sucesso!')
toast.error('Erro ao processar dados')
toast.info('Nova atualização disponível')
toast.warning('Ação irreversível')
```

#### Tour (Guia Interativo)
```tsx
<Tour
  steps={[
    {
      target: '.element-selector',
      title: 'Título do Passo',
      content: 'Descrição detalhada',
      placement: 'bottom'
    }
  ]}
  onComplete={() => console.log('Tour concluído')}
/>
```

#### Breadcrumbs (Navegação)
```tsx
<Breadcrumbs 
  items={[
    { label: 'Home', href: '/pt' },
    { label: 'Dashboard' }
  ]} 
/>
```

### Agentes de IA

O sistema conta com 17 agentes especializados:

- **Abaporu**: Orquestrador mestre
- **Zumbi dos Palmares**: Detecção de anomalias
- **Anita Garibaldi**: Análise de padrões
- **Tiradentes**: Geração de relatórios
- **Nanã**: Gerenciamento de memória
- E mais 12 agentes especializados

## 🎨 Design System

### Cores Principais

- **Verde**: `#10b981` (Esperança)
- **Amarelo**: `#eab308` (Sol)
- **Azul**: `#3b82f6` (Céu)

### Tipografia

- **Fonte Principal**: Inter
- **Títulos**: 700 (bold)
- **Corpo**: 400 (regular)

### Componentes de UI

- Glass morphism com backdrop-blur
- Animações suaves com Tailwind
- Tema claro/escuro automático
- Design responsivo mobile-first

## 🔧 Configuração Avançada

### PWA Configuration

O arquivo `next.config.js` configura a aplicação como PWA:

```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})
```

### Integração com Backend

Configure a URL do backend em `hooks/use-chat.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  'https://neural-thinker-cidadao-ai-backend.hf.space'
```

## 🤝 Contribuindo

Adoramos contribuições! Por favor, leia nosso [Guia de Contribuição](CONTRIBUTING.md) antes de enviar um Pull Request.

### Passos Rápidos

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [Tarsila do Amaral](https://pt.wikipedia.org/wiki/Tarsila_do_Amaral) pela inspiração visual
- Comunidade open source brasileira
- Todos os contribuidores do projeto

---

<div align="center">
  <p>Feito com ❤️ para o Brasil</p>
  <p>
    <a href="https://github.com/anderson-ufrj/cidadao.ai-frontend">GitHub</a> •
    <a href="https://cidadao.ai">Website</a> •
    <a href="https://github.com/anderson-ufrj/cidadao.ai-backend">Backend</a>
  </p>
</div>
