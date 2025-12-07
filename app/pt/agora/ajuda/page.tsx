'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Tag,
  GraduationCap,
  HelpCircle,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer'

/**
 * Agora Help Center Page
 *
 * Copied from app/pt/app/ajuda/page.tsx and adapted for Agora.
 * Provides FAQ and help articles for the learning platform.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-07
 */

// Help categories specific to Agora
const agoraHelpCategories = [
  {
    id: 'getting-started',
    name: 'Primeiros Passos',
    description: 'Como comecar a usar a Agora',
    icon: '🚀',
    articles: 3,
  },
  {
    id: 'mentors',
    name: 'Mentores IA',
    description: 'Como interagir com os mentores',
    icon: '🤖',
    articles: 4,
  },
  {
    id: 'progress',
    name: 'Progresso e XP',
    description: 'Entenda o sistema de pontuacao',
    icon: '📊',
    articles: 3,
  },
  {
    id: 'content',
    name: 'Conteudos',
    description: 'Videos, leituras e trilhas',
    icon: '📚',
    articles: 4,
  },
  {
    id: 'community',
    name: 'Comunidade',
    description: 'Ranking e interacoes',
    icon: '👥',
    articles: 2,
  },
  {
    id: 'account',
    name: 'Conta e Configuracoes',
    description: 'Gerencie suas preferencias',
    icon: '⚙️',
    articles: 3,
  },
]

// Help articles for Agora
interface HelpArticle {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  helpful?: number
  notHelpful?: number
  relatedArticles?: string[]
}

