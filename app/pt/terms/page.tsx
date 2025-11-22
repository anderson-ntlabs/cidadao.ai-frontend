import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso | Cidadão.AI',
  description:
    'Termos e condições de uso do Cidadão.AI. Conheça as regras e diretrizes para utilizar nosso sistema de transparência pública.',
  robots: 'index, follow',
  openGraph: {
    title: 'Termos de Uso - Cidadão.AI',
    description: 'Regras e condições para uso do sistema Cidadão.AI',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function TermsPage(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar o Cidadão.AI, você concorda com estes termos de uso. Se você não
            concordar com qualquer parte destes termos, não deve usar nossa plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
          <p>
            O Cidadão.AI é um sistema acadêmico de transparência pública que utiliza inteligência
            artificial para facilitar o acesso e análise de dados governamentais brasileiros.
          </p>
          <p className="mt-4">
            Este é um projeto de pesquisa acadêmica (TCC) do IFSULDEMINAS e não possui caráter
            comercial ou oficial do governo.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Uso Aceitável</h2>
          <h3 className="text-xl font-medium mb-2">3.1 Você Pode</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Realizar consultas sobre dados públicos governamentais</li>
            <li>Utilizar os agentes de IA para análise de transparência</li>
            <li>Exportar resultados de investigações para uso pessoal</li>
            <li>Compartilhar descobertas de interesse público</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">3.2 Você Não Pode</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Usar o sistema para fins ilegais ou antiéticos</li>
            <li>Tentar acessar áreas restritas ou dados privados</li>
            <li>Sobrecarregar o sistema com requisições excessivas</li>
            <li>Reproduzir, modificar ou distribuir o código sem autorização</li>
            <li>Utilizar dados para assédio, discriminação ou difamação</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Dados e Privacidade</h2>
          <p>
            Coletamos apenas dados necessários para o funcionamento do sistema. Suas consultas e
            investigações são armazenadas de forma segura e não são compartilhadas com terceiros.
          </p>
          <p className="mt-4">
            Para mais informações, consulte nossa{' '}
            <a href="/pt/privacy" className="text-green-600 hover:text-green-700 underline">
              Política de Privacidade
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Propriedade Intelectual</h2>
          <p>O código-fonte do Cidadão.AI é de código aberto sob licença MIT. Você pode:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Visualizar e estudar o código</li>
            <li>Modificar para uso pessoal</li>
            <li>Contribuir com melhorias via pull requests</li>
          </ul>
          <p className="mt-4">
            Os dados governamentais são públicos e propriedade do governo brasileiro. A análise e
            insights gerados pelos agentes de IA são considerados derivações dos dados públicos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Isenção de Responsabilidade</h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              O Cidadão.AI é fornecido "como está", sem garantias de qualquer tipo.
            </p>
            <ul className="list-disc pl-6 mt-4 text-yellow-700 dark:text-yellow-300">
              <li>Não garantimos precisão absoluta das análises de IA</li>
              <li>Não somos responsáveis por decisões tomadas com base nos dados</li>
              <li>Recomendamos verificar informações em fontes oficiais</li>
              <li>Este é um projeto acadêmico, não substitui consultoria profissional</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
          <p>
            Em nenhuma circunstância o Cidadão.AI, seus desenvolvedores ou a instituição de ensino
            serão responsáveis por:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Danos diretos, indiretos, incidentais ou consequenciais</li>
            <li>Perda de dados, lucros ou oportunidades</li>
            <li>Interrupção de negócios ou serviços</li>
            <li>Uso inadequado de informações obtidas no sistema</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Disponibilidade do Serviço</h2>
          <p>Como projeto acadêmico, o Cidadão.AI pode estar:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Temporariamente indisponível para manutenção</li>
            <li>Sujeito a mudanças sem aviso prévio</li>
            <li>Descontinuado ao final do projeto acadêmico</li>
          </ul>
          <p className="mt-4">
            Faremos o possível para notificar com antecedência sobre mudanças significativas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Modificações dos Termos</h2>
          <p>
            Reservamos o direito de modificar estes termos a qualquer momento. Mudanças
            significativas serão notificadas na página inicial do sistema.
          </p>
          <p className="mt-4">
            O uso continuado após modificações constitui aceitação dos novos termos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Lei Aplicável</h2>
          <p>
            Estes termos são regidos pelas leis brasileiras. Quaisquer disputas serão resolvidas nos
            tribunais competentes do Brasil.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
          <p>Para dúvidas sobre estes termos, entre em contato:</p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium">Anderson Henrique da Silva</p>
            <p className="text-gray-600 dark:text-gray-400">Desenvolvedor e Pesquisador</p>
            <p className="text-gray-600 dark:text-gray-400">IFSULDEMINAS - Campus Muzambinho</p>
            <p className="mt-2">
              <a
                href="mailto:anderson.ufrj@gmail.com"
                className="text-green-600 hover:text-green-700 underline"
              >
                anderson.ufrj@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <p className="font-medium text-green-800 dark:text-green-200">
              Agradecemos por usar o Cidadão.AI para promover a transparência pública!
            </p>
            <p className="mt-2 text-green-700 dark:text-green-300">
              Juntos, tornamos os dados governamentais mais acessíveis e compreensíveis para todos
              os brasileiros.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
