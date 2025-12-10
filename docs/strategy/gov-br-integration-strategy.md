# Estratégia de Integração Gov.br para Cidadão.AI

**Autor**: Anderson Henrique da Silva
**Data**: 2025-12-10
**Status**: Planejamento Estratégico

---

## Visão Executiva

A integração com a plataforma Gov.br representa uma oportunidade estratégica para o Cidadão.AI:

1. **Legitimidade Institucional**: Hospedagem em infraestrutura governamental
2. **Autenticação Segura**: OAuth 2.0 com níveis Bronze/Prata/Ouro
3. **Assinatura Eletrônica**: Validade jurídica para termos e consentimentos
4. **Simplificação LGPD**: Conformidade facilitada com bases legais claras

---

## Requisitos para Integração (Gov.br)

### Pré-requisitos Obrigatórios

1. **Domínio Oficial de Governo**
   - Conforme Portaria SGD/MGI Nº 7.076 (02/10/2024)
   - Domínios aceitos: `.gov.br`, `.edu.br`, `.mil.br`, `.jus.br`, etc.
   - **Estratégia**: Parceria com IFSULDEMINAS para domínio `.edu.br`

2. **Cadastro no Portal de Serviços**
   - Sistema deve estar em [servicos.gov.br](https://servicos.gov.br)
   - Apenas serviços públicos digitais ao cidadão

3. **Responsáveis Formais**
   - Responsável Negocial (servidor público)
   - Responsável Técnico (pode ser externo)

### Processo de Credenciamento

```
1. Acessar: https://www.gov.br/governodigital/integrarprodutoid
2. Login com conta Gov.br (servidor público)
3. Preencher dados do órgão/entidade
4. Aguardar aprovação (até 72h para homologação)
5. Desenvolver integração em ambiente de staging
6. Gravar vídeo comprovando integração
7. Solicitar credenciais de produção (3-5 dias)
```

---

## Arquitetura Técnica Proposta

### OAuth 2.0 Flow (Gov.br)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Cidadão.AI │────▶│   Gov.br     │────▶│   Usuário   │
│  Frontend   │     │   OAuth      │     │  Autentica  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │                    │
       │                   │◀───────────────────┘
       │◀──────────────────┘
       │   (access_token + id_token)
       ▼
┌─────────────┐
│  Backend    │
│  Validação  │
└─────────────┘
```

### Endpoints Gov.br

**Staging (Homologação)**:

- Autenticação: `https://sso.staging.acesso.gov.br`
- API Serviços: `https://api.staging.acesso.gov.br`

**Produção**:

- Autenticação: `https://sso.acesso.gov.br`
- API Serviços: `https://api.acesso.gov.br`

### Parâmetros Técnicos

```typescript
// Configuração OAuth Gov.br
const GOV_BR_CONFIG = {
  clientId: process.env.GOV_BR_CLIENT_ID,
  clientSecret: process.env.GOV_BR_CLIENT_SECRET,
  redirectUri: 'https://cidadao.ai/auth/govbr/callback',
  scope: 'openid email profile govbr_confiabilidades',
  responseType: 'code',
  // PKCE obrigatório
  codeChallengeMethod: 'S256',
  // code_verifier: 43-128 caracteres
  // id_token expira em 60 segundos!
}
```

### Níveis de Confiabilidade

| Nível      | Validação              | Uso no Cidadão.AI              |
| ---------- | ---------------------- | ------------------------------ |
| **Bronze** | Cadastro básico        | Acesso geral, navegação        |
| **Prata**  | Validação biométrica   | Certificados, relatórios       |
| **Ouro**   | CNH/Passaporte digital | Assinatura de termos, pesquisa |

---

## Estratégia LGPD Gamificada

### Problema Atual

- Termos longos e complexos
- Usuários não leem
- Consentimento sem entendimento real

### Solução Cidadão.AI

#### 1. Jornada de Entendimento LGPD

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTENDA SEUS DADOS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📚 Módulo 1: O que é a LGPD?                               │
│  ├── Quiz interativo (5 perguntas)                          │
│  ├── Vídeo explicativo (2 min)                              │
│  └── Badge: "Conhecedor LGPD" 🏅                            │
│                                                              │
│  🔒 Módulo 2: Seus Direitos                                 │
│  ├── Infográfico interativo                                 │
│  ├── Simulação de solicitação                               │
│  └── Badge: "Defensor de Direitos" 🛡️                       │
│                                                              │
│  📊 Módulo 3: Como usamos seus dados                        │
│  ├── Dashboard transparente                                 │
│  ├── Controles de privacidade                               │
│  └── Badge: "Mestre da Privacidade" 👑                      │
│                                                              │
│  ✅ Conclusão: Termo Simplificado                           │
│  ├── Resumo visual dos pontos principais                    │
│  ├── Assinatura eletrônica (Gov.br Ouro)                   │
│  └── Download PDF autenticado                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Bases Legais Aplicáveis (LGPD)

| Base Legal               | Artigo      | Aplicação no Cidadão.AI                    |
| ------------------------ | ----------- | ------------------------------------------ |
| **Consentimento**        | Art. 7º, I  | Dados pessoais, preferências               |
| **Execução de Contrato** | Art. 7º, V  | Funcionalidades do serviço                 |
| **Interesse Legítimo**   | Art. 7º, IX | Melhorias e segurança                      |
| **Pesquisa**             | Art. 7º, IV | Dados anonimizados para pesquisa acadêmica |

#### 3. Anonimização para Pesquisa

```typescript
// Processo de anonimização
interface AnonymizedData {
  // Identificador único não reversível
  anonymousId: string // SHA-256(userId + salt)

  // Dados agregados (não individuais)
  ageRange: '18-24' | '25-34' | '35-44' | '45-54' | '55+'
  region: 'sudeste' | 'sul' | 'nordeste' | 'norte' | 'centro-oeste'

  // Métricas de uso (sem PII)
  sessionsCount: number
  featuresUsed: string[]
  learningProgress: number

  // NUNCA incluir
  // - Nome, email, CPF
  // - Localização precisa
  // - Dados biométricos
  // - Conversas com IA (conteúdo)
}
```

---

## Plano de Ação via IFSULDEMINAS

### Fase 1: Parceria Institucional (2-4 semanas)

1. **Contato Inicial**
   - Departamento de TI do IFSULDEMINAS
   - Apresentação do projeto Cidadão.AI
   - Proposta de parceria para pesquisa/extensão

2. **Documentação Necessária**
   - Projeto de extensão formal
   - Termo de parceria técnica
   - Plano de hospedagem e segurança

3. **Benefícios para o IF**
   - Plataforma de ensino de IA para alunos
   - Projeto de extensão com impacto social
   - Visibilidade institucional

### Fase 2: Infraestrutura (4-6 semanas)

1. **Domínio**: `cidadao.ifsuldeminas.edu.br` ou similar
2. **Hospedagem**: Infraestrutura do IF ou nuvem governamental
3. **Certificados**: SSL/TLS via RNP

### Fase 3: Integração Gov.br (6-8 semanas)

1. Solicitação de credenciais via IFSULDEMINAS
2. Desenvolvimento em ambiente de staging
3. Testes de integração OAuth + Assinatura
4. Vídeo de comprovação
5. Deploy em produção

---

## Implementação Técnica Imediata

### Componentes a Desenvolver

1. **LGPDTermsModal** - Modal com jornada gamificada
2. **DataUnderstandingBadge** - Tag "Entenda seus dados"
3. **PrivacyDashboard** - Painel de controle de dados
4. **ConsentManager** - Gerenciador de consentimentos

### Estrutura de Arquivos

```
components/
└── privacy/
    ├── lgpd-terms-modal.tsx      # Modal principal
    ├── lgpd-quiz.tsx             # Quiz interativo
    ├── lgpd-progress.tsx         # Barra de progresso
    ├── data-understanding-tag.tsx # Tag clicável
    └── consent-checkboxes.tsx    # Checkboxes de aceite

lib/
└── privacy/
    ├── lgpd-content.ts           # Conteúdo dos módulos
    ├── anonymization.service.ts  # Serviço de anonimização
    └── consent.service.ts        # Gerenciamento de consentimento
```

---

## Referências

- [Roteiro de Integração Login Único](https://acesso.gov.br/roteiro-tecnico/)
- [Solicitar Credenciais Gov.br](https://acesso.gov.br/roteiro-tecnico/solicitacaocredencialprocesso.html)
- [Catálogo de APIs Gov.br](https://www.gov.br/conecta/catalogo/apis/brasil-cidadao-login-unico)
- [API Assinatura Eletrônica](https://manual-integracao-assinatura-eletronica.servicos.gov.br/)
- [GitHub - govbr-oauth (Node.js)](https://github.com/dtedesco/govbr-oauth)
- [Portaria SGD/MGI Nº 7.076](https://www.gov.br/governodigital)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## Próximos Passos

- [ ] Implementar LGPDTermsModal com gamificação
- [ ] Adicionar tag "Entenda seus dados" na seleção
- [ ] Contatar IFSULDEMINAS para parceria
- [ ] Preparar documentação para credenciamento Gov.br
- [ ] Desenvolver serviço de anonimização para pesquisa
