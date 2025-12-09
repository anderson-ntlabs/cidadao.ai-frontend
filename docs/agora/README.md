# Agora Academy - Documentacao Completa

> **Plataforma de Aprendizagem Gamificada do Cidadao.AI**
> **Feito por alunos, para alunos**

[![Status](https://img.shields.io/badge/Status-Beta-yellow)]()
[![Versao](https://img.shields.io/badge/Versao-1.0.0-blue)]()
[![Licenca](https://img.shields.io/badge/Licenca-MIT-green)]()

---

## Visao Geral

A **Agora Academy** e uma plataforma de aprendizagem gamificada projetada para capacitar desenvolvedores brasileiros em tecnologias modernas (Backend, Frontend, IA/ML, DevOps) atraves de contribuicoes reais ao projeto open-source Cidadao.AI.

### Parceria Institucional

- **Neural Thinker AI Engineering** - Mentoria tecnica e manutencao
- **IFSULDEMINAS/LabSoft** - Orientacao academica e validacao pedagogica
- **Profa. Dra. Aracele Fassbinder** - Coordenacao academica

### Missao

> Democratizar o acesso a educacao tecnologica de qualidade atraves de uma experiencia de aprendizagem pratica, gamificada e culturalmente relevante para o contexto brasileiro.

### Valores Pedagogicos

1. **Aprender Fazendo** - Contribuicao real em projeto open-source
2. **Mentoria Acessivel** - Agentes de IA disponiveis 24/7
3. **Reconhecimento** - Sistema de XP, badges e certificados
4. **Inclusao** - Acessibilidade WCAG AAA e VLibras

---

## Sistema de Progressao

```
Novato (0-100 XP) -> Aprendiz (100-500 XP) -> Contribuidor (500-2000 XP) -> Mentor (2000-5000 XP) -> Arquiteto (5000+ XP)
```

## Trilhas Disponiveis

| Trilha         | Tecnologias                     | Nivel            | XP Total |
| -------------- | ------------------------------- | ---------------- | -------- |
| **Introducao** | Plataforma, GitHub, Agentes     | Iniciante        | 500      |
| **Backend**    | Python, FastAPI, PostgreSQL     | Basico em Python | 2000     |
| **Frontend**   | Next.js, React, Tailwind        | Basico em JS/CSS | 2000     |
| **IA/ML**      | DSPy, LangChain, Transformers   | Intermediario    | 2500     |
| **DevOps**     | Docker, GitHub Actions, Grafana | Basico em Linux  | 2000     |

---

## Indice da Documentacao

### 01. Fundamentos

- [Visao e Missao](./01-fundamentos/visao-missao.md)
- [Publico-Alvo](./01-fundamentos/publico-alvo.md)
- [Glossario de Termos](./01-fundamentos/glossario.md)

### 02. Pedagogia

- [Referencial Teorico](./02-pedagogia/referencial-teorico.md)
- [Metodologia de Ensino](./02-pedagogia/metodologia.md)
- [Objetivos de Aprendizagem](./02-pedagogia/objetivos-aprendizagem.md)
- [Taxonomia de Bloom Aplicada](./02-pedagogia/taxonomia-bloom.md)

### 03. Gamificacao

- [Sistema de XP e Niveis](./03-gamificacao/xp-niveis.md)
- [Badges e Conquistas](./03-gamificacao/badges.md)
- [Desafios e Missoes](./03-gamificacao/desafios.md)
- [Ranking e Competicao](./03-gamificacao/ranking.md)
- [Psicologia da Gamificacao](./03-gamificacao/psicologia.md)

### 04. Trilhas de Aprendizagem

- [Visao Geral das Trilhas](./04-trilhas/visao-geral.md)
- [Trilha: Introducao](./04-trilhas/introducao.md)
- [Trilha: Backend](./04-trilhas/backend.md)
- [Trilha: Frontend](./04-trilhas/frontend.md)
- [Trilha: IA/ML](./04-trilhas/ia-ml.md)
- [Trilha: DevOps](./04-trilhas/devops.md)
- [Design Instrucional](./04-trilhas/design-instrucional.md)

### 05. Avaliacao

- [Modelo de Avaliacao](./05-avaliacao/modelo-avaliacao.md)
- [Quizzes e Exercicios](./05-avaliacao/quizzes.md)
- [Rubricas de Projetos](./05-avaliacao/rubricas.md)
- [Certificacao](./05-avaliacao/certificacao.md)

### 06. Arquitetura Tecnica

- [Visao Geral da Arquitetura](./06-arquitetura/visao-geral.md)
- [Componentes e Hooks](./06-arquitetura/componentes.md)
- [Estado e Store](./06-arquitetura/estado.md)
- [Banco de Dados](./06-arquitetura/banco-dados.md)
- [Integracao com Backend](./06-arquitetura/integracao.md)

### 07. Acessibilidade

- [Conformidade WCAG](./07-acessibilidade/wcag.md)
- [VLibras e LIBRAS](./07-acessibilidade/vlibras.md)
- [Design Inclusivo](./07-acessibilidade/design-inclusivo.md)

### 08. Roadmap

- [Roadmap 2025-2026](./08-roadmap/roadmap-geral.md)
- [Features Propostas](./08-roadmap/features-propostas.md)
- [Melhorias Pedagogicas](./08-roadmap/melhorias-pedagogicas.md)
- [Visao de Produto](./08-roadmap/visao-produto.md)

### 09. API e Integracao

- [Endpoints da Agora](./09-api/endpoints.md)
- [Server Actions](./09-api/server-actions.md)
- [Supabase Schema](./09-api/supabase-schema.md)

### 10. Guias

- [Guia do Estudante](./10-guias/guia-estudante.md)
- [Guia do Mentor](./10-guias/guia-mentor.md)
- [Guia do Desenvolvedor](./10-guias/guia-desenvolvedor.md)
- [FAQ](./10-guias/faq.md)

---

## Quick Start

### Para Estudantes

```bash
1. Acesse /pt/agora/login
2. Autentique com GitHub
3. Complete o onboarding (4 passos)
4. Escolha sua trilha de aprendizagem
5. Comece a ganhar XP!
```

### Para Desenvolvedores

```bash
# Clone o repositorio
git clone https://github.com/anderson-ufrj/cidadao.ai-frontend.git

# Instale dependencias
npm install

# Configure variaveis de ambiente
cp .env.example .env.local

# Inicie o servidor de desenvolvimento
npm run dev

# Acesse a Agora
open http://localhost:3000/pt/agora
```

---

## Metricas do Sistema

| Metrica                   | Valor Atual | Meta  |
| ------------------------- | ----------- | ----- |
| Trilhas disponiveis       | 5           | 8     |
| Badges implementados      | 13          | 25    |
| Cobertura de testes       | ~50%        | 80%   |
| Score WCAG                | AA          | AAA   |
| Tempo medio de onboarding | 5 min       | 3 min |

---

## Links Uteis

- [Cidadao.AI API](https://cidadao-api-production.up.railway.app/)
- [Documentacao API](https://cidadao-api-production.up.railway.app/docs)
- [HuggingFace Space](https://neural-thinker-cidadao-ai-backend.hf.space/)
- [LabSoft IFSULDEMINAS](https://integra.ifsuldeminas.edu.br/)

---

## Contribuindo

Veja o [Guia do Desenvolvedor](./10-guias/guia-desenvolvedor.md) para informacoes sobre como contribuir com a documentacao e o codigo da Agora Academy.

---

## Referencias

- [Design Science Research](../dsr/)
- [CLAUDE.md do Projeto](../../CLAUDE.md)
- [Documentacao Geral](../)

---

**Mantido por**: Anderson Henrique da Silva
**Parceria**: Neural Thinker AI Engineering + IFSULDEMINAS/LabSoft
**Ultima atualizacao**: 2025-12-09

## Licenca

MIT License - Veja [LICENSE](../../LICENSE) para detalhes.
