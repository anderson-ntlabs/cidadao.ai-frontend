'use client'

import { agents } from '@/data/agents'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getWikipediaLink } from '@/lib/wikipedia-links'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Our AI Agents
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl">
          17 Brazilian artificial intelligences working collaboratively to democratize access to
          public data and strengthen government transparency.
        </p>

        {/* All Agents */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {agents.map((agent) => (
              <Card key={agent.id} variant="elevated" className="overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    fill
                    className="object-cover mix-blend-overlay opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                      <Image
                        src={agent.image}
                        alt={agent.name}
                        width={128}
                        height={128}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                    {agent.role.en}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{agent.description.en}</p>
                  {getWikipediaLink(agent.id, 'en') && (
                    <Link
                      href={getWikipediaLink(agent.id, 'en')!}
                      target="_blank"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Learn more about {agent.name}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle className="text-2xl">How They Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Network Collaboration</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Each agent has specialized skills and works autonomously yet collaboratively. They
                  share discoveries, cross-validate information, and coordinate actions to maximize
                  efficiency.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Asynchronous communication via message brokers</li>
                  <li>Consensus protocol for data validation</li>
                  <li>Reputation system between agents</li>
                  <li>Continuous learning with feedback loops</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">AI Technologies</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use the most modern artificial intelligence techniques to ensure precision,
                  speed, and reliability in our analyses.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Large Language Models (LLMs) for textual analysis</li>
                  <li>Computer Vision for document processing</li>
                  <li>Pattern Recognition for anomaly detection</li>
                  <li>Reinforcement Learning for continuous optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Try It Now</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Our agents are ready to work. Access the public API and start exploring the power of
            AI-assisted transparency.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="https://cidadao-api-production.up.railway.app/docs" target="_blank">
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg">
                Access API
              </Button>
            </Link>
            <Link href="https://github.com/anderson-ufrj/cidadao.ai-backend" target="_blank">
              <Button variant="secondary">View Source Code</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
