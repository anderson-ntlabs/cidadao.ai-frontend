import type { Metadata } from 'next'
import Image from 'next/image'

// ISR: Revalidate every hour (static content)
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Manifesto | Cidadão.AI',
  description:
    'Por uma Inteligência Artificial que serve ao povo e ilumina o Estado. Manifesto do projeto Cidadão.AI.',
}

export default function ManifestoPage(): JSX.Element {
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
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Manifesto Cidadão.AI
        </h1>

        <h2 className="text-2xl font-semibold mb-8 text-center text-gray-700 dark:text-gray-300">
          🇧🇷 Por uma Inteligência Artificial que Serve ao Povo e Ilumina o Estado
        </h2>

        {/* Imagem da Antropofagia - Tarsila do Amaral */}
        <div className="my-12 rounded-lg overflow-hidden shadow-2xl border-4 border-green-600 dark:border-green-400">
          <Image
            src="/images/Tarsila_Antropofagia.jpg"
            alt="Antropofagia por Tarsila do Amaral - Movimento Antropofágico Brasileiro"
            width={1200}
            height={800}
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

          <h2 className="text-2xl font-semibold mt-10 mb-4">Nosso Compromisso</h2>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg my-6">
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

          <h2 className="text-2xl font-semibold mt-10 mb-4">O Futuro que Queremos</h2>

          <p>
            Imaginamos um Brasil onde cada cidadão tem acesso instantâneo e compreensível aos dados
            públicos. Onde a corrupção é detectada em tempo real. Onde a participação cidadã é
            amplificada pela tecnologia. Onde a transparência não é exceção, mas regra.
          </p>

          <p>
            O Cidadão.AI é mais que um projeto tecnológico - é um movimento por uma democracia mais
            forte, justa e participativa. Cada agente de IA carrega o nome de um herói brasileiro
            porque acreditamos que a luta pela transparência é a continuação de suas batalhas por
            liberdade.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Junte-se a Nós</h2>

          <p>
            Este é um convite aberto. Se você acredita em transparência, em tecnologia para o bem
            comum, em uma democracia mais forte - você já é parte do Cidadão.AI. Contribua com
            código, ideias, críticas ou simplesmente use e compartilhe nossos recursos.
          </p>

          <p className="font-semibold text-green-700 dark:text-green-300 mt-8">
            Juntos, construímos um Brasil mais transparente, uma linha de código por vez.
          </p>

          <div className="text-center mt-10 text-sm text-gray-600 dark:text-gray-400">
            <p>🇧🇷 Feito no Brasil, para o Brasil 🇧🇷</p>
          </div>
        </div>
      </div>
    </div>
  )
}
