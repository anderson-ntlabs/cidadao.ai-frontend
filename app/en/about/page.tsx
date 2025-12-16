import type { Metadata } from 'next'
import { ProjectTimeline } from '@/components/timeline'

// ISR: Revalidate every hour (static content)
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'About Cidadão.AI | Public Transparency with Artificial Intelligence',
  description:
    'Innovative academic project combining AI, public transparency and social responsibility to democratize access to Brazilian government data.',
  keywords: [
    'public transparency',
    'artificial intelligence',
    'government data',
    'Brazil',
    'thesis',
    'IFSULDEMINAS',
  ],
  authors: [{ name: 'Anderson Henrique da Silva' }],
  openGraph: {
    title: 'About Cidadão.AI',
    description: 'Multi-agent AI system for government transparency',
    type: 'website',
    locale: 'en_US',
  },
}

export default function AboutPage(): JSX.Element {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 relative bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: 'url(/operarios.png)',
      }}
    >
      {/* Overlay para melhorar legibilidade */}
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          About Cidadão.AI
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            Cidadão.AI is an innovative academic project developed as a Final Course Project in
            Computer Science at IFSULDEMINAS, which combines artificial intelligence, public
            transparency and social responsibility to democratize access to Brazilian government
            data.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p>
            Develop a multi-agent artificial intelligence system that works 24/7 to monitor, analyze
            and report public data in a clear, accessible and auditable way, strengthening social
            control and citizen participation.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
          <p>
            The system uses 17 specialized AI agents, each inspired by a Brazilian historical
            figure, creating a symbolic bridge between our history and the future of transparency.
            These agents work collaboratively to:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Monitor public APIs and transparency portals</li>
            <li>Detect anomalies and irregularities in contracts and bids</li>
            <li>Analyze public spending patterns</li>
            <li>Generate automatic reports and real-time alerts</li>
            <li>Facilitate citizen access to public information</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Agents</h2>
          <p>
            Each AI agent carries the name and mission of a Brazilian hero, from Zumbi dos Palmares
            (anomaly detector) to Ayrton Senna (speed and efficiency agent). This unique approach
            connects cutting-edge technology with our rich cultural heritage, making public
            transparency closer and more meaningful to every Brazilian.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Technology and Ethics</h2>
          <p>
            Built with the most modern AI technologies (FastAPI, LangChain, CrewAI), Cidadão.AI
            follows strict ethical principles:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Total transparency in algorithms and processes</li>
            <li>Open source and auditable code</li>
            <li>Respect for privacy and LGPD</li>
            <li>Commitment to truth and impartiality</li>
            <li>Focus on public interest</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Social Impact</h2>
          <p>
            Cidadão.AI aims to empower every Brazilian citizen with tools to exercise their
            constitutional right of access to information, promoting a more participatory democracy
            and a more transparent and efficient public management.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Academic Context</h2>
          <p>
            This project is developed as a Final Course Project (TCC) to obtain the Bachelor's
            degree in Computer Science at IFSULDEMINAS - Muzambinho Campus, under the guidance of
            Prof. Dr. Aracele Garcia de Oliveira Fassbinder.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mt-6">
            <p className="font-medium text-green-800 dark:text-green-200">
              "Transparency is the best remedy against corruption. Technology is the tool that makes
              this remedy accessible to everyone."
            </p>
          </div>
        </div>

        {/* Timeline do Projeto */}
        <div className="mt-16">
          <ProjectTimeline />
        </div>
      </div>
    </div>
  )
}
