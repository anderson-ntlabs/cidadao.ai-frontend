export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. O que são Cookies?</h2>
          <p>
            Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita 
            nosso site. Eles nos ajudam a melhorar sua experiência de navegação e garantir o 
            funcionamento adequado do site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Como Usamos Cookies</h2>
          <p>O Cidadão.AI utiliza apenas cookies essenciais para:</p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">2.1 Cookies Essenciais</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Preferência de tema:</strong> Armazena sua escolha entre modo claro/escuro</li>
            <li><strong>Idioma:</strong> Mantém sua preferência de idioma (PT/EN)</li>
            <li><strong>Sessão:</strong> Garante a continuidade durante sua navegação</li>
            <li><strong>Segurança:</strong> Protege contra ataques CSRF</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.2 Cookies Analíticos (Opcionais)</h3>
          <p>
            Não utilizamos cookies de rastreamento ou análise. Todas as métricas são coletadas 
            de forma agregada e anônima, sem identificar usuários individuais.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Cookies de Terceiros</h2>
          <p>
            <strong>Não utilizamos cookies de terceiros.</strong> Não compartilhamos dados com 
            redes sociais, anunciantes ou outros serviços externos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Gerenciamento de Cookies</h2>
          <p>Você pode controlar e gerenciar cookies através de:</p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">4.1 Configurações do Navegador</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
            <li><strong>Firefox:</strong> Opções → Privacidade e segurança → Cookies</li>
            <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
            <li><strong>Edge:</strong> Configurações → Privacidade → Cookies</li>
          </ul>
          
          <p className="mt-4">
            <strong>Atenção:</strong> Bloquear cookies essenciais pode afetar o funcionamento do site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Duração dos Cookies</h2>
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Cookie</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Duração</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Finalidade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">theme</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">1 ano</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Preferência de tema</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">locale</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">1 ano</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Idioma preferido</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">session</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Sessão</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Navegação contínua</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Segurança</h2>
          <p>
            Todos os cookies são transmitidos através de conexão segura (HTTPS) e configurados 
            com flags de segurança apropriadas (Secure, HttpOnly, SameSite).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Alterações significativas serão 
            comunicadas através do banner de cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
          <p>
            Para dúvidas sobre nossa política de cookies, consulte nossa 
            <a href="/pt/privacy" className="text-green-600 hover:underline"> Política de Privacidade</a> ou 
            entre em contato através do GitHub.
          </p>
        </section>
      </div>
    </div>
  )
}