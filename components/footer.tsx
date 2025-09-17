import Link from 'next/link'

interface FooterProps {
  locale: 'pt' | 'en'
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre o Projeto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{locale === 'pt' ? 'Sobre o Projeto' : 'About the Project'}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{locale === 'pt' ? 'Projeto para obtenção de título de Bacharel em Ciência da Computação' : 'Bachelor\'s degree project in Computer Science'}</p>
            <Link href="https://www.muz.ifsuldeminas.edu.br/" target="_blank" rel="noopener"
                  className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 hover:underline">
              IFSULDEMINAS - Campus Muzambinho
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{locale === 'pt' ? 'Aluno:' : 'Student:'} Anderson Henrique da Silva</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">{locale === 'pt' ? 'Orientadora:' : 'Advisor:'} Profa. Dra. Aracele Garcia de Oliveira Fassbinder</p>
          </div>

          {/* Autor */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{locale === 'pt' ? 'Autor' : 'Author'}</h3>
            <p className="font-medium">Anderson Henrique da Silva</p>
            <p className="text-gray-600 dark:text-gray-400">{locale === 'pt' ? 'Graduando em Ciência da Computação' : 'Computer Science Student'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">anderson.henrique@alunos.ifsuldeminas.edu.br</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="https://andersonhenrique.youcanbook.me/" target="_blank" rel="noopener" 
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
                📅 {locale === 'pt' ? 'Agendar Reunião' : 'Schedule Meeting'}
              </Link>
              <Link href="https://github.com/anderson-ufrj" target="_blank" rel="noopener" 
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                💻 GitHub
              </Link>
              <Link href="https://www.linkedin.com/in/anderson-h-silva95/" target="_blank" rel="noopener" 
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                💼 LinkedIn
              </Link>
              <Link href="mailto:andersonhs27@gmail.com" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                ✉️ andersonhs27@gmail.com
              </Link>
            </div>
          </div>

          {/* Mapa do Site */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{locale === 'pt' ? 'Mapa do Site' : 'Site Map'}</h3>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}`} className="text-sm text-gray-400 hover:text-gray-300">
                {locale === 'pt' ? 'Início' : 'Home'}
              </Link>
              <Link href={`/${locale}/agents`} className="text-sm text-gray-400 hover:text-gray-300">
                {locale === 'pt' ? 'Agentes de IA' : 'AI Agents'}
              </Link>
              <Link href={`/${locale}/about`} className="text-sm text-gray-400 hover:text-gray-300">
                {locale === 'pt' ? 'Sobre o Projeto' : 'About'}
              </Link>
              <Link href={`/${locale}/manifesto`} className="text-sm text-gray-400 hover:text-gray-300">
                {locale === 'pt' ? 'Manifesto' : 'Manifesto'}
              </Link>
              <Link href={`/${locale}/system`} className="text-sm text-gray-400 hover:text-gray-300">
                {locale === 'pt' ? 'Sistema' : 'System'}
              </Link>
              <Link href={`/${locale}/privacy`} className="text-sm text-gray-400 hover:text-gray-300">
                {locale === 'pt' ? 'Política de Privacidade' : 'Privacy Policy'}
              </Link>
              <Link href={`/${locale}/cookies`} className="text-sm text-gray-400 hover:text-gray-300">
                {locale === 'pt' ? 'Política de Cookies' : 'Cookie Policy'}
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} Cidadão.AI - {locale === 'pt' ? 'Projeto de código aberto sob licença MIT' : 'Open source project under MIT license'}</p>
          <p className="text-sm text-gray-500 mt-2">
            {locale === 'pt' 
              ? 'Comprometido com a transparência, ética e responsabilidade social através da tecnologia'
              : 'Committed to transparency, ethics and social responsibility through technology'
            }
          </p>
        </div>
      </div>
    </footer>
  )
}