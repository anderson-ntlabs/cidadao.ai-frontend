/**
 * Landing Page - Portuguese Version (Performance Optimized)
 *
 * Server Component optimized for performance:
 * - No client-side JavaScript for initial render
 * - Static generation for better TTFB
 * - Optimized images with priority loading
 * - Fixed dimensions to prevent CLS
 * - Minimal client components
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-11-21
 */

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { LandingClientWrapper } from '@/components/landing/landing-client-wrapper'
import { FAQSection } from '@/components/landing/faq-section'
import { ResearchNotesCardLazy } from '@/components/landing/research-notes-card-lazy'

// Export metadata for better SEO
export { metadata } from './metadata'

export default function PTPageOptimized(): JSX.Element {
  return (
    <div className="relative">
      {/* HERO SECTION - Static with fixed dimensions to prevent CLS */}
      <section
        id="hero"
        className="hero relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-500/10 via-blue-500/5 to-yellow-500/10"
        style={{ height: '70vh', minHeight: '600px' }}
      >
        {/* Background Pattern - CSS only, no JS */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,255,0,0.05) 35px, rgba(0,255,0,0.05) 70px)`,
            }}
          />
        </div>

        <div className="hero-container max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Logo + Title - Fixed sizes to prevent CLS */}
          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            <div className="w-[100px] h-[100px] relative">
              <Image
                src="/forum-icon.png"
                width={100}
                height={100}
                alt="Cidadão.AI"
                className="rounded-2xl shadow-2xl ring-4 ring-white/20"
                priority
                quality={85}
              />
            </div>
            <div className="flex flex-col items-center gap-3">
              <h1
                className="text-5xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent leading-tight"
                style={{ backgroundSize: '200% 200%' }}
              >
                Cidadão.AI
              </h1>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-bold shadow-lg animate-pulse">
                v2.0 — Neural Labs
              </span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100 mb-4 max-w-4xl mx-auto">
            Transparência Pública com Inteligência Artificial
          </p>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            20 agentes de IA monitorando gastos públicos 24/7 para proteger seus direitos
          </p>

          {/* CTA Buttons - Server-rendered links */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch sm:items-center max-w-lg sm:max-w-none mx-auto">
            <a
              href="https://cidadaoai-production.up.railway.app/login"
              className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden inline-block text-center"
            >
              <span className="relative z-10 flex flex-col items-center">
                <span className="text-xl flex items-center gap-2">
                  Acessar Sistema 2.0{' '}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-sm opacity-90 mt-1">
                  100% Gratuito — Powered by Neural Labs
                </span>
              </span>
            </a>

            <Link
              href="/pt/about"
              className="group px-10 py-5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-bold text-lg text-gray-700 dark:text-gray-300 hover:border-green-500 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              <span>Saiba Mais</span>
            </Link>
          </div>

          {/* Trust Indicators - Static */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Código Aberto
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> LGPD Compliant
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Dados Oficiais
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Sem anúncios
            </span>
          </div>
        </div>
      </section>

      {/* MAIN FEATURES - Static content */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Inteligência artificial brasileira fiscalizando o governo 24 horas por dia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Static Cards */}
            <Link
              href="/pt/about"
              className="block p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/20 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2">Sobre o Projeto</h3>
              <p className="text-gray-600 dark:text-gray-400">
                TCC de Ciência da Computação que combina pesquisa científica com impacto social real
              </p>
            </Link>

            <Link
              href="/pt/agents"
              className="block p-6 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-xl border border-blue-500/20 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🇧🇷</div>
              <h3 className="text-xl font-bold mb-2">20 Agentes de IA</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Inteligências artificiais com identidades de heróis brasileiros trabalhando juntas
              </p>
            </Link>

            <Link
              href="/pt/manifesto"
              className="block p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 rounded-xl border border-yellow-500/20 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-xl font-bold mb-2">Nosso Manifesto</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visão de democracia transparente e participativa através da tecnologia
              </p>
            </Link>

            <Link
              href="/pt/agora/login"
              className="block p-6 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 rounded-xl border border-purple-500/20 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold mb-2">Ágora</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Plataforma de capacitação em IA e transparência pública com gamificação
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Static Steps */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Como Usar</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Comece a fiscalizar em 3 passos simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Crie sua Conta</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Login rápido com Google em menos de 30 segundos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Faça Perguntas</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Pergunte sobre gastos, contratos ou qualquer dado público
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Receba Análises</h3>
              <p className="text-gray-600 dark:text-gray-400">
                IA analisa milhões de dados e entrega respostas claras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + SPOTIFY SECTION - Two Column Layout */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - FAQ */}
            <div className="w-full">
              <FAQSection />
            </div>

            {/* Right Column - Spotify Playlist */}
            <div className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Playlist do Projeto
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-lg mx-auto">
                  O idealizador do Cidadão.AI criou uma playlist que é a cara do Brasil. Parte do
                  desenvolvimento foi regado a muito café e boa música!
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 shadow-xl">
                <iframe
                  className="w-full rounded-xl shadow-lg"
                  src="https://open.spotify.com/embed/playlist/2CnnwkzO3GPYUuPz7TAWva?utm_source=generator&theme=0"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Cidadao.AI Playlist - Brazilian Music"
                />
              </div>

              {/* Developer Links - Below Spotify */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-center mb-4">Para Desenvolvedores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <a
                    href="https://github.com/anderson-ntlabs/cidadao.ai-backend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
                  >
                    <div className="text-2xl mb-2">🐙</div>
                    <h4 className="text-sm font-bold flex items-center justify-center gap-1">
                      GitHub <ExternalLink className="w-3 h-3" />
                    </h4>
                  </a>

                  <a
                    href="https://anderson-ntlabs.github.io/cidadao.ai-technical-docs/docs/intro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <h4 className="text-sm font-bold flex items-center justify-center gap-1">
                      Docs <ExternalLink className="w-3 h-3" />
                    </h4>
                  </a>

                  <a
                    href="https://cidadaoai-api-production.up.railway.app/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
                  >
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="text-sm font-bold flex items-center justify-center gap-1">
                      API v2 <ExternalLink className="w-3 h-3" />
                    </h4>
                  </a>

                  <ResearchNotesCardLazy locale="pt" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Pronto para o Cidadao.AI 2.0?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Nova plataforma com 20 agentes de IA, chat inteligente e mapa interativo do Brasil
          </p>
          <a
            href="https://cidadaoai-production.up.railway.app/login"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-green-600 rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Acessar Sistema 2.0
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="mt-6 text-white/70 text-sm">100% Gratuito — Powered by Neural Labs</p>
        </div>
      </section>

      {/* Client-side features wrapper - Only loads if needed */}
      <LandingClientWrapper />

      {/* Footer */}
      <footer className="py-8 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2026 Cidadão.AI - Transparência Pública com IA — Neural Labs
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/pt/about" className="hover:text-green-600 transition-colors">
                Sobre
              </Link>
              <Link href="/pt/manifesto" className="hover:text-green-600 transition-colors">
                Manifesto
              </Link>
              <a
                href="https://cidadaoai-production.up.railway.app/login"
                className="hover:text-green-600 transition-colors font-semibold"
              >
                Sistema 2.0
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
