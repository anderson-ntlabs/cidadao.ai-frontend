export default function SystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Arquitetura do Sistema
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            O Cidadão.AI é um sistema multi-agente distribuído, construído com tecnologias 
            modernas para garantir escalabilidade, confiabilidade e transparência total.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Visão Geral</h2>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">17</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Agentes de IA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monitoramento</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Open Source</div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Stack Tecnológico</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Backend Core</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-green-600 mb-2">FastAPI</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Framework web moderno e assíncrono para APIs de alta performance
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-blue-600 mb-2">Python 3.11+</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Linguagem principal com tipagem estática via Pydantic
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Inteligência Artificial</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-purple-600 mb-2">LangChain</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Framework para construção de aplicações com LLMs
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-purple-600 mb-2">CrewAI</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Orquestração de agentes autônomos colaborativos
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-purple-600 mb-2">Groq LPU</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Inferência ultrarrápida para processamento em tempo real
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Armazenamento & Cache</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-orange-600 mb-2">PostgreSQL</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Banco de dados relacional para persistência de longo prazo
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-red-600 mb-2">Redis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cache em memória para performance e filas de processamento
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Observabilidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-yellow-600 mb-2">Prometheus</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coleta e armazenamento de métricas
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-yellow-600 mb-2">Grafana</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dashboards e visualização de métricas
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-medium text-yellow-600 mb-2">OpenTelemetry</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rastreamento distribuído e observabilidade
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Fluxo de Dados</h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Coleta:</strong> Agentes monitoram APIs públicas e portais de transparência
              </li>
              <li>
                <strong>Processamento:</strong> IA analisa dados em busca de padrões e anomalias
              </li>
              <li>
                <strong>Validação:</strong> Sistema verifica informações com múltiplas fontes
              </li>
              <li>
                <strong>Armazenamento:</strong> Dados estruturados no PostgreSQL, cache no Redis
              </li>
              <li>
                <strong>Notificação:</strong> Alertas em tempo real sobre descobertas relevantes
              </li>
              <li>
                <strong>Apresentação:</strong> Dashboards e APIs para acesso público
              </li>
            </ol>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Segurança & Conformidade</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Medidas de Segurança</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Criptografia end-to-end para dados sensíveis</li>
                <li>Autenticação JWT com refresh tokens</li>
                <li>Rate limiting e proteção DDoS</li>
                <li>Auditoria completa de todas as ações</li>
                <li>Isolamento de containers Docker</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Conformidade Legal</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>100% compatível com LGPD</li>
                <li>Lei de Acesso à Informação (LAI)</li>
                <li>Marco Civil da Internet</li>
                <li>Padrões OWASP de segurança</li>
                <li>ISO 27001 (em processo)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">APIs Públicas</h2>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Endpoints Principais</h3>
            <div className="space-y-3 font-mono text-sm">
              <div>
                <span className="text-green-600">GET</span> /api/agents - Lista todos os agentes
              </div>
              <div>
                <span className="text-green-600">GET</span> /api/agents/{'{agent_id}'}/status - Status do agente
              </div>
              <div>
                <span className="text-blue-600">POST</span> /api/investigate - Solicitar investigação
              </div>
              <div>
                <span className="text-green-600">GET</span> /api/anomalies - Anomalias detectadas
              </div>
              <div>
                <span className="text-green-600">GET</span> /api/reports - Relatórios gerados
              </div>
              <div>
                <span className="text-yellow-600">WS</span> /ws/alerts - WebSocket para alertas em tempo real
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Monitoramento & SLAs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime Garantido</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">&lt;100ms</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Latência P95</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monitoramento</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Contribuindo</h2>
          
          <p>
            O Cidadão.AI é um projeto open source e acolhe contribuições da comunidade. 
            Visite nosso <a href="https://github.com/anderson-ufrj/cidadao.ai-backend" className="text-blue-600 hover:underline">repositório no GitHub</a> para:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Reportar bugs e sugerir melhorias</li>
            <li>Contribuir com código e documentação</li>
            <li>Propor novos agentes e funcionalidades</li>
            <li>Participar das discussões técnicas</li>
            <li>Auditar nossa segurança e processos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}