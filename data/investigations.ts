/**
 * Investigation Mock Data
 *
 * Mock investigations used as fallback when backend returns empty
 * Shared between investigation list and detail pages
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

export interface MockInvestigation {
  id: string
  title: string
  description: string
  type: 'overpricing' | 'pattern' | 'fraud' | 'anomaly'
  status: 'critical' | 'active' | 'completed'
  confidence: number
  value: number
  dateCreated: Date
  dateUpdated: Date
  agents: string[]
  findings: number
  evidence: number
  riskLevel: 'crítico' | 'alto' | 'médio' | 'baixo'
  department: string
  location: string
}

export const mockInvestigations: MockInvestigation[] = [
  {
    id: 'INV-2024-001',
    title: 'Irregularidades em Licitação de Merenda Escolar',
    description: 'Detectadas anomalias significativas nos preços de alimentos básicos comparados com valores de mercado.',
    type: 'overpricing',
    status: 'critical',
    confidence: 94.5,
    value: 2340000,
    dateCreated: new Date('2024-01-15'),
    dateUpdated: new Date('2024-01-20'),
    agents: ['Zumbi dos Palmares', 'Anita Garibaldi'],
    findings: 12,
    evidence: 28,
    riskLevel: 'alto',
    department: 'Secretaria de Educação',
    location: 'São Paulo, SP'
  },
  {
    id: 'INV-2024-002',
    title: 'Padrões Suspeitos em Contratos de Obras',
    description: 'Identificado direcionamento em múltiplos contratos para a mesma empresa.',
    type: 'pattern',
    status: 'active',
    confidence: 87.3,
    value: 5670000,
    dateCreated: new Date('2024-01-18'),
    dateUpdated: new Date('2024-01-21'),
    agents: ['Machado de Assis', 'Tiradentes'],
    findings: 8,
    evidence: 15,
    riskLevel: 'médio',
    department: 'Secretaria de Infraestrutura',
    location: 'Rio de Janeiro, RJ'
  },
  {
    id: 'INV-2024-003',
    title: 'Possível Fraude em Folha de Pagamento',
    description: 'Funcionários fantasmas identificados através de análise de padrões de pagamento.',
    type: 'fraud',
    status: 'active',
    confidence: 91.2,
    value: 890000,
    dateCreated: new Date('2024-01-19'),
    dateUpdated: new Date('2024-01-21'),
    agents: ['Dandara', 'Carolina Maria de Jesus'],
    findings: 6,
    evidence: 19,
    riskLevel: 'alto',
    department: 'Secretaria de Administração',
    location: 'Brasília, DF'
  },
  {
    id: 'INV-2024-004',
    title: 'Anomalias em Compras Emergenciais',
    description: 'Compras emergenciais recorrentes sem justificativa adequada.',
    type: 'anomaly',
    status: 'completed',
    confidence: 78.9,
    value: 450000,
    dateCreated: new Date('2024-01-10'),
    dateUpdated: new Date('2024-01-17'),
    agents: ['Zumbi dos Palmares'],
    findings: 4,
    evidence: 10,
    riskLevel: 'baixo',
    department: 'Secretaria de Saúde',
    location: 'Salvador, BA'
  },
  {
    id: 'INV-2024-005',
    title: 'Superfaturamento em Contratos de TI',
    description: 'Valores 300% acima do mercado em contratos de software.',
    type: 'overpricing',
    status: 'critical',
    confidence: 96.7,
    value: 3200000,
    dateCreated: new Date('2024-01-20'),
    dateUpdated: new Date('2024-01-21'),
    agents: ['Ayrton Senna', 'Santos Dumont'],
    findings: 15,
    evidence: 32,
    riskLevel: 'crítico',
    department: 'Secretaria de Tecnologia',
    location: 'Curitiba, PR'
  }
]
