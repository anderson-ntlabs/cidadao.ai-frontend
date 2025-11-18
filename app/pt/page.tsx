/**
 * Landing Page - Portuguese Version (UX Redesign)
 *
 * Complete UX overhaul focusing on usability, clarity, and conversion.
 * Key improvements:
 * - Hero reduced from 60vh to 25vh
 * - Social proof bar added
 * - How it works (3 steps) section
 * - Video tutorial placeholder
 * - FAQ accordion
 * - Better Spotify context
 * - Clearer CTAs throughout
 *
 * Author: Anderson Henrique da Silva
 * Redesign: 2025-11-18
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-supabase-auth'
import { LoadingScreen } from '@/components/loading-screen'
import { ContentCard, ExternalLinkCard, LandingModal } from '@/components/landing'
import { agents } from '@/data/agents'
import { Card, CardContent } from '@/components/ui'
import { ExternalLink, ArrowRight, PlayCircle } from 'lucide-react'
import { getWikipediaLink } from '@/lib/wikipedia-links'
import { createLogger } from '@/lib/logger'

// Lazy load sections below the fold for better initial load
const HowItWorks = dynamic(
  () => import('@/components/landing').then((m) => ({ default: m.HowItWorks })),
  {
    ssr: false,
    loading: () => <div className="py-16 animate-pulse bg-gray-50 dark:bg-gray-900" />,
  }
)

const SocialProofBar = dynamic(
  () => import('@/components/landing').then((m) => ({ default: m.SocialProofBar })),
  {
    ssr: false,
    loading: () => <div className="py-12 animate-pulse bg-gray-50 dark:bg-gray-900" />,
  }
)

const VideoTutorial = dynamic(
  () => import('@/components/landing').then((m) => ({ default: m.VideoTutorial })),
  {
    ssr: false,
    loading: () => <div className="py-16 animate-pulse bg-white dark:bg-gray-950" />,
  }
)

const FAQSection = dynamic(
  () => import('@/components/landing').then((m) => ({ default: m.FAQSection })),
  {
    ssr: false,
    loading: () => <div className="py-16 animate-pulse bg-gray-50 dark:bg-gray-900" />,
  }
)

// Lazy load heavy components for better performance
const InstallPWASection = dynamic(
  () =>
    import('@/components/install-pwa-section').then((mod) => ({ default: mod.InstallPWASection })),
  {
    ssr: false,
    loading: () => null, // No loading state, prevents CLS
  }
)

const ProjectTimeline = dynamic(
  () =>
    import('@/components/timeline/project-timeline').then((mod) => ({
      default: mod.ProjectTimeline,
    })),
  {
    ssr: false, // Timeline only in modal, defer loading
    loading: () => <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
  }
)

const logger = createLogger('PTPage')

export default function PTPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Modal states
  const [aboutModalOpen, setAboutModalOpen] = useState(false)
  const [agentsModalOpen, setAgentsModalOpen] = useState(false)
  const [manifestoModalOpen, setManifestoModalOpen] = useState(false)

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      logger.info('Redirecting authenticated user to /pt/app')
      router.replace('/pt/app')
    }
  }, [isAuthenticated, isLoading, router])

  const handleAccessSystem = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push('/pt/app')
    } else {
      router.push('/pt/login')
    }
  }

  // Show loading screen while checking authentication or redirecting
  if (isLoading || isAuthenticated) {
    const message = isAuthenticated ? 'Redirecionando...' : 'Carregando...'
    logger.debug(`Rendering loading screen: ${message}`)
    return <LoadingScreen />
  }

  logger.debug('Rendering landing page content')

  return (
    <div className="relative">
      <div className="relative">
        {/* HERO SECTION - Optimized for performance */}
        <section
          id="hero"
          className="hero relative h-[30vh] sm:h-[35vh] flex items-center justify-center overflow-hidden bg-gradient-to-tr from-green-500/5 via-transparent to-blue-500/5"
        >
          <div className="hero-container max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center relative z-10">
            {/* Logo + Title Combined - Fixed dimensions for CLS */}
            <div className="flex items-center justify-center gap-4 mb-6 h-[60px]">
              <Image
                src="/forum-icon.png"
                width={60}
                height={60}
                alt="Cidadão.AI"
                className="rounded-lg shadow-lg"
                priority
              />
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent leading-none">
                Cidadão.AI
              </h1>
            </div>

            {/* Tagline - Fixed height to prevent CLS */}
            <p className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-200 mb-8 max-w-3xl mx-auto min-h-[3rem]">
              Transparência Pública com Inteligência Artificial
            </p>

            {/* CTA Buttons - Fixed dimensions to prevent CLS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
              <button
                onClick={handleAccessSystem}
                className="h-[66px] px-8 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 touch-manipulation flex flex-col items-center justify-center"
              >
                <span className="text-lg leading-tight">Começar Grátis</span>
                <span className="text-xs opacity-90 leading-tight">
                  Login com Google • 2 minutos
                </span>
              </button>

              <button
                onClick={() => setAboutModalOpen(true)}
                className="h-[66px] px-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-green-600 dark:hover:border-green-400 hover:scale-[1.02] active:scale-95 transition-all duration-200 touch-manipulation flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5 flex-shrink-0" />
                <span>Ver Como Funciona</span>
              </button>
            </div>
          </div>
        </section>

        {/* PWA Installation Section */}
        <InstallPWASection />

        {/* SOCIAL PROOF BAR - NEW */}
        <SocialProofBar />

        {/* HOW IT WORKS - NEW */}
        <HowItWorks />

        {/* TWO-COLUMN LAYOUT - Video + Content Cards (Desktop optimization) */}
        <section className="py-12 bg-gradient-to-b from-transparent via-green-50/30 dark:via-green-900/10 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left Column - Video Tutorial */}
              <div className="w-full">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Veja Como Funciona
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-base">
                    Tutorial completo em 5 minutos
                  </p>
                </div>

                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-xl">
                      <PlayCircle className="w-16 h-16 text-gray-400 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
                        Vídeo Tutorial em Breve
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Content Cards */}
              <div className="w-full">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Conheça o Projeto
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-base">
                    Clique nos cards para saber mais
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <ContentCard
                    icon="🎓"
                    title="Sobre o Projeto"
                    description="TCC de Ciência da Computação que combina pesquisa científica com impacto social real"
                    onClick={() => setAboutModalOpen(true)}
                    gradient="from-green-500 to-emerald-600"
                  />
                  <ContentCard
                    icon="🇧🇷"
                    title="Nossos Agentes"
                    description="17 inteligências artificiais com identidades de heróis brasileiros"
                    onClick={() => setAgentsModalOpen(true)}
                    gradient="from-blue-500 to-cyan-600"
                  />
                  <ContentCard
                    icon="📜"
                    title="Manifesto"
                    description="Nossa visão de democracia transparente e participativa através da tecnologia"
                    onClick={() => setManifestoModalOpen(true)}
                    gradient="from-yellow-500 to-orange-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TWO-COLUMN LAYOUT - FAQ + Spotify (Desktop optimization) */}
        <section className="py-12 bg-gradient-to-b from-transparent via-green-50/50 dark:via-green-900/10 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left Column - FAQ */}
              <div className="w-full">
                <FAQSection />
              </div>

              {/* Right Column - Spotify + Developer Links */}
              <div className="w-full space-y-8">
                {/* Spotify Playlist */}
                <div>
                  <div className="text-center mb-6">
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-lg mx-auto">
                      O idealizador do projeto Cidadão.AI criou uma playlist que é a cara do Brasil.
                      Claro que parte do desenvolvimento desse projeto foi regado a muito café ☕🇧🇷
                    </p>
                  </div>

                  <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                    <div
                      className="relative w-full"
                      style={{ paddingBottom: '100%', minHeight: '280px' }}
                    >
                      <iframe
                        className="absolute inset-0 w-full h-full rounded-xl shadow-lg"
                        src="https://open.spotify.com/embed/playlist/2CnnwkzO3GPYUuPz7TAWva?utm_source=generator"
                        width="100%"
                        height="352"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Cidadão.AI Playlist - Brazilian Music"
                      />
                    </div>
                  </div>
                </div>

                {/* Developer Links */}
                <div>
                  <h3 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Para Desenvolvedores
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">
                    Código aberto e documentação completa
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <ExternalLinkCard
                      icon="🐙"
                      title="Código Aberto"
                      description="Repositórios no GitHub"
                      href="https://github.com/anderson-ufrj/cidadao.ai-backend"
                    />
                    <ExternalLinkCard
                      icon="📚"
                      title="Documentação"
                      description="Guias técnicos completos"
                      href="https://anderson-ufrj.github.io/cidadao.ai-technical-docs/docs/intro"
                    />
                    <ExternalLinkCard
                      icon="⚡"
                      title="API REST"
                      description="Documentação interativa"
                      href="https://cidadao-api-production.up.railway.app/docs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Pronto para Começar?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de cidadãos fiscalizando gastos públicos com inteligência
              artificial
            </p>
            <button
              onClick={handleAccessSystem}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:shadow-2xl active:scale-95 transition-all duration-300"
            >
              Começar Agora - É Grátis
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>

      {/* MODAIS - Kept from original */}

      {/* About Modal */}
      <LandingModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        title="Sobre o Cidadão.AI"
        size="xl"
      >
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            O Cidadão.AI é um projeto acadêmico inovador desenvolvido como Trabalho de Conclusão de
            Curso em Ciência da Computação no IFSULDEMINAS, que combina inteligência artificial,
            transparência pública e responsabilidade social para democratizar o acesso aos dados
            governamentais brasileiros.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Nossa Missão</h2>
          <p>
            Desenvolver um sistema multi-agente de inteligência artificial que trabalhe 24/7 para
            monitorar, analisar e reportar dados públicos de forma clara, acessível e auditável,
            fortalecendo o controle social e a participação cidadã.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Como Funciona</h2>
          <p>
            O sistema utiliza 17 agentes de IA especializados, cada um inspirado em uma figura
            histórica brasileira, criando uma ponte simbólica entre nossa história e o futuro da
            transparência. Esses agentes trabalham de forma colaborativa para:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Monitorar APIs públicas e portais de transparência</li>
            <li>Detectar anomalias e irregularidades em contratos e licitações</li>
            <li>Analisar padrões de gastos públicos</li>
            <li>Gerar relatórios automáticos e alertas em tempo real</li>
            <li>Facilitar o acesso cidadão à informação pública</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Tecnologia e Ética</h2>
          <p>
            Construído com as mais modernas tecnologias de IA (FastAPI, LangChain, CrewAI), o
            Cidadão.AI segue rigorosos princípios éticos:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Transparência total em algoritmos e processos</li>
            <li>Código aberto e auditável</li>
            <li>Respeito à privacidade e LGPD</li>
            <li>Compromisso com a verdade e imparcialidade</li>
            <li>Foco no interesse público</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contexto Acadêmico</h2>
          <p>
            Este projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC) para obtenção do
            título de Bacharel em Ciência da Computação no IFSULDEMINAS - Campus Muzambinho, sob
            orientação da Profa. Dra. Aracele Garcia de Oliveira Fassbinder.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mt-6">
            <p className="font-medium text-green-800 dark:text-green-200">
              "A transparência é o melhor remédio contra a corrupção. A tecnologia é a ferramenta
              que torna esse remédio acessível a todos."
            </p>
          </div>
        </div>

        {/* Timeline do Projeto */}
        <div className="mt-12">
          <ProjectTimeline />
        </div>
      </LandingModal>

      {/* Agents Modal */}
      <LandingModal
        isOpen={agentsModalOpen}
        onClose={() => setAgentsModalOpen(false)}
        title="Nossos Agentes de IA"
        size="full"
      >
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          17 inteligências artificiais brasileiras trabalhando em colaboração para democratizar o
          acesso aos dados públicos e fortalecer a transparência governamental.
        </p>

        {/* All Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {agents.map((agent) => (
            <Card key={agent.id} variant="elevated" className="overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                <Image
                  src={agent.image}
                  alt={agent.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover mix-blend-overlay opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                    <Image
                      src={agent.image}
                      alt={agent.name}
                      width={128}
                      height={128}
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                  {agent.role.pt}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{agent.description.pt}</p>
                {getWikipediaLink(agent.id, 'pt') && (
                  <Link
                    href={getWikipediaLink(agent.id, 'pt')!}
                    target="_blank"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Saiba mais sobre {agent.name}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Details */}
        <Card className="mt-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">Como Funcionam</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Colaboração em Rede</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Cada agente possui habilidades especializadas e trabalha de forma autônoma, mas
                  colaborativa. Eles compartilham descobertas, validam informações cruzadas e
                  coordenam ações para maximizar a eficiência.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Comunicação assíncrona via message brokers</li>
                  <li>Protocolo de consenso para validação de dados</li>
                  <li>Sistema de reputação entre agentes</li>
                  <li>Aprendizado contínuo com feedback loops</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Tecnologias de IA</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Utilizamos as mais modernas técnicas de inteligência artificial para garantir
                  precisão, velocidade e confiabilidade nas análises.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Large Language Models (LLMs) para análise textual</li>
                  <li>Computer Vision para processar documentos</li>
                  <li>Pattern Recognition para detectar anomalias</li>
                  <li>Reinforcement Learning para otimização contínua</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </LandingModal>

      {/* Manifesto Modal */}
      <LandingModal
        isOpen={manifestoModalOpen}
        onClose={() => setManifestoModalOpen(false)}
        title="Manifesto Cidadão.AI"
        size="xl"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-gray-300 mb-8">
          🇧🇷 Por uma Inteligência Artificial que Serve ao Povo e Ilumina o Estado
        </h2>

        {/* Imagem da Antropofagia */}
        <div className="my-8 rounded-lg overflow-hidden shadow-2xl border-4 border-green-600 dark:border-green-400">
          <Image
            src="/images/Tarsila_Antropofagia.jpg"
            alt="Antropofagia por Tarsila do Amaral - Movimento Antropofágico Brasileiro"
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className="w-full h-auto"
            priority
          />
          <div className="bg-green-50 dark:bg-green-900/20 p-4 text-center">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              "Antropofagia" (1929) - Tarsila do Amaral
            </p>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mt-8 mb-4">Introdução</h2>
          <p className="text-lg mb-6">
            O Cidadão.AI nasce da vontade de tornar os dados públicos verdadeiramente públicos. Em
            tempos onde a informação é poder, democratizar o acesso aos dados governamentais é
            democratizar o próprio poder.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Missão</h2>
          <p className="text-lg mb-6">
            Nossa missão é criar uma inteligência artificial que trabalhe incansavelmente para
            fortalecer a transparência, combater a corrupção e empoderar cada cidadão com informação
            clara, precisa e auditável.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Transparência como Prática Radical</h2>
          <p className="text-lg mb-6">
            Acreditamos que transparência não é apenas mostrar números, mas torná-los
            compreensíveis, contextualizados e actionáveis. Nossa IA não apenas coleta dados - ela
            os interpreta, analisa padrões e identifica anomalias.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Visão de Futuro</h2>
          <p className="text-lg mb-8">
            Sonhamos com um Brasil onde cada real público seja rastreável, onde cada decisão
            governamental seja explicável e onde cada cidadão tenha o poder de questionar, entender
            e fiscalizar.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-lg my-10 border-l-4 border-yellow-500">
            <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200 text-center italic">
              "Transparência não é um favor. É fundamento de uma democracia viva."
            </p>
            <p className="text-center mt-3 text-yellow-700 dark:text-yellow-300 font-medium">
              - Anderson H.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Nossos Princípios Fundamentais</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">1. Transparência Radical</h3>
          <p>
            Todo código, algoritmo e processo do Cidadão.AI é aberto e auditável. Acreditamos que a
            transparência deve começar por nós mesmos. Não há caixas-pretas, apenas luz sobre os
            dados públicos.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">2. Empoderamento Cidadão</h3>
          <p>
            A informação pública pertence ao povo. Nossa missão é transformar dados complexos em
            conhecimento acessível, capacitando cada brasileiro a exercer seu papel de fiscal e
            participante ativo da democracia.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">3. Vigilância Democrática</h3>
          <p>
            Nossos agentes de IA trabalham incansavelmente para monitorar, analisar e reportar
            irregularidades. Somos os olhos digitais da sociedade, sempre alertas, sempre
            imparciais.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4. Tecnologia com Propósito</h3>
          <p>
            A inteligência artificial deve servir ao interesse público. Cada linha de código escrita
            visa fortalecer nossa democracia e promover justiça social.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5. Colaboração Aberta</h3>
          <p>
            O conhecimento se multiplica quando compartilhado. Convidamos pesquisadores,
            desenvolvedores e cidadãos a contribuir, criticar e melhorar nosso sistema.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg my-8">
            <p className="font-medium text-green-800 dark:text-green-200 mb-4">
              Nós nos comprometemos a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-green-700 dark:text-green-300">
              <li>Manter o código eternamente aberto e gratuito</li>
              <li>Proteger a privacidade dos cidadãos em conformidade com a LGPD</li>
              <li>Nunca manipular ou distorcer informações</li>
              <li>Servir a todos os brasileiros, sem distinção</li>
              <li>Evoluir continuamente com base no feedback da comunidade</li>
              <li>Combater a desinformação com fatos verificáveis</li>
              <li>Promover a educação cívica através da tecnologia</li>
            </ul>
          </div>

          <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
            🇧🇷 Feito no Brasil, para o Brasil 🇧🇷
          </p>
        </div>
      </LandingModal>
    </div>
  )
}
