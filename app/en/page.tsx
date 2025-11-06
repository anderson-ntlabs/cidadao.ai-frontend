/**
 * English Landing Page - Modal-based Architecture
 *
 * Redesigned with modal-based navigation for better space utilization
 * and modern UX. Content cards open floating modals instead of separate pages.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-11-06
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ContentCard, ExternalLinkCard, LandingModal } from '@/components/landing'
import { ProjectTimeline } from '@/components/timeline/project-timeline'
import { useAuth } from '@/hooks/use-supabase-auth'
import { agents } from '@/data/agents'

export default function ENPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Modal states
  const [aboutModalOpen, setAboutModalOpen] = useState(false)
  const [agentsModalOpen, setAgentsModalOpen] = useState(false)
  const [manifestoModalOpen, setManifestoModalOpen] = useState(false)

  // Redirect authenticated users directly to app
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/en/app')
    }
  }, [isAuthenticated, isLoading, router])

  const handleAccessSystem = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push('/en/app')
    } else {
      router.push('/en/login')
    }
  }

  return (
    <div className="relative">
      {/* Hero Section - COMPACT (60vh instead of 90vh) */}
      <section className="hero relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-blue-500/10"></div>
        </div>

        <div className="hero-container max-w-5xl mx-auto px-6 py-16 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
            Cidadão.AI
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-200 mb-6 max-w-3xl mx-auto">
            Artificial Intelligence for Transparency and Social Control
          </p>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Monitor public spending, detect anomalies and track investigations in real time. Our
            network of Brazilian AIs works 24/7 analyzing data from the Transparency Portal.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleAccessSystem}
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-xl transition-all duration-300"
            >
              Access the System
            </Button>
            <Button
              onClick={() => setAboutModalOpen(true)}
              variant="secondary"
              size="lg"
              className="border-2 border-gray-300 dark:border-gray-600 hover:border-green-600 dark:hover:border-green-400"
            >
              About the Project
            </Button>
          </div>

          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 italic">
            Note: Full system available in Portuguese only
          </p>
        </div>
      </section>

      {/* Content Cards Grid - 3 columns */}
      <section className="py-12 bg-gradient-to-b from-transparent via-gray-50/50 dark:via-gray-900/20 to-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ContentCard
              icon="🎓"
              title="About the Project"
              description="Computer Science undergraduate thesis - Open source government transparency platform"
              onClick={() => setAboutModalOpen(true)}
              gradient="from-green-500 to-emerald-600"
            />
            <ContentCard
              icon="🇧🇷"
              title="Our Agents"
              description="17 specialized Brazilian AIs - Each with a unique cultural identity and role"
              onClick={() => setAgentsModalOpen(true)}
              gradient="from-blue-500 to-cyan-600"
            />
            <ContentCard
              icon="📜"
              title="Manifesto"
              description="Our Mission - Digital democracy and technological citizenship"
              onClick={() => setManifestoModalOpen(true)}
              gradient="from-yellow-500 to-orange-600"
            />
          </div>
        </div>
      </section>

      {/* Spotify Section - NO TITLE */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <div className="relative w-full" style={{ minHeight: '352px' }}>
              <iframe
                style={{ borderRadius: '12px' }}
                src="https://open.spotify.com/embed/playlist/2CnnwkzO3GPYUuPz7TAWva?utm_source=generator"
                width="100%"
                height="352"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="shadow-lg"
                title="Cidadão.AI Transparency Soundtrack"
              />
            </div>
          </div>
        </div>
      </section>

      {/* External Links Section - 3 columns */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Additional Resources
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm">
            For developers, researchers and those interested in technical details
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ExternalLinkCard
              icon="🐙"
              title="GitHub"
              description="Open source repositories"
              href="https://github.com/anderson-ufrj/cidadao.ai-backend"
            />
            <ExternalLinkCard
              icon="📚"
              title="Documentation"
              description="Complete technical guides"
              href="https://anderson-ufrj.github.io/cidadao.ai-technical-docs/docs/intro"
            />
            <ExternalLinkCard
              icon="⚡"
              title="REST API"
              description="Interactive documentation"
              href="https://cidadao-api-production.up.railway.app/docs"
            />
          </div>
        </div>
      </section>

      {/* ABOUT MODAL */}
      <LandingModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        title="About Cidadão.AI"
        size="xl"
      >
        {/* About content */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong className="text-green-600 dark:text-green-400">Cidadão.AI</strong> is an
              undergraduate thesis project in{' '}
              <strong className="text-blue-600 dark:text-blue-400">Computer Science</strong>,
              developed with the aim of democratizing access to public data and strengthening
              government transparency in Brazil.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              🎯 Main Objectives
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Artificial Intelligence
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Multi-agent system specialized in analyzing government data
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Anomaly Detection
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Advanced algorithms for identifying suspicious patterns
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Natural Interaction
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Chat with AIs in natural language (Portuguese)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Interactive Dashboards
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Real-time data visualization and analysis
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              🏗️ Project Timeline
            </h3>
            <ProjectTimeline />

            <div className="mt-8 bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border-l-4 border-green-600">
              <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                💡 Innovation and Impact
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                This project combines cutting-edge technologies such as Large Language Models
                (LLMs), multi-agent systems, and real-time data analysis to create an unprecedented
                tool for social control and government transparency in Brazil.
              </p>
            </div>
          </div>
        </div>
      </LandingModal>

      {/* AGENTS MODAL */}
      <LandingModal
        isOpen={agentsModalOpen}
        onClose={() => setAgentsModalOpen(false)}
        title="Our Brazilian AI Agents"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Each agent has a{' '}
              <strong className="text-blue-600 dark:text-blue-400">
                unique Brazilian identity
              </strong>
              , inspired by historical figures who fought for freedom, justice, and democracy.
            </p>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover shadow-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{agent.role.en}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  {agent.description.en}
                </p>

                {agent.wikipedia && (
                  <a
                    href={agent.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Learn more on Wikipedia</span>
                    <span>→</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-600">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
              🤝 Multi-Agent Collaboration
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Agents work together, sharing information and coordinating complex analyses. Each
              brings its expertise, creating a powerful transparency network.
            </p>
          </div>
        </div>
      </LandingModal>

      {/* MANIFESTO MODAL */}
      <LandingModal
        isOpen={manifestoModalOpen}
        onClose={() => setManifestoModalOpen(false)}
        title="Manifesto: Technology for the People"
        size="xl"
      >
        <div className="space-y-6">
          {/* Tarsila Image */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/antropofagia-tarsila.jpg"
              alt="Antropofagia by Tarsila do Amaral"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-sm font-medium text-white">
                "Antropofagia" (1929) - Tarsila do Amaral
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-6">
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                We believe in technology that serves the people, not just the market. Cidadão.AI is
                our contribution to building a more transparent, participatory, and fair democracy.
              </p>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              📜 Our Principles
            </h3>

            <div className="space-y-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-lg border-l-4 border-green-600">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <span className="text-xl">💻</span>
                  Open Source and Free
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All code is public and free. We believe that transparency tools should be
                  accessible to everyone, without financial barriers.
                </p>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-lg border-l-4 border-blue-600">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <span className="text-xl">🇧🇷</span>
                  Brazilian Identity
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI agents have Brazilian identities, honoring historical figures who fought
                  for freedom and justice. Technology with culture and memory.
                </p>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-lg border-l-4 border-yellow-600">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <span className="text-xl">🤝</span>
                  Social Control
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We empower citizens to monitor and question public spending. Democracy requires
                  active participation, and technology should facilitate this.
                </p>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-lg border-l-4 border-purple-600">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  Privacy and Security
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We respect user privacy and protect data with modern security standards.
                  Transparency is about governance, not about exposing people.
                </p>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-lg border-l-4 border-red-600">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  Continuous Education
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The system should educate, not just inform. We explain concepts, provide context,
                  and help citizens understand the complexity of public governance.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-green-50 via-yellow-50 to-blue-50 dark:from-green-900/20 dark:via-yellow-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 text-center">
                🚀 Join the Movement
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                Cidadão.AI is more than a platform — it's a movement for digital democracy and
                technological citizenship. Use, contribute, share. Together we can build a more
                transparent Brazil.
              </p>
            </div>
          </div>
        </div>
      </LandingModal>
    </div>
  )
}
