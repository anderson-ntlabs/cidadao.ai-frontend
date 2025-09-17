export default function AboutPage() {
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
          Sobre o Cidadão.AI
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            O Cidadão.AI é um projeto acadêmico inovador desenvolvido como Trabalho de Conclusão de Curso 
            em Ciência da Computação no IFSULDEMINAS, que combina inteligência artificial, transparência 
            pública e responsabilidade social para democratizar o acesso aos dados governamentais brasileiros.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Nossa Missão</h2>
          <p>
            Desenvolver um sistema multi-agente de inteligência artificial que trabalhe 24/7 para monitorar, 
            analisar e reportar dados públicos de forma clara, acessível e auditável, fortalecendo o controle 
            social e a participação cidadã.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Como Funciona</h2>
          <p>
            O sistema utiliza 17 agentes de IA especializados, cada um inspirado em uma figura histórica 
            brasileira, criando uma ponte simbólica entre nossa história e o futuro da transparência. 
            Esses agentes trabalham de forma colaborativa para:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Monitorar APIs públicas e portais de transparência</li>
            <li>Detectar anomalias e irregularidades em contratos e licitações</li>
            <li>Analisar padrões de gastos públicos</li>
            <li>Gerar relatórios automáticos e alertas em tempo real</li>
            <li>Facilitar o acesso cidadão à informação pública</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Nossos Agentes</h2>
          <p>
            Cada agente de IA carrega o nome e a missão de um herói brasileiro, desde Zumbi dos Palmares 
            (detector de anomalias) até Ayrton Senna (agente de velocidade e eficiência). Essa abordagem 
            única conecta tecnologia de ponta com nossa rica herança cultural, tornando a transparência 
            pública mais próxima e significativa para cada brasileiro.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Tecnologia e Ética</h2>
          <p>
            Construído com as mais modernas tecnologias de IA (FastAPI, LangChain, CrewAI), o Cidadão.AI 
            segue rigorosos princípios éticos:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Transparência total em algoritmos e processos</li>
            <li>Código aberto e auditável</li>
            <li>Respeito à privacidade e LGPD</li>
            <li>Compromisso com a verdade e imparcialidade</li>
            <li>Foco no interesse público</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Impacto Social</h2>
          <p>
            O Cidadão.AI visa empoderar cada cidadão brasileiro com ferramentas para exercer seu direito 
            constitucional de acesso à informação, promovendo uma democracia mais participativa e uma 
            gestão pública mais transparente e eficiente.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contexto Acadêmico</h2>
          <p>
            Este projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC) para obtenção do título 
            de Bacharel em Ciência da Computação no IFSULDEMINAS - Campus Muzambinho, sob orientação da 
            Profa. Dra. Aracele Garcia de Oliveira Fassbinder.
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mt-6">
            <p className="font-medium text-green-800 dark:text-green-200">
              "A transparência é o melhor remédio contra a corrupção. A tecnologia é a ferramenta 
              que torna esse remédio acessível a todos."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}