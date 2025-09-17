'use client'

import { agents } from '@/data/agents'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getWikipediaLink } from '@/lib/wikipedia-links'

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Our AI Agents
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl">
          17 Brazilian artificial intelligences working collaboratively to 
          democratize access to public data and strengthen government transparency.
        </p>

        {/* All Agents */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                  <Image
                    src={`/agents/${agent.image}`}
                    alt={agent.name}
                    fill
                    className="object-cover mix-blend-overlay opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                      <Image
                        src={`/agents/${agent.image}`}
                        alt={agent.name}
                        width={128}
                        height={128}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-3 font-medium">
                    {agent.role.en}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {agent.description.en}
                  </p>
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
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to interact with our agents?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Access our platform and discover how AI can help you understand public data
          </p>
          <Link
            href="https://cidadao-ai-frontend.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            Access Platform
            <ExternalLink size={20} />
          </Link>
        </div>
      </div>
    </div>
  )
}