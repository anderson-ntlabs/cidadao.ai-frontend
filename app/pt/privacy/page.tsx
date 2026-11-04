import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Cidadão.AI',
  description:
    'Política de privacidade do Cidadão.AI conforme a LGPD: quais dados pessoais coletamos, por quê, por quanto tempo, quem os trata e como exercer seus direitos.',
  robots: 'index, follow',
  openGraph: {
    title: 'Política de Privacidade - Cidadão.AI',
    description: 'Como o Cidadão.AI protege seus dados e privacidade',
    type: 'website',
    locale: 'pt_BR',
  },
}

const LAST_UPDATED = '3 de novembro de 2026'

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">Última atualização: {LAST_UPDATED}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introdução e Controlador dos Dados</h2>
          <p>
            O Cidadão.AI é uma plataforma de transparência pública de código aberto que usa agentes
            de IA para ajudar pessoas a analisar o gasto público brasileiro. Esta política explica
            quais dados pessoais tratamos, por quê, por quanto tempo, quem os trata em nosso nome e
            como você pode exercer seus direitos previstos na Lei Geral de Proteção de Dados (LGPD,
            Lei 13.709/2018).
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium">Controlador dos dados</p>
            <p className="text-gray-600 dark:text-gray-400">
              Anderson Henrique da Silva (pessoa física), Minas Gerais, Brasil
            </p>
            <p className="font-medium mt-2">Contato de privacidade (função de encarregado)</p>
            <p>
              <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
                andersonhs27@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Dados Pessoais que Coletamos</h2>
          <p>
            Você pode navegar pelas páginas públicas sem conta. Só tratamos dados pessoais quando
            você cria uma conta ou usa as funcionalidades com login.
          </p>

          <h3 className="text-xl font-medium mb-2 mt-4">2.1 Dados da conta</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Nome e endereço de e-mail.</li>
            <li>
              Se você entrar com Google ou GitHub: o nome, e-mail, URL da foto de perfil e nome de
              usuário que esse provedor compartilha conosco.
            </li>
            <li>Data de criação da conta e data do último acesso.</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.2 Perfil e preferências opcionais</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Preferências de tema, idioma, tamanho de fonte, acessibilidade e notificações.</li>
            <li>Foto de perfil e minibiografia, se você quiser adicioná-las.</li>
            <li>
              Na plataforma de aprendizado Ágora: dados de curso e matrícula na instituição que você
              escolher preencher, progresso, pontos, conquistas, sessões de estudo e entradas do
              diário.
            </li>
            <li>
              Seu nome, foto e pontos aparecem no ranking da Ágora, visível para outros aprendizes
              com login.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.3 Mensagens do chat e investigações</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              As mensagens que um usuário com login escreve para os agentes de IA, as respostas dos
              agentes e as investigações que você cria.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.4 Registros de consentimento</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Data, versão do texto aceito, endereço IP e identificação do navegador (user agent) no
              momento em que você aceita os termos, para podermos comprovar seu consentimento.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-2">
            2.5 Ágora Kids (somente contas de responsáveis)
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Nome e e-mail do responsável, primeiro nome ou apelido da criança e avatar escolhido,
              horários das sessões, vídeos assistidos e agentes usados. Crianças não têm conta nem
              e-mail próprios. Veja a seção 8.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.6 Dados técnicos e de uso</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Páginas visitadas, tipo de dispositivo, navegador, idioma e país/região aproximados.
            </li>
            <li>Endereço IP, usado para segurança e limitação de requisições.</li>
            <li>Relatórios de erro e métricas de desempenho.</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.7 O que não coletamos</h3>
          <p>
            Não pedimos CPF, RG nem qualquer outro número de documento de identificação, nem dados
            financeiros, de saúde ou biométricos. Por favor, não digite esses dados, nem dados
            pessoais de outras pessoas, no chat.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Finalidades e Bases Legais (LGPD)</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>
                Criar e manter sua conta, responder às suas mensagens no chat e salvar seu histórico
              </strong>
              : execução do serviço que você solicitou (LGPD art. 7º, V).
            </li>
            <li>
              <strong>Dados opcionais de perfil, analytics de pesquisa e gravação de sessão</strong>
              : seu consentimento (art. 7º, I), que você pode revogar a qualquer momento.
            </li>
            <li>
              <strong>
                Segurança, prevenção de abuso, limitação de requisições e monitoramento de erros
              </strong>
              : legítimo interesse (art. 7º, IX e art. 10), limitado ao necessário.
            </li>
            <li>
              <strong>Pesquisa acadêmica com dados anonimizados</strong>: estudos por órgão de
              pesquisa (art. 7º, IV), veja a seção 11.
            </li>
            <li>
              <strong>Ágora Kids</strong>: consentimento específico dado pelo pai, mãe ou
              responsável legal (art. 14, §1º).
            </li>
            <li>
              <strong>Cumprimento de obrigação legal ou de requisição de autoridades</strong>: art.
              7º, II.
            </li>
          </ul>
          <p className="mt-4">
            <strong>
              Não vendemos nem alugamos dados pessoais e não os usamos para publicidade.
            </strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Operadores e Suboperadores</h2>
          <p>
            Compartilhamos dados pessoais apenas com os prestadores de serviço necessários para
            operar a plataforma, cada um agindo conforme nossas instruções:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Vercel Inc.</strong> (EUA): hospedagem deste site; Vercel Web Analytics e
              Speed Insights (métricas agregadas de páginas e desempenho).
            </li>
            <li>
              <strong>Supabase Inc.</strong>: banco de dados, autenticação e armazenamento de
              arquivos (conta, perfil, histórico do chat, registros de consentimento).
            </li>
            <li>
              <strong>Railway Corp.</strong> (EUA): hospedagem da API que executa os agentes de IA.
            </li>
            <li>
              <strong>Provedor de modelo de linguagem (LLM) configurado na API</strong>: recebe o
              texto das suas mensagens do chat para gerar a resposta. O provedor padrão atual é a{' '}
              <strong>Maritaca AI</strong> (Brasil, modelos Sabiá). A API pode ser configurada para
              usar outro provedor (por exemplo Groq, Anthropic, Together AI ou Hugging Face); se o
              provedor em uso mudar, esta lista será atualizada.
            </li>
            <li>
              <strong>PostHog Inc.</strong> (EUA): analytics de produto. Seu identificador de
              usuário é enviado apenas como hash SHA-256, e a gravação de sessão só é ativada com
              seu consentimento, com todos os campos de formulário mascarados.
            </li>
            <li>
              <strong>Functional Software Inc. (Sentry)</strong> (EUA): monitoramento de erros e
              desempenho.
            </li>
            <li>
              <strong>Resend</strong> (EUA): envio do e-mail com o código de acesso parental (Ágora
              Kids).
            </li>
            <li>
              <strong>ipify</strong>: informa seu endereço IP público quando você registra o
              consentimento da Ágora.
            </li>
          </ul>
          <p className="mt-4">
            Se você escolher entrar com Google ou GitHub, essas empresas tratam seu login conforme
            as próprias políticas de privacidade. Alguns provedores ficam fora do Brasil; essas
            transferências internacionais seguem o art. 33 da LGPD, com base nos termos de
            tratamento de dados dos provedores.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Prazos de Retenção</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>
                Dados da conta, perfil, preferências, histórico do chat e investigações
              </strong>
              : mantidos enquanto sua conta estiver ativa. Excluir a conta no aplicativo os remove
              imediatamente; se você pedir por e-mail, excluímos em até 15 dias. Cópias nos backups
              dos provedores são sobrescritas em até 30 dias.
            </li>
            <li>
              <strong>Registros de consentimento</strong>: mantidos durante a vida da conta e
              excluídos junto com ela.
            </li>
            <li>
              <strong>Dados do Ágora Kids</strong>: excluídos junto com a conta do responsável ou a
              pedido dele.
            </li>
            <li>
              <strong>Logs de analytics, erros e segurança</strong>: mantidos pelos provedores
              listados acima por no máximo 12 meses.
            </li>
            <li>
              <strong>Certificados de cursos</strong>: após a exclusão da conta, o registro público
              do certificado (nome impresso no certificado, horas, datas e código de verificação) é
              mantido, sem vínculo com a conta excluída, para que certificados emitidos continuem
              verificáveis.
            </li>
            <li>
              <strong>Dados de pesquisa anonimizados</strong>: podem ser mantidos, pois não
              identificam mais ninguém (LGPD art. 12 e art. 16, II).
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos e Como Exercê-los</h2>
          <p>Pelo art. 18 da LGPD você tem direito a:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Confirmar se tratamos seus dados e acessá-los.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Anonimizar, bloquear ou eliminar dados desnecessários ou excessivos.</li>
            <li>Portabilidade dos dados.</li>
            <li>
              Eliminar dados tratados com seu consentimento e revogar o consentimento a qualquer
              momento.
            </li>
            <li>
              Saber com quem compartilhamos seus dados e as consequências de negar o consentimento.
            </li>
            <li>
              Pedir revisão de decisões tomadas unicamente com base em tratamento automatizado (art.
              20); veja nossa{' '}
              <a href="/pt/responsible-ai" className="text-green-600 hover:underline">
                Política de IA Responsável
              </a>
              .
            </li>
          </ul>
          <h3 className="text-xl font-medium mb-2 mt-4">Como exercê-los</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>No aplicativo</strong>: com login, abra Configurações, na seção de
              Privacidade, e use <em>Exportar meus dados</em> (baixa um arquivo JSON com seus dados)
              ou <em>Excluir minha conta</em> (imediata e irreversível). Essas ações sempre atuam
              apenas sobre a conta com login.
            </li>
            <li>
              <strong>Por e-mail</strong>: escreva para{' '}
              <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
                andersonhs27@gmail.com
              </a>{' '}
              a partir do e-mail da sua conta. Respondemos em até 15 dias (LGPD art. 19).
            </li>
            <li>
              Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD) em{' '}
              <a href="https://www.gov.br/anpd" className="text-green-600 hover:underline">
                gov.br/anpd
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Proteção de Dados</h2>
          <p>
            Implementamos medidas técnicas e organizacionais apropriadas para proteger suas
            informações, incluindo:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Criptografia de dados em trânsito (HTTPS)</li>
            <li>
              Regras de acesso por linha no banco de dados que limitam o que cada conta pode ler
            </li>
            <li>Monitoramento contínuo de segurança</li>
            <li>Anonimização de dados sempre que possível</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Crianças e Adolescentes</h2>
          <p>
            Seguimos o Estatuto da Criança e do Adolescente (ECA, Lei 8.069/1990) e o art. 14 da
            LGPD: dados de crianças e adolescentes são tratados apenas no seu melhor interesse.
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              O chat de transparência e as investigações não são direcionados a menores de 12 anos.
            </li>
            <li>
              Crianças usam a plataforma apenas pelo <strong>Ágora Kids</strong>, dentro de uma
              conta do pai, mãe ou responsável, depois que ele dá consentimento específico e em
              destaque (art. 14, §1º). Coletamos o mínimo necessário (primeiro nome ou apelido e
              atividade), sem publicidade e sem criação de perfil.
            </li>
            <li>
              Os agentes infantis filtram temas bloqueados e respondem em linguagem adequada à
              idade. Os responsáveis podem acompanhar a atividade, exportar os dados e excluí-los a
              qualquer momento.
            </li>
            <li>
              Adolescentes (12 a 17 anos) devem usar a plataforma com o conhecimento dos pais ou
              responsáveis.
            </li>
            <li>
              Se soubermos que dados de uma criança foram coletados sem consentimento do
              responsável, nós os excluímos. Avise em{' '}
              <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
                andersonhs27@gmail.com
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Inteligência Artificial</h2>
          <p>
            Suas mensagens do chat são processadas pelos agentes de IA e pelo provedor de LLM
            listado na seção 4. Os achados da IA são sinais a verificar, não acusações, e não são
            usados para tomar decisões sobre você. Leia a{' '}
            <a href="/pt/responsible-ai" className="text-green-600 hover:underline">
              Política de IA Responsável e de Conteúdo
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para o funcionamento do site. Para mais detalhes, consulte
            nossa{' '}
            <a href="/pt/cookies" className="text-green-600 hover:underline">
              Política de Cookies
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Uso para Pesquisa Científica</h2>
          <p className="mb-4">
            O Cidadão.AI é parte de uma pesquisa acadêmica sobre usabilidade de sistemas de
            transparência pública. Com seu <strong>consentimento explícito</strong>, podemos coletar
            e utilizar dados de interação anonimizados (cliques, navegação, tempo de resposta,
            feedback) para estudos de usabilidade e acessibilidade e publicações científicas.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Anonimização:</strong> dados pessoais são removidos ou transformados em hashes
              criptográficos (SHA-256)
            </li>
            <li>
              <strong>Agregação:</strong> resultados publicados apenas de forma agregada, nunca
              individual
            </li>
            <li>
              <strong>Consentimento revogável:</strong> você aceita ou recusa pelo banner de
              pesquisa e pode revogar a qualquer momento sem perder acesso a nenhuma funcionalidade
            </li>
            <li>
              <strong>Sem comercialização:</strong> dados de pesquisa nunca são vendidos ou
              compartilhados comercialmente
            </li>
          </ul>
          <p>
            Base legal: <strong>LGPD art. 7º, IV</strong>, estudos por órgão de pesquisa, garantida,
            sempre que possível, a anonimização.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. A data no topo indica a versão mais
            recente, e mudanças significativas serão comunicadas no site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contato</h2>
          <p>
            Para qualquer dúvida ou pedido sobre privacidade, fale com o controlador, Anderson
            Henrique da Silva, em{' '}
            <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
              andersonhs27@gmail.com
            </a>
            , ou abra uma issue no{' '}
            <a
              href="https://github.com/anderson-ntlabs/cidadao.ai-frontend/issues"
              className="text-green-600 hover:underline"
            >
              GitHub
            </a>{' '}
            (não inclua dados pessoais em issues públicas). Veja também nossos{' '}
            <a href="/pt/terms" className="text-green-600 hover:underline">
              Termos de Uso
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
