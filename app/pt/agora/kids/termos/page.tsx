/**
 * Kids Terms of Use Page
 *
 * Terms and privacy policy specifically for the Kids area.
 * DRAFT - Requires legal review before production use.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import Link from 'next/link'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { AlertTriangle, Baby, Shield, Eye, Lock, Trash2, ArrowLeft } from 'lucide-react'

export default function KidsTermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kids-cream to-white dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/pt/agora/kids"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-kids-coral transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Área Kids
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-kids-coral to-kids-turquoise flex items-center justify-center">
              <Baby className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Termos de Uso - Área Kids</h1>
              <p className="text-sm text-muted-foreground">Cidadão.AI - Ágora Academy</p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-8">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-800 dark:text-amber-200">DOCUMENTO EM REVISÃO</p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Este documento é um rascunho e está sujeito a revisão por especialista jurídico
                antes de entrar em vigor. Última atualização: Dezembro 2025.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-kids-coral/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-kids-coral" />
                </div>
                <h2 className="text-lg font-bold">1. Sobre a Área Kids</h2>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  A Área Kids do Cidadão.AI é um ambiente educacional projetado especialmente para
                  crianças aprenderem conceitos básicos de programação e tecnologia de forma lúdica
                  e segura.
                </p>

                <p>
                  <strong className="text-foreground">1.1 Público-alvo:</strong> Crianças de 6 a 12
                  anos, sempre com supervisão e consentimento de pais ou responsáveis legais.
                </p>

                <p>
                  <strong className="text-foreground">1.2 Conteúdo:</strong> Vídeos educativos
                  curados de canais públicos do YouTube, conversas com mentores de IA especialmente
                  configurados para interação infantil (Monteiro Lobato e Tarsila do Amaral), e
                  atividades de aprendizado.
                </p>

                <p>
                  <strong className="text-foreground">1.3 Sem Gamificação:</strong> A Área Kids não
                  possui sistema de pontos (XP), badges ou ranking para evitar dinâmicas
                  competitivas ou viciantes.
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Section 2 */}
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-kids-turquoise/20 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-kids-turquoise" />
                </div>
                <h2 className="text-lg font-bold">2. Consentimento Parental</h2>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">2.1 Requisito obrigatório:</strong> A criação
                  de um perfil na Área Kids requer que um pai ou responsável legal configure a conta
                  e aceite estes termos.
                </p>

                <p>
                  <strong className="text-foreground">2.2 Código de Acesso Parental:</strong> Ao
                  configurar a Área Kids, um código único de 6 caracteres é gerado e exibido apenas
                  uma vez. Este código é a única forma de acessar o dashboard parental com
                  relatórios de uso.
                </p>

                <p>
                  <strong className="text-foreground">2.3 Responsabilidade:</strong> O
                  pai/responsável é responsável por guardar o código de acesso com segurança. O
                  sistema não armazena nem recupera códigos perdidos por razões de segurança.
                </p>

                <p>
                  <strong className="text-foreground">2.4 Supervisão:</strong> Recomendamos que o
                  uso da plataforma pela criança seja supervisionado ou que o pai/responsável revise
                  periodicamente os relatórios de uso disponíveis no dashboard parental.
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Section 3 */}
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-kids-purple/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-kids-purple" />
                </div>
                <h2 className="text-lg font-bold">3. Privacidade e Dados</h2>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">3.1 Dados coletados:</strong> Coletamos apenas
                  o nome da criança (para personalização), avatar escolhido, e métricas de uso
                  (vídeos assistidos, interações com mentores, tempo de sessão).
                </p>

                <p>
                  <strong className="text-foreground">3.2 Não coletamos:</strong> Dados sensíveis,
                  informações de localização, fotos, dados de contato da criança, ou qualquer
                  informação que possa identificar diretamente a criança fora da plataforma.
                </p>

                <p>
                  <strong className="text-foreground">3.3 Finalidade dos dados:</strong> Os dados de
                  uso são utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Personalizar a experiência de aprendizado</li>
                  <li>Gerar relatórios para os pais/responsáveis</li>
                  <li>Melhorar o conteúdo educacional oferecido</li>
                </ul>

                <p>
                  <strong className="text-foreground">3.4 Compartilhamento:</strong> Os dados NÃO
                  são compartilhados com terceiros, exceto quando exigido por lei.
                </p>

                <p>
                  <strong className="text-foreground">3.5 Armazenamento:</strong> Os dados são
                  armazenados de forma segura em servidores protegidos, com criptografia em trânsito
                  e em repouso.
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Section 4 */}
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-kids-green/20 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-kids-green" />
                </div>
                <h2 className="text-lg font-bold">4. Direitos dos Pais/Responsáveis</h2>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  De acordo com a LGPD e normativas de proteção à criança, os pais têm direito a:
                </p>

                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong className="text-foreground">Acesso:</strong> Visualizar todos os dados
                    coletados sobre seu filho através do dashboard parental.
                  </li>
                  <li>
                    <strong className="text-foreground">Correção:</strong> Solicitar correção de
                    dados incorretos.
                  </li>
                  <li>
                    <strong className="text-foreground">Exclusão:</strong> Solicitar a exclusão
                    completa do perfil Kids e todos os dados associados a qualquer momento.
                  </li>
                  <li>
                    <strong className="text-foreground">Portabilidade:</strong> Exportar os dados em
                    formato legível.
                  </li>
                  <li>
                    <strong className="text-foreground">Revogação:</strong> Revogar o consentimento
                    e desativar a Área Kids a qualquer momento.
                  </li>
                </ul>

                <p className="mt-4">
                  Para exercer estes direitos, acesse o dashboard parental com seu código ou entre
                  em contato através do email:{' '}
                  <a
                    href="mailto:privacidade@cidadao.ai"
                    className="text-kids-coral hover:underline"
                  >
                    privacidade@cidadao.ai
                  </a>
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Section 5 */}
          <GlassCard>
            <GlassCardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">5. Interação com Mentores de IA</h2>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">5.1 Natureza das respostas:</strong> Os
                  mentores (Monteiro Lobato e Tarsila do Amaral) são personagens de IA configurados
                  para interações educativas e apropriadas para crianças. Suas respostas são geradas
                  por inteligência artificial e não substituem orientação humana.
                </p>

                <p>
                  <strong className="text-foreground">5.2 Limitações:</strong> Os mentores são
                  programados para recusar discussões sobre temas inadequados para crianças e
                  redirecionar conversas para assuntos educacionais.
                </p>

                <p>
                  <strong className="text-foreground">5.3 Supervisão:</strong> Todas as interações
                  são registradas e disponibilizadas no dashboard parental para revisão.
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Section 6 */}
          <GlassCard>
            <GlassCardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">6. Conteúdo de Terceiros</h2>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">6.1 Vídeos do YouTube:</strong> A plataforma
                  exibe vídeos educativos de canais públicos do YouTube. Estes vídeos são curados
                  pela nossa equipe, mas o conteúdo é de responsabilidade dos criadores originais.
                </p>

                <p>
                  <strong className="text-foreground">6.2 Publicidade:</strong> Os vídeos do YouTube
                  podem conter publicidade inserida pela plataforma YouTube. Não temos controle
                  sobre estes anúncios.
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Section 7 */}
          <GlassCard>
            <GlassCardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">7. Alterações nestes Termos</h2>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Reservamo-nos o direito de atualizar estes termos. Alterações significativas serão
                  comunicadas através do dashboard parental e requererão novo consentimento.
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Section 8 */}
          <GlassCard>
            <GlassCardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">8. Contato</h2>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Para dúvidas, sugestões ou exercício de direitos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Email:{' '}
                    <a href="mailto:kids@cidadao.ai" className="text-kids-coral hover:underline">
                      kids@cidadao.ai
                    </a>
                  </li>
                  <li>
                    Privacidade:{' '}
                    <a
                      href="mailto:privacidade@cidadao.ai"
                      className="text-kids-coral hover:underline"
                    >
                      privacidade@cidadao.ai
                    </a>
                  </li>
                </ul>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-8 pb-4">
            <p>Cidadão.AI - Ágora Academy - Área Kids</p>
            <p className="mt-1">Versão do documento: 1.0 (Rascunho) - Dezembro 2025</p>
            <p className="mt-4 text-xs">
              Este documento está em conformidade com a Lei Geral de Proteção de Dados (LGPD),
              Estatuto da Criança e do Adolescente (ECA), e diretrizes internacionais de proteção à
              privacidade infantil (COPPA).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