const agoraHelpArticles: HelpArticle[] = [
  {
    id: 'what-is-agora',
    title: 'O que e a Agora?',
    description: 'Conheca a plataforma de aprendizado do Cidadao.AI',
    content: `# O que e a Agora?

A **Agora** e a plataforma de aprendizado do Cidadao.AI, inspirada na agora grega - o espaco publico onde cidadaos se reuniam para discutir e aprender.

## Funcionalidades Principais

- **Mentores IA**: Converse com especialistas virtuais sobre cidadania, politicas publicas e transparencia
- **Trilhas de Aprendizado**: Percursos estruturados para desenvolver suas habilidades civicas
- **Sistema de XP**: Ganhe pontos e suba de nivel conforme aprende
- **Diario de Bordo**: Registre seus aprendizados e reflexoes
- **Ranking**: Compare seu progresso com outros cidadaos

## Comece Agora

1. Complete o onboarding para personalizar sua experiencia
2. Escolha seu primeiro mentor para conversar
3. Explore as trilhas de aprendizado disponiveis
4. Acompanhe seu progresso no boletim`,
    category: 'getting-started',
    tags: ['introducao', 'agora', 'cidadania'],
    helpful: 42,
    notHelpful: 2,
  },
  {
    id: 'how-xp-works',
    title: 'Como funciona o sistema de XP?',
    description: 'Entenda como ganhar pontos e subir de nivel',
    content: `# Sistema de XP da Agora

O XP (Experience Points) e a moeda de progresso na Agora. Voce ganha XP ao participar ativamente da plataforma.

## Como Ganhar XP

| Atividade | XP |
|-----------|-----|
| Conversar com mentor | 10-50 XP |
| Completar uma licao | 25 XP |
| Assistir video completo | 15 XP |
| Fazer anotacao no diario | 10 XP |
| Completar trilha | 100 XP |
| Primeiro acesso diario | 5 XP |

## Niveis e Ranks

- **Novato** (0-100 XP): Comecando a jornada
- **Aprendiz** (101-500 XP): Desenvolvendo habilidades
- **Contribuidor** (501-2000 XP): Participante ativo
- **Mentor** (2001-5000 XP): Referencia na comunidade
- **Arquiteto** (5001+ XP): Lider e influenciador

## Dicas

- Acesse diariamente para ganhar bonus
- Complete trilhas inteiras para XP extra
- Participe ativamente nas conversas com mentores`,
    category: 'progress',
    tags: ['xp', 'pontos', 'nivel', 'ranking'],
    helpful: 38,
    notHelpful: 1,
    relatedArticles: ['ranking-explained'],
  },
  {
    id: 'talking-to-mentors',
    title: 'Como conversar com os mentores?',
    description: 'Dicas para aproveitar ao maximo as conversas',
    content: `# Conversando com Mentores IA

Os mentores da Agora sao agentes de IA especializados em diferentes areas da cidadania brasileira.

## Mentores Disponiveis

- **Tiradentes**: Historia e luta pela independencia
- **Dandara**: Resistencia e direitos sociais
- **Zumbi**: Igualdade racial e justica
- **Lampiao**: Questoes regionais do Nordeste
- **E muitos outros...**

## Dicas para Boas Conversas

1. **Seja especifico**: Faca perguntas claras e objetivas
2. **Contextualize**: Explique o que voce ja sabe sobre o tema
3. **Explore**: Peca exemplos praticos e casos reais
4. **Reflita**: Use o diario para registrar aprendizados

## Exemplo de Pergunta

Ao inves de perguntar "Me fale sobre politica", tente:
> "Quais sao os principais mecanismos de participacao cidada disponniveis no Brasil alem do voto?"`,
    category: 'mentors',
    tags: ['mentores', 'chat', 'ia', 'conversas'],
    helpful: 55,
    notHelpful: 3,
  },
  {
    id: 'ranking-explained',
    title: 'Como funciona o ranking?',
    description: 'Entenda a classificacao entre cidadaos',
    content: `# Ranking da Agora

O ranking mostra os cidadaos mais ativos e engajados na plataforma.

## Criterios de Classificacao

O ranking e baseado em:
- Total de XP acumulado
- Consistencia de acesso (dias seguidos)
- Diversidade de atividades
- Contribuicoes para a comunidade

## Tipos de Ranking

1. **Global**: Todos os usuarios da Agora
2. **Semanal**: Mais ativos na ultima semana
3. **Por Categoria**: Melhores em cada area

## Recompensas

Os primeiros colocados recebem:
- Badges especiais no perfil
- Acesso antecipado a novos conteudos
- Destaque na comunidade`,
    category: 'community',
    tags: ['ranking', 'classificacao', 'competicao'],
    helpful: 28,
    notHelpful: 1,
    relatedArticles: ['how-xp-works'],
  },
  {
    id: 'learning-paths',
    title: 'O que sao trilhas de aprendizado?',
    description: 'Conheca os percursos estruturados de estudo',
    content: `# Trilhas de Aprendizado

As trilhas sao percursos estruturados para desenvolver habilidades especificas de cidadania.

## Trilhas Disponiveis

- **Cidadania Basica**: Fundamentos dos direitos e deveres
- **Transparencia Publica**: Como acompanhar gastos publicos
- **Participacao Social**: Formas de influenciar politicas
- **Fiscalizacao Popular**: Ferramentas de controle cidadao

## Estrutura de uma Trilha

Cada trilha contem:
1. **Introducao**: Contexto e objetivos
2. **Modulos**: Unidades de conteudo
3. **Atividades**: Exercicios praticos
4. **Avaliacao**: Teste de conhecimento
5. **Certificado**: Comprovante de conclusao

## Dicas

- Complete uma trilha por vez para melhor aproveitamento
- Faca anotacoes no diario durante o estudo
- Converse com mentores sobre duvidas`,
    category: 'content',
    tags: ['trilhas', 'aprendizado', 'cursos'],
    helpful: 45,
    notHelpful: 2,
  },
  {
    id: 'journal-usage',
    title: 'Como usar o Diario de Bordo?',
    description: 'Registre e organize seus aprendizados',
    content: `# Diario de Bordo

O diario e seu espaco pessoal para registrar reflexoes e aprendizados.

## Funcionalidades

- **Anotacoes**: Registre pensamentos livremente
- **Tags**: Organize por temas
- **Datas**: Acompanhe sua evolucao ao longo do tempo
- **Exportacao**: Baixe suas anotacoes

## Sugestoes de Uso

1. **Apos conversas com mentores**: Registre os principais pontos
2. **Durante trilhas**: Anote duvidas e descobertas
3. **Reflexoes pessoais**: Como os aprendizados se aplicam a sua vida
4. **Metas**: Defina objetivos de estudo

## XP do Diario

Cada anotacao rende 10 XP! Manter o habito de registrar e recompensado.`,
    category: 'content',
    tags: ['diario', 'anotacoes', 'reflexoes'],
    helpful: 32,
    notHelpful: 0,
  },
]

const popularArticles = ['what-is-agora', 'how-xp-works', 'talking-to-mentors', 'learning-paths']

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando ajuda...</p>
      </div>
    </div>
  )
}

