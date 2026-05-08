import type { Metadata } from 'next'
import { agents } from '@/data/agents'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getWikipediaLink } from '@/lib/wikipedia-links'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'

// ISR: Revalidate every hour (static content)
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Agentes de IA | Cidadão.AI',
  description:
    '17 inteligências artificiais brasileiras trabalhando para democratizar o acesso aos dados públicos e fortalecer a transparência governamental.',
}

export default function AgentsPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Nossos Agentes de IA
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl">
          17 inteligências artificiais brasileiras trabalhando em colaboração para democratizar o
          acesso aos dados públicos e fortalecer a transparência governamental.
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
        </div>

        {/* Technical Details */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle className="text-2xl">Como Funcionam</CardTitle>
          </CardHeader>
          <CardContent>
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

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Experimente Agora</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Nossos agentes estão prontos para trabalhar. Acesse a API pública e comece a explorar o
            poder da transparência assistida por IA.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="https://cidadao-api-production.up.railway.app/docs" target="_blank">
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg">
                Acessar API
              </Button>
            </Link>
            <Link href="https://github.com/anderson-ntlabs/cidadao.ai-backend" target="_blank">
              <Button variant="secondary">Ver Código Fonte</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
