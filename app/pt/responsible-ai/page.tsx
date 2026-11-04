import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de IA Responsável e de Conteúdo | Cidadão.AI',
  description:
    'Como o Cidadão.AI usa IA para analisar o gasto público, os limites dos achados, conteúdo proibido, como denunciar conteúdo e como as crianças são protegidas.',
  robots: 'index, follow',
  openGraph: {
    title: 'Política de IA Responsável e de Conteúdo - Cidadão.AI',
    description: 'Como o Cidadão.AI usa IA de forma responsável e modera conteúdo',
    type: 'website',
    locale: 'pt_BR',
  },
}

const LAST_UPDATED = '3 de novembro de 2026'

export default function ResponsibleAIPage(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Política de IA Responsável e de Conteúdo</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">Última atualização: {LAST_UPDATED}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Como Usamos a IA</h2>
          <p>
            O Cidadão.AI usa um conjunto de agentes de IA especializados que trabalham juntos para
            analisar dados abertos do governo sobre o gasto público brasileiro (contratos,
            licitações, transferências e pagamentos). Os agentes procuram padrões como preços fora
            da curva, concentração incomum de fornecedores ou inconsistências entre bases de dados,
            e os explicam em linguagem simples.
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Os achados devem citar a fonte oficial de onde vêm (por exemplo o Portal da
              Transparência ou outros portais de dados abertos do governo), para que qualquer pessoa
              possa conferir o registro original.
            </li>
            <li>
              As respostas são geradas por um modelo de linguagem (LLM) configurado na API. O
              provedor em uso está listado na nossa{' '}
              <a href="/pt/privacy" className="text-green-600 hover:underline">
                Política de Privacidade
              </a>
              .
            </li>
            <li>O código da plataforma e dos agentes é aberto para qualquer pessoa auditar.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Limites: Um Achado Não É uma Acusação</h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Uma anomalia ou achado produzido pela IA é um sinal que merece um olhar mais atento.
              Não é prova de irregularidade e não é uma acusação contra nenhuma pessoa, empresa ou
              órgão público.
            </p>
            <ul className="list-disc pl-6 mt-4 text-yellow-700 dark:text-yellow-300">
              <li>
                Modelos de IA podem errar, ficar incompletos ou desatualizados e interpretar mal os
                dados.
              </li>
              <li>Os próprios dados oficiais podem conter erros ou ser publicados com atraso.</li>
              <li>
                É necessário julgamento humano: confira a fonte oficial antes de tirar conclusões,
                compartilhar ou agir com base em um achado.
              </li>
              <li>
                O Cidadão.AI não toma decisões sobre pessoas. Você pode pedir revisão humana de
                qualquer resultado (LGPD art. 20).
              </li>
            </ul>
          </div>
          <p className="mt-4">
            Todo achado, resultado e investigação da IA no aplicativo é exibido com o aviso{' '}
            <em>&ldquo;Um achado não é uma acusação&rdquo;</em>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Conteúdos e Usos Proibidos</h2>
          <p>Você não pode usar o Cidadão.AI para criar, enviar, armazenar ou compartilhar:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Material de abuso sexual infantil ou qualquer forma de sexualização de crianças.
            </li>
            <li>
              Discurso de ódio ou discriminação por raça, cor, etnia, religião, origem, gênero,
              orientação sexual, deficiência ou qualquer outra característica protegida.
            </li>
            <li>Assédio, ameaças, intimidação ou bullying.</li>
            <li>Incitação à violência, ao terrorismo ou à automutilação.</li>
            <li>
              Dados pessoais de terceiros (como CPF, endereços, telefones ou dados de saúde) que não
              façam parte de registros públicos oficiais, ou exposição de pessoas (doxxing).
            </li>
            <li>
              Difamação, ou apresentar achados da IA como fatos comprovados ou acusações contra
              pessoas identificadas.
            </li>
            <li>Qualquer outro conteúdo ou uso ilegal pela legislação brasileira.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Como Denunciar Conteúdo</h2>
          <p>Se encontrar conteúdo ou comportamento que viole esta política, denuncie:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Por e-mail:{' '}
              <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
                andersonhs27@gmail.com
              </a>{' '}
              (use este canal para tudo que envolva dados pessoais ou crianças).
            </li>
            <li>
              No GitHub:{' '}
              <a
                href="https://github.com/anderson-ntlabs/cidadao.ai-frontend/issues"
                className="text-green-600 hover:underline"
              >
                abra uma issue
              </a>{' '}
              para respostas da IA erradas ou nocivas que não incluam dados pessoais.
            </li>
          </ul>
          <p className="mt-4">
            Inclua o link da página, a data e uma breve descrição. Confirmamos o recebimento o
            quanto antes e priorizamos denúncias que envolvam crianças ou risco à segurança de
            alguém.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Remoção e Comunicação às Autoridades</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Conteúdo que viole esta política é removido, e a conta envolvida pode ser suspensa ou
              excluída.
            </li>
            <li>
              Quando a lei exigir, comunicamos às autoridades competentes. Material de abuso sexual
              infantil é sempre comunicado (ECA, Lei 8.069/1990, arts. 240 a 241-E), por exemplo
              pela central de denúncias da SaferNet Brasil e à Polícia Federal.
            </li>
            <li>
              Preservamos apenas os dados estritamente necessários para cumprir obrigação legal ou
              ordem judicial.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Proteção de Crianças</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Crianças usam a plataforma apenas pelo Ágora Kids, dentro de uma conta do pai, mãe ou
              responsável, com o consentimento específico dele (LGPD art. 14).
            </li>
            <li>
              Os agentes infantis (Monteiro Lobato e Tarsila do Amaral) verificam cada mensagem
              contra uma lista de temas bloqueados, recusam assuntos inadequados e respondem em
              linguagem adequada à idade.
            </li>
            <li>
              Os responsáveis podem acompanhar a atividade da criança e excluir os dados a qualquer
              momento.
            </li>
            <li>
              Agimos no melhor interesse da criança, como exigem o Estatuto da Criança e do
              Adolescente (ECA, Lei 8.069/1990) e o art. 14 da LGPD.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Políticas Relacionadas e Contato</h2>
          <p>
            Veja também a{' '}
            <a href="/pt/privacy" className="text-green-600 hover:underline">
              Política de Privacidade
            </a>{' '}
            e os{' '}
            <a href="/pt/terms" className="text-green-600 hover:underline">
              Termos de Uso
            </a>
            . Dúvidas sobre esta política: Anderson Henrique da Silva,{' '}
            <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
              andersonhs27@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
