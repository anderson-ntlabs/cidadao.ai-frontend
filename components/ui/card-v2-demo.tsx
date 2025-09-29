'use client'

import { 
  CardV2, 
  CardV2Header, 
  CardV2Title, 
  CardV2Description, 
  CardV2Content,
  CardV2Footer,
  CardV2Badge,
  CardV2Stat
} from './card'
import { ButtonV2 } from './button'
import { TrendingUp, Users, FileText, AlertCircle } from 'lucide-react'

export function CardV2Demo() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variantes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardV2 variant="elevated">
            <CardV2Header>
              <CardV2Title>Elevated</CardV2Title>
              <CardV2Description>Com sombra padrão</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              Este é o estilo padrão com sombra suave e efeito hover.
            </CardV2Content>
          </CardV2>

          <CardV2 variant="outlined">
            <CardV2Header>
              <CardV2Title>Outlined</CardV2Title>
              <CardV2Description>Com borda</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              Variante com borda que muda de cor no hover.
            </CardV2Content>
          </CardV2>

          <CardV2 variant="ghost">
            <CardV2Header>
              <CardV2Title>Ghost</CardV2Title>
              <CardV2Description>Sem fundo</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              Variante minimalista sem fundo ou borda.
            </CardV2Content>
          </CardV2>

          <CardV2 variant="filled">
            <CardV2Header>
              <CardV2Title>Filled</CardV2Title>
              <CardV2Description>Com fundo cinza</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              Variante com fundo preenchido.
            </CardV2Content>
          </CardV2>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cards Interativos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardV2 interactive variant="elevated">
            <CardV2Header>
              <CardV2Badge variant="success">Ativo</CardV2Badge>
              <CardV2Title>Card Clicável</CardV2Title>
              <CardV2Description>
                Este card tem hover lift effect
              </CardV2Description>
            </CardV2Header>
            <CardV2Content>
              Passe o mouse para ver o efeito de elevação.
            </CardV2Content>
          </CardV2>

          <CardV2 interactive variant="outlined">
            <CardV2Header>
              <CardV2Badge variant="warning">Pendente</CardV2Badge>
              <CardV2Title>Investigação #1234</CardV2Title>
              <CardV2Description>
                Análise em andamento
              </CardV2Description>
            </CardV2Header>
            <CardV2Content>
              Clique para ver detalhes da investigação.
            </CardV2Content>
          </CardV2>

          <CardV2 interactive>
            <CardV2Header>
              <CardV2Badge variant="info">Novo</CardV2Badge>
              <CardV2Title>Relatório Disponível</CardV2Title>
              <CardV2Description>
                Gerado há 5 minutos
              </CardV2Description>
            </CardV2Header>
            <CardV2Content>
              Relatório completo de transparência.
            </CardV2Content>
          </CardV2>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cards com Footer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardV2>
            <CardV2Header>
              <CardV2Title>Investigação Completa</CardV2Title>
              <CardV2Description>
                Análise detalhada de gastos públicos
              </CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="mb-2">
                Foram analisados 1.234 contratos públicos no período de Janeiro a Março de 2025.
              </p>
              <p>
                <span className="font-semibold text-brand-green-600">23 anomalias</span> foram detectadas
                e estão sendo investigadas pelos agentes especializados.
              </p>
            </CardV2Content>
            <CardV2Footer>
              <span className="text-sm text-gray-500">Atualizado há 2h</span>
              <div className="flex gap-2">
                <ButtonV2 size="sm" variant="ghost">Compartilhar</ButtonV2>
                <ButtonV2 size="sm">Ver Detalhes</ButtonV2>
              </div>
            </CardV2Footer>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title>Relatório Mensal</CardV2Title>
              <CardV2Description>
                Resumo executivo de transparência
              </CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-green-600 rounded-full" />
                  Total analisado: R$ 45.3M
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-yellow-600 rounded-full" />
                  Alertas gerados: 127
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-blue-600 rounded-full" />
                  Taxa de conformidade: 87%
                </li>
              </ul>
            </CardV2Content>
            <CardV2Footer>
              <ButtonV2 variant="primary" size="sm">
                Baixar PDF
              </ButtonV2>
            </CardV2Footer>
          </CardV2>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cards de Estatísticas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardV2Stat
            title="Investigações"
            value="1,234"
            description="Total este mês"
            trend={{ value: 12, isPositive: true }}
            icon={<FileText className="h-5 w-5 text-brand-green-600" />}
          />
          
          <CardV2Stat
            title="Anomalias"
            value="89"
            description="Detectadas hoje"
            trend={{ value: 5, isPositive: false }}
            icon={<AlertCircle className="h-5 w-5 text-brand-red-600" />}
          />
          
          <CardV2Stat
            title="Usuários Ativos"
            value="3.4K"
            description="Últimos 7 dias"
            trend={{ value: 18, isPositive: true }}
            icon={<Users className="h-5 w-5 text-brand-blue-600" />}
          />
          
          <CardV2Stat
            title="Taxa de Sucesso"
            value="94.2%"
            description="Resolução de casos"
            icon={<TrendingUp className="h-5 w-5 text-brand-green-600" />}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tamanhos de Padding</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardV2 padding="sm">
            <CardV2Title className="text-base">Small Padding</CardV2Title>
            <CardV2Content>Compacto</CardV2Content>
          </CardV2>

          <CardV2 padding="md">
            <CardV2Title className="text-base">Medium Padding</CardV2Title>
            <CardV2Content>Padrão</CardV2Content>
          </CardV2>

          <CardV2 padding="lg">
            <CardV2Title className="text-base">Large Padding</CardV2Title>
            <CardV2Content>Espaçoso</CardV2Content>
          </CardV2>

          <CardV2 padding="responsive">
            <CardV2Title className="text-base">Responsive</CardV2Title>
            <CardV2Content>Adaptável</CardV2Content>
          </CardV2>
        </div>
      </div>
    </div>
  )
}