# Trilha Kids - Agora Academy

> Area infantil da Agora Academy com aprendizado seguro e divertido para criancas.

**Autor**: Anderson Henrique da Silva
**Data**: 2025-12-09
**Status**: Implementado

---

## Visao Geral

A Trilha Kids e uma area especial da Agora Academy projetada para criancas aprenderem programacao de forma ludica e segura. Caracteristicas principais:

- **Gamificacao Desativada**: Sem XP, badges ou celebracoes competitivas
- **Telemetria Parental**: Dados de uso enviados apenas para os pais
- **Conteudo Curado**: Videos de programacao selecionados para criancas
- **Mentores Amigaveis**: Monteiro Lobato e Tarsila do Amaral como guias
- **Visual Vibrante**: Tema colorido e botoes grandes para facilitar o uso

---

## Fluxo de Usuario

```
Pai faz login (OAuth GitHub/Google)
       |
       v
Acessa dashboard da Agora
       |
       v
Clica em "Ativar Area Kids"
       |
       v
Preenche nome da crianca + email para relatorios
       |
       v
Escolhe mentor (Lobato ou Tarsila)
       |
       v
Sistema cria perfil Kids vinculado ao pai
       |
       v
Crianca usa a plataforma com tema Kids
       |
       v
Pai recebe email diario com resumo
       |
       v
Pai acessa /pt/agora/pais com codigo do email
```

---

## Arquitetura Tecnica

### Banco de Dados (Supabase)

#### agora_kids_profiles

Armazena perfis Kids vinculados a contas de pais.

| Coluna         | Tipo        | Descricao                 |
| -------------- | ----------- | ------------------------- |
| id             | UUID        | PK                        |
| parent_user_id | UUID        | FK para auth.users        |
| child_name     | TEXT        | Nome da crianca           |
| child_avatar   | TEXT        | 'lobato' ou 'tarsila'     |
| parent_email   | TEXT        | Email para relatorios     |
| is_active      | BOOLEAN     | Se o modo Kids esta ativo |
| created_at     | TIMESTAMPTZ | Data de criacao           |

#### agora_kids_sessions

Sessoes de uso para relatorios parentais.

| Coluna            | Tipo        | Descricao                   |
| ----------------- | ----------- | --------------------------- |
| id                | UUID        | PK                          |
| kids_profile_id   | UUID        | FK para agora_kids_profiles |
| started_at        | TIMESTAMPTZ | Inicio da sessao            |
| ended_at          | TIMESTAMPTZ | Fim da sessao               |
| duration_minutes  | INTEGER     | Duracao em minutos          |
| videos_watched    | TEXT[]      | IDs dos videos assistidos   |
| agents_interacted | TEXT[]      | IDs dos agentes usados      |

#### agora_parental_codes

Codigos de acesso para o dashboard parental.

| Coluna         | Tipo        | Descricao              |
| -------------- | ----------- | ---------------------- |
| id             | UUID        | PK                     |
| parent_user_id | UUID        | FK para auth.users     |
| code           | TEXT        | Codigo de 6 caracteres |
| expires_at     | TIMESTAMPTZ | Expira em 24h          |
| used_at        | TIMESTAMPTZ | Quando foi usado       |

### State Management

#### Kids Store (`store/kids-store.ts`)

```typescript
interface KidsState {
  isKidsMode: boolean
  kidsProfile: KidsProfile | null
  currentSession: KidsSession | null

  // Actions
  enableKidsMode: (parentUserId, childName, email, avatar) => Promise<boolean>
  disableKidsMode: (parentUserId) => Promise<boolean>
  startKidsSession: () => Promise<void>
  endKidsSession: () => Promise<void>
  trackVideoWatched: (videoId: string) => void
  trackAgentInteraction: (agentId: string) => void
}
```

#### useKids Hook (`hooks/use-kids.ts`)

Hook React que integra o store com a autenticacao da Agora:

```typescript
const {
  isKidsMode,
  childName,
  childAvatar,
  enableKidsMode,
  disableKidsMode,
  trackVideo,
  trackAgent,
  generateAccessCode,
  getTodayStats,
} = useKids()
```

---

## Componentes

### components/kids/

| Componente                | Descricao                                  |
| ------------------------- | ------------------------------------------ |
| `kids-header.tsx`         | Header simplificado com navegacao infantil |
| `kids-agent-card.tsx`     | Cards dos mentores Lobato e Tarsila        |
| `kids-video-card.tsx`     | Cards de video com visual ludico           |
| `kids-mode-toggle.tsx`    | Botao para ativar/desativar modo Kids      |
| `kids-setup-modal.tsx`    | Modal de configuracao inicial              |
| `kids-theme-provider.tsx` | Provider do tema vibrante                  |

---

## Paginas

### /pt/agora/kids/

| Rota                    | Descricao                |
| ----------------------- | ------------------------ |
| `/pt/agora/kids`        | Dashboard principal Kids |
| `/pt/agora/kids/videos` | Catalogo de videos       |
| `/pt/agora/kids/chat`   | Chat com mentores        |

### /pt/agora/pais/

| Rota                       | Descricao                  |
| -------------------------- | -------------------------- |
| `/pt/agora/pais`           | Login com codigo de acesso |
| `/pt/agora/pais/dashboard` | Dashboard parental         |

---

## Tema Visual

O tema Kids usa CSS Variables definidas em `app/globals.css`:

```css
.theme-kids {
  --primary: 0 73% 65%; /* Coral #FF6B6B */
  --secondary: 172 59% 56%; /* Turquesa #4ECDC4 */
  --accent: 51 100% 71%; /* Amarelo #FFE66D */
  --background: 30 100% 97%; /* Creme #FFF8F0 */
  --radius: 1.5rem; /* Bordas arredondadas */
}
```

Caracteristicas:

- Cores vibrantes e acolhedoras
- Bordas extra arredondadas
- Fontes maiores (base 18px)
- Botoes com efeito 3D
- Gradientes coloridos

---

## Agentes Kids

### Monteiro Lobato

- **ID**: `monteiro-lobato`
- **Papel**: Contador de Historias
- **Estilo**: Ensina atraves de narrativas e aventuras
- **Inspiracao**: Sitio do Picapau Amarelo

### Tarsila do Amaral

- **ID**: `tarsila-amaral`
- **Papel**: Artista Criativa
- **Estilo**: Ensina atraves de cores, formas e criatividade
- **Inspiracao**: Abaporu e arte moderna brasileira

---

## Videos Curados

Videos selecionados de canais educativos brasileiros:

1. O que e Programacao?
2. Pensamento Computacional para Criancas
3. Algoritmos: Receitas para o Computador
4. Meu Primeiro Projeto no Scratch
5. Logica de Programacao com Jogos
6. O que sao Variaveis?
7. Loops: Fazendo o Computador Repetir
8. Se... Entao: Tomando Decisoes
9. Criando Animacoes no Scratch
10. Criando um Jogo Completo

---

## Seguranca e Privacidade

### LGPD / COPPA

- Criancas nao tem dados coletados sem consentimento parental
- Modo Kids so ativa apos autenticacao do pai
- Tracking normal desabilitado
- Apenas tracking parental (enviado ao email do pai)

### Acesso Parental

- Codigo de 6 caracteres alfanumericos
- Expira em 24 horas
- Novo codigo gerado a cada solicitacao
- Acesso apenas via dashboard protegido

### Isolamento

- Perfil Kids separado do perfil do pai
- Sessoes rastreadas independentemente
- Dados nao compartilhados com terceiros

---

## Uso

### Ativar Modo Kids

```typescript
import { useKids } from '@/hooks/use-kids'

const { enableKidsMode } = useKids()

// Ao clicar no botao de ativar
await enableKidsMode('Maria', 'pai@email.com', 'tarsila')
```

### Verificar se esta no Modo Kids

```typescript
import { useKids } from '@/hooks/use-kids'

const { isKidsMode, childName } = useKids()

if (isKidsMode) {
  console.log(`Ola, ${childName}!`)
}
```

### Rastrear Atividades

```typescript
import { useKids } from '@/hooks/use-kids'

const { trackVideo, trackAgent } = useKids()

// Quando crianca assiste video
trackVideo('intro-programacao')

// Quando crianca interage com mentor
trackAgent('monteiro-lobato')
```

---

## Proximos Passos

1. **Email Diario**: Implementar job de envio de relatorios
2. **Mais Videos**: Expandir catalogo de conteudo
3. **Gamificacao Infantil**: Sistema de estrelas (sem competicao)
4. **Modo Offline**: Cache de videos para uso sem internet
5. **Feedback dos Pais**: Coleta de sugestoes para melhorias

---

## Referencias

- [Piaget - Desenvolvimento Cognitivo Infantil](https://pt.wikipedia.org/wiki/Jean_Piaget)
- [COPPA - Children's Online Privacy Protection Act](https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule)
- [LGPD - Lei Geral de Protecao de Dados](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Monteiro Lobato - Wikipedia](https://pt.wikipedia.org/wiki/Monteiro_Lobato)
- [Tarsila do Amaral - Wikipedia](https://pt.wikipedia.org/wiki/Tarsila_do_Amaral)
