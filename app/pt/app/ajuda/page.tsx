'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowLeft, ThumbsUp, ThumbsDown, Clock, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button, Input, Badge, Card } from '@/components/ui'
import { helpCategories, helpArticles, popularArticles, type HelpArticle } from '@/data/help-center'
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer'

export default function HelpCenterPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)
  const [articleFeedback, setArticleFeedback] = useState<
    Record<string, 'helpful' | 'not-helpful' | null>
  >({})

  const filteredArticles = useMemo(() => {
    let articles = helpArticles

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

  if (selectedArticle) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Central de Ajuda
        </Button>

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
            <h3 className="text-lg font-semibold mb-4">Este artigo foi útil?</h3>
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
                Não (
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
                  const relatedArticle = helpArticles.find((a) => a.id === articleId)
                  if (!relatedArticle) return null
                  return (
                    <Card
                      key={articleId}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedArticle(relatedArticle)}
                    >
                      <h4 className="font-medium">{relatedArticle.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {relatedArticle.description}
                      </p>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </article>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Central de Ajuda</h1>
          <p className="text-xl text-muted-foreground mb-8">Como podemos ajudar você hoje?</p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar artigos de ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {!searchQuery && !selectedCategory && (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Artigos Populares</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {popularArticles.map((articleId) => {
                  const article = helpArticles.find((a) => a.id === articleId)
                  if (!article) return null
                  return (
                    <Card
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
                    </Card>
                  )
                })}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Categorias</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {helpCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <p className="text-sm font-medium text-primary">
                      {category.articles} artigos →
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {(searchQuery || selectedCategory) && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory
                  ? helpCategories.find((c) => c.id === selectedCategory)?.name
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
                  <Card
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
                      <span className="text-sm text-primary font-medium">Ler mais →</span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">Nenhum artigo encontrado.</p>
                  <Button
                    variant="ghost"
                    className="mt-4 text-blue-600 hover:text-blue-700"
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
          <div className="mt-12 p-8 bg-muted rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Não encontrou o que procurava?</h3>
            <p className="text-muted-foreground mb-4">
              Entre em contato com nosso suporte ou acesse o chat
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/pt/chat')}>Abrir Chat</Button>
              <Button variant="secondary">Falar com Suporte</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