function AjudaContent() {
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)
  const [articleFeedback, setArticleFeedback] = useState<
    Record<string, 'helpful' | 'not-helpful' | null>
  >({})

  const filteredArticles = useMemo(() => {
    let articles = agoraHelpArticles

    if (selectedCategory) {
      articles = articles.filter((article) => article.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return articles
  }, [searchQuery, selectedCategory])

  const handleArticleFeedback = (articleId: string, feedback: 'helpful' | 'not-helpful') => {
    setArticleFeedback((prev) => ({
      ...prev,
      [articleId]: prev[articleId] === feedback ? null : feedback,
    }))
  }

  const buildUrl = (path: string) => `${path}${isDemoMode ? '?demo=true' : ''}`

  // Article detail view
  if (selectedArticle) {
    return (
      <div className="min-h-screen relative">
        {/* Background */}
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url('/operarios.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.03,
          }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />

        <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedArticle(null)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Central de Ajuda
          </Button>

          <GlassCard>
            <GlassCardContent className="p-8">
              <article className="prose dark:prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-2">{selectedArticle.title}</h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />5 min de leitura
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {selectedArticle.tags.join(', ')}
                  </span>
                </div>

                <MarkdownRenderer content={selectedArticle.content} />

                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">Este artigo foi util?</h3>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={
                        articleFeedback[selectedArticle.id] === 'helpful' ? 'success' : 'secondary'
                      }
                      size="sm"
                      onClick={() => handleArticleFeedback(selectedArticle.id, 'helpful')}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Sim (
                      {(selectedArticle.helpful || 0) +
                        (articleFeedback[selectedArticle.id] === 'helpful' ? 1 : 0)}
                      )
                    </Button>
                    <Button
                      variant={
                        articleFeedback[selectedArticle.id] === 'not-helpful'
                          ? 'destructive'
                          : 'secondary'
                      }
                      size="sm"
                      onClick={() => handleArticleFeedback(selectedArticle.id, 'not-helpful')}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Nao (
                      {(selectedArticle.notHelpful || 0) +
                        (articleFeedback[selectedArticle.id] === 'not-helpful' ? 1 : 0)}
                      )
                    </Button>
                  </div>
                </div>

                {selectedArticle.relatedArticles && selectedArticle.relatedArticles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Artigos Relacionados</h3>
                    <div className="grid gap-2">
                      {selectedArticle.relatedArticles.map((articleId) => {
                        const relatedArticle = agoraHelpArticles.find((a) => a.id === articleId)
                        if (!relatedArticle) return null
                        return (
                          <GlassCard
                            key={articleId}
                            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedArticle(relatedArticle)}
                          >
                            <h4 className="font-medium">{relatedArticle.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {relatedArticle.description}
                            </p>
                          </GlassCard>
                        )
                      })}
                    </div>
                  </div>
                )}
              </article>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    )
  }

  // Main help center view
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03,
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={buildUrl('/pt/agora')}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  Central de Ajuda
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tire suas duvidas sobre a Agora
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Como podemos ajudar voce hoje?
          </h2>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar artigos de ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
            />
          </div>
        </div>

        {!searchQuery && !selectedCategory && (
          <>
            {/* Popular Articles */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Artigos Populares
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {popularArticles.map((articleId) => {
                  const article = agoraHelpArticles.find((a) => a.id === articleId)
                  if (!article) return null
                  return (
                    <GlassCard
                      key={articleId}
                      className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                      <p className="text-muted-foreground">{article.description}</p>
                      <div className="flex gap-2 mt-4">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Categorias</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agoraHelpCategories.map((category) => (
                  <GlassCard
                    key={category.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {category.articles} artigos →
                    </p>
                  </GlassCard>
                ))}
              </div>
            </div>
          </>
        )}

        {(searchQuery || selectedCategory) && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCategory
                  ? agoraHelpCategories.find((c) => c.id === selectedCategory)?.name
                  : `Resultados para "${searchQuery}"`}
              </h2>
              {selectedCategory && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para categorias
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <GlassCard
                    key={article.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                    <p className="text-muted-foreground mb-4">{article.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Ler mais →
                      </span>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">Nenhum artigo encontrado.</p>
                  <Button
                    variant="ghost"
                    className="mt-4 text-green-600 hover:text-green-700"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory(null)
                    }}
                  >
                    Limpar busca
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {!searchQuery && !selectedCategory && (
          <GlassCard className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Nao encontrou o que procurava?</h3>
            <p className="text-muted-foreground mb-4">
              Converse com um mentor ou acesse o chat para tirar suas duvidas
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={buildUrl('/pt/agora/chat')}>
                <Button variant="primary">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Falar com Mentor
                </Button>
              </Link>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

export default function AgoraAjudaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AjudaContent />
    </Suspense>
  )
}
