import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Cidadão.AI',
  description: 'Política de privacidade do Cidadão.AI. Saiba como protegemos seus dados e respeitamos sua privacidade ao usar nosso sistema de transparência pública.',
  robots: 'index, follow',
  openGraph: {
    title: 'Política de Privacidade - Cidadão.AI',
    description: 'Como o Cidadão.AI protege seus dados e privacidade',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
          <p>
            O Cidadão.AI está comprometido em proteger sua privacidade. Esta política descreve como 
            coletamos, usamos e protegemos suas informações ao usar nosso sistema de transparência pública.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
          <h3 className="text-xl font-medium mb-2">2.1 Informações de Uso</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Dados de navegação anônimos (páginas visitadas, tempo de permanência)</li>
            <li>Tipo de dispositivo e navegador</li>
            <li>Preferências de idioma e tema</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2">2.2 Dados de Investigações</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Consultas realizadas aos dados públicos</li>
            <li>Relatórios gerados (sem dados pessoais)</li>
            <li>Estatísticas agregadas de uso</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.3 Dados de Pesquisa de Usabilidade (com consentimento)</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Métricas de interação (cliques, navegação, tempo de resposta)</li>
            <li>Padrões de uso dos agentes de IA</li>
            <li>Feedback de experiência do usuário</li>
            <li>Dados anonimizados para pesquisa científica sobre usabilidade</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2">
            <strong>Importante:</strong> A coleta de dados para pesquisa científica requer seu
            consentimento explícito e pode ser recusada a qualquer momento sem prejuízo ao uso da plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Como Usamos as Informações</h2>
          <p>Utilizamos as informações coletadas para:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Melhorar a experiência do usuário</li>
            <li>Otimizar o desempenho do sistema</li>
            <li>Gerar estatísticas agregadas sobre transparência pública</li>
            <li>Detectar e prevenir fraudes ou abusos</li>
            <li><strong>Realizar pesquisas científicas</strong> sobre usabilidade e acessibilidade (com consentimento)</li>
            <li><strong>Publicar resultados agregados</strong> em artigos acadêmicos e teses</li>
            <li><strong>Contribuir para o avanço científico</strong> em transparência pública digital</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Proteção de Dados</h2>
          <p>
            Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações, 
            incluindo:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Criptografia de dados em trânsito (HTTPS)</li>
            <li>Acesso restrito aos dados</li>
            <li>Monitoramento contínuo de segurança</li>
            <li>Anonimização de dados sempre que possível</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
          <p>
            <strong>Não vendemos, alugamos ou compartilhamos seus dados pessoais.</strong> 
            Os dados agregados e anonimizados podem ser compartilhados publicamente para promover 
            a transparência governamental.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos</h2>
          <p>De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Acessar seus dados</li>
            <li>Corrigir informações incorretas</li>
            <li>Solicitar a exclusão de dados</li>
            <li>Revogar consentimento</li>
            <li>Solicitar portabilidade dos dados</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para o funcionamento do site. Para mais detalhes, 
            consulte nossa <a href="/pt/cookies" className="text-green-600 hover:underline">Política de Cookies</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Uso para Pesquisa Científica</h2>
          <p className="mb-4">
            O Cidadão.AI é parte de uma pesquisa acadêmica sobre usabilidade de sistemas de transparência pública.
            Com seu <strong>consentimento explícito</strong>, podemos coletar e utilizar dados anonimizados para:
          </p>

          <h3 className="text-xl font-medium mb-2">8.1 Finalidades da Pesquisa</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Análise de padrões de uso e comportamento (agregado)</li>
            <li>Estudos de usabilidade e experiência do usuário</li>
            <li>Pesquisas sobre acessibilidade digital</li>
            <li>Desenvolvimento de metodologias para sistemas de transparência</li>
            <li>Publicação de artigos científicos e dissertações</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">8.2 Garantias de Privacidade na Pesquisa</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Anonimização completa:</strong> Dados pessoais são removidos ou transformados em hashes criptográficos (SHA-256)</li>
            <li><strong>Agregação:</strong> Resultados publicados apenas em forma agregada, nunca individual</li>
            <li><strong>Consentimento revogável:</strong> Você pode retirar seu consentimento a qualquer momento</li>
            <li><strong>Sem comercialização:</strong> Dados de pesquisa nunca serão vendidos ou compartilhados comercialmente</li>
            <li><strong>Transparência:</strong> Publicações científicas serão compartilhadas publicamente</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">8.3 Base Legal (LGPD)</h3>
          <p className="mb-4">
            A coleta de dados para pesquisa científica está fundamentada no{' '}
            <strong>Artigo 7º, IV da LGPD</strong>, que permite o tratamento de dados para
            "realização de estudos por órgão de pesquisa, garantida, sempre que possível,
            a anonimização dos dados pessoais".
          </p>

          <h3 className="text-xl font-medium mb-2">8.4 Como Gerenciar seu Consentimento</h3>
          <p>
            Você pode aceitar ou recusar a coleta de dados para pesquisa através do banner específico
            que aparece ao usar a plataforma. Sua escolha não afeta o acesso às funcionalidades do sistema.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas
            através do site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
          <p>
            Para questões sobre privacidade ou sobre o uso de dados para pesquisa, entre em contato através do nosso sistema ou abra uma issue no{' '}
            <a href="https://github.com/anderson-ufrj/cidadao.ai-hub" className="text-green-600 hover:underline">GitHub</a>.
          </p>
        </section>
      </div>
    </div>
  )
}