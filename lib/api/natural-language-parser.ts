import { createLogger } from '@/lib/logger'

const logger = createLogger('NaturalLanguageParser')

/**


 * Natural Language Parser for Cidadão.AI
 * Converts user queries in Portuguese to structured API requests
 */

export type DataSourceType =
  | 'servidores'
  | 'contratos'
  | 'despesas'
  | 'licitacoes'
  | 'convenios'
  | 'empresas-sancionadas'

export interface ParsedQuery {
  query: string
  dataSource: DataSourceType
  filters: Record<string, any>
  confidence: number
}

// Keywords for data source detection
const DATA_SOURCE_KEYWORDS = {
  servidores: [
    'servidor',
    'servidora',
    'funcionário',
    'funcionária',
    'salário',
    'remuneração',
    'ganha',
    'ganhar',
    'recebe',
    'receber',
    'pagamento',
    'vencimento',
    'gratificação',
    'cargo',
    'função',
    'trabalha',
    'trabalhar',
    'empregado',
    'concursado',
  ],
  contratos: [
    'contrato',
    'contratos',
    'licitação',
    'licitações',
    'pregão',
    'compra',
    'compras',
    'aquisição',
    'fornecedor',
    'fornecedores',
    'empresa',
    'empresas',
    'serviço',
    'obra',
    'obras',
    'contratado',
    'contratada',
    'terceirizado',
    'emergencial',
  ],
  despesas: [
    'despesa',
    'despesas',
    'gasto',
    'gastos',
    'pagamento',
    'pagamentos',
    'pagar',
    'despendido',
    'custo',
    'custos',
    'investimento',
    'investimentos',
    'verba',
  ],
  licitacoes: [
    'licitação',
    'licitações',
    'edital',
    'editais',
    'concorrência',
    'tomada de preço',
    'convite',
    'leilão',
    'pregão eletrônico',
    'dispensa',
    'inexigibilidade',
  ],
  convenios: [
    'convênio',
    'convênios',
    'parceria',
    'parcerias',
    'acordo',
    'acordos',
    'cooperação',
    'termo de cooperação',
    'repasse',
    'transferência',
  ],
  'empresas-sancionadas': [
    'sancionada',
    'sancionadas',
    'punida',
    'punidas',
    'penalizada',
    'penalizadas',
    'suspensa',
    'suspensas',
    'impedida',
    'impedidas',
    'inidônea',
    'inidôneas',
  ],
}

// Organization keywords and codes
const ORGANIZATION_MAP: Record<string, string> = {
  saúde: '26000',
  saude: '26000',
  'ministério da saúde': '26000',
  'ministerio da saude': '26000',
  sus: '26000',
  educação: '25000',
  educacao: '25000',
  'ministério da educação': '25000',
  'ministerio da educacao': '25000',
  mec: '25000',
  mac: '25000', // Common typo for MEC
  'meio ambiente': '44000',
  'ministério do meio ambiente': '44000',
  'ministerio do meio ambiente': '44000',
  mma: '44000',
  ibama: '44000',
  justiça: '36000',
  justica: '36000',
  'ministério da justiça': '36000',
  'ministerio da justica': '36000',
  mj: '36000',
  presidência: '20000',
  presidencia: '20000',
  planalto: '20000',
  'presidência da república': '20000',
  'presidencia da republica': '20000',
  pr: '20000',
}

// Value extraction patterns
const VALUE_PATTERNS = [
  /(?:acima|maior|mais|superior)\s+(?:de\s+)?(?:que\s+)?(?:R\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
  /(?:abaixo|menor|menos|inferior)\s+(?:de\s+)?(?:que\s+)?(?:R\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
  /(?:entre|de)\s+(?:R\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)\s+(?:a|e|até)\s+(?:R\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
  /(?:R\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)\s*(?:reais|mil|milhão|milhões)/i,
  /(\d+)\s*(?:mil|milhão|milhões)\s*(?:de\s+)?(?:reais)?/i,
]

// Date patterns
const MONTH_MAP: Record<string, number> = {
  janeiro: 1,
  jan: 1,
  fevereiro: 2,
  fev: 2,
  março: 3,
  mar: 3,
  abril: 4,
  abr: 4,
  maio: 5,
  mai: 5,
  junho: 6,
  jun: 6,
  julho: 7,
  jul: 7,
  agosto: 8,
  ago: 8,
  setembro: 9,
  set: 9,
  outubro: 10,
  out: 10,
  novembro: 11,
  nov: 11,
  dezembro: 12,
  dez: 12,
}

export class NaturalLanguageParser {
  /**
   * Parse natural language query to structured format
   */
  static parse(userQuery: string): ParsedQuery {
    const query = userQuery.toLowerCase().trim()

    logger.info('[NLP] Original query:', userQuery)

    // Detect data source
    const dataSource = this.detectDataSource(query)
    logger.info('[NLP] Detected data source:', dataSource)

    // Extract filters based on data source
    const filters = this.extractFilters(query, dataSource)
    logger.info('[NLP] Extracted filters:', filters)

    // Extract search terms (remove filter keywords)
    const searchQuery = this.extractSearchQuery(userQuery, dataSource) // Use original query for name extraction
    logger.info('[NLP] Extracted search query:', searchQuery)

    // Calculate confidence based on how well we understood the query
    const confidence = this.calculateConfidence(query, dataSource, filters)

    const result = {
      query: searchQuery,
      dataSource,
      filters,
      confidence,
    }

    logger.info('[NLP] Final parsed result:', result)

    return result
  }

  /**
   * Detect which data source the user is asking about
   */
  private static detectDataSource(query: string): DataSourceType {
    let bestMatch: DataSourceType = 'contratos' // default
    let maxScore = 0

    for (const [source, keywords] of Object.entries(DATA_SOURCE_KEYWORDS)) {
      const score = keywords.filter((keyword) => query.includes(keyword)).length

      if (score > maxScore) {
        maxScore = score
        bestMatch = source as DataSourceType
      }
    }

    // Special cases
    if (query.includes('quanto') && query.includes('ganh')) {
      return 'servidores'
    }
    if (query.includes('empresas') && query.includes('punid')) {
      return 'empresas-sancionadas'
    }

    return bestMatch
  }

  /**
   * Extract filters from the query
   */
  private static extractFilters(query: string, dataSource: DataSourceType): Record<string, any> {
    const filters: Record<string, any> = {}

    // Extract organization
    const orgao = this.extractOrganization(query)
    if (orgao) {
      filters.orgao = orgao
    }

    // Extract year
    const year = this.extractYear(query)
    if (year) {
      filters.ano = year
    }

    // Extract month
    const month = this.extractMonth(query)
    if (month) {
      filters.mes = month
    }

    // Extract values for contracts/expenses
    if (['contratos', 'despesas', 'licitacoes'].includes(dataSource)) {
      const values = this.extractValues(query)
      if (values.min) filters.valorInicial = values.min
      if (values.max) filters.valorFinal = values.max
    }

    // Extract specific filters per data source
    if (dataSource === 'servidores') {
      // Extract cargo/função
      if (query.includes('analista')) filters.funcao = 'analista'
      if (query.includes('médico') || query.includes('medico')) filters.funcao = 'medico'
      if (query.includes('professor')) filters.funcao = 'professor'
    }

    if (dataSource === 'contratos') {
      // Extract modality
      if (query.includes('emergencial')) filters.modalidade = 8 // Dispensa
      if (query.includes('pregão')) filters.modalidade = 5 // Pregão
    }

    return filters
  }

  /**
   * Extract organization from query
   */
  private static extractOrganization(query: string): string | null {
    for (const [keyword, code] of Object.entries(ORGANIZATION_MAP)) {
      if (query.includes(keyword)) {
        return code
      }
    }

    // Try to extract organization code directly (e.g., "órgão 26000")
    const codeMatch = query.match(/(?:órgão|orgao|código|codigo)\s+(\d{5})/)
    if (codeMatch) {
      return codeMatch[1]
    }

    return null
  }

  /**
   * Extract year from query
   */
  private static extractYear(query: string): number | null {
    // Current year reference
    const currentYear = new Date().getFullYear()

    // Explicit year
    const yearMatch = query.match(/\b(20\d{2})\b/)
    if (yearMatch) {
      return parseInt(yearMatch[1])
    }

    // Relative references
    if (query.includes('este ano') || query.includes('ano atual')) {
      return currentYear
    }
    if (query.includes('ano passado') || query.includes('último ano')) {
      return currentYear - 1
    }

    return null
  }

  /**
   * Extract month from query
   */
  private static extractMonth(query: string): number | null {
    // Check for month names
    for (const [monthName, monthNumber] of Object.entries(MONTH_MAP)) {
      if (query.includes(monthName)) {
        return monthNumber
      }
    }

    // Check for "mês passado", "último mês"
    if (query.includes('mês passado') || query.includes('último mês')) {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      return lastMonth.getMonth() + 1
    }

    // Check for "este mês"
    if (query.includes('este mês') || query.includes('mês atual')) {
      return new Date().getMonth() + 1
    }

    return null
  }

  /**
   * Extract value ranges from query
   */
  private static extractValues(query: string): { min?: number; max?: number } {
    const values: { min?: number; max?: number } = {}

    for (const pattern of VALUE_PATTERNS) {
      const match = query.match(pattern)
      if (match) {
        // Handle different pattern types
        if (pattern.source.includes('acima|maior')) {
          values.min = this.parseValue(match[1])
        } else if (pattern.source.includes('abaixo|menor')) {
          values.max = this.parseValue(match[1])
        } else if (pattern.source.includes('entre|de')) {
          values.min = this.parseValue(match[1])
          values.max = this.parseValue(match[2])
        } else {
          // Single value - interpret based on context
          const value = this.parseValue(match[1])
          if (query.includes('acima') || query.includes('maior')) {
            values.min = value
          } else if (query.includes('abaixo') || query.includes('menor')) {
            values.max = value
          }
        }
        break
      }
    }

    // Handle "X mil/milhão"
    if (query.match(/(\d+)\s*mil/)) {
      const match = query.match(/(\d+)\s*mil/)
      if (match) {
        const value = parseInt(match[1]) * 1000
        if (query.includes('acima') || query.includes('maior')) {
          values.min = value
        } else {
          values.min = value
        }
      }
    }

    if (query.match(/(\d+)\s*milh/)) {
      const match = query.match(/(\d+)\s*milh/)
      if (match) {
        const value = parseInt(match[1]) * 1000000
        if (query.includes('acima') || query.includes('maior')) {
          values.min = value
        } else {
          values.min = value
        }
      }
    }

    return values
  }

  /**
   * Parse Brazilian number format to float
   */
  private static parseValue(valueStr: string): number {
    // Remove R$ and spaces
    let cleaned = valueStr.replace(/R\$\s*/, '').trim()

    // Handle Brazilian format (1.234.567,89)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')

    return parseFloat(cleaned)
  }

  /**
   * Extract search query removing filter keywords
   */
  private static extractSearchQuery(query: string, dataSource: DataSourceType): string {
    let searchQuery = query

    // Extract names for servant searches FIRST
    if (dataSource === 'servidores') {
      // Remove question words and common phrases
      searchQuery = searchQuery
        .replace(/quanto\s+(ganha|recebe)/gi, '')
        .replace(/qual\s+(é|e)\s+o\s+salário/gi, '')
        .replace(/\?/g, '')
        .replace(/quanto/gi, '')
        .replace(/ganha/gi, '')
        .replace(/recebe/gi, '')
        .replace(/salário/gi, '')
        .replace(/remuneração/gi, '')
        .trim()

      // Look for complete names with proper capitalization
      // First try to find a complete name sequence
      const fullNamePattern =
        /([A-ZÁÊÉÍÓÚÃÕÇ][a-záêéíóúãõç]+(?:\s+(?:da|de|do|das|dos|e)\s+)?[A-ZÁÊÉÍÓÚÃÕÇ][a-záêéíóúãõç]+(?:\s+(?:da|de|do|das|dos|e)\s+)?(?:[A-ZÁÊÉÍÓÚÃÕÇ][a-záêéíóúãõç]+)?(?:\s+[A-ZÁÊÉÍÓÚÃÕÇ][a-záêéíóúãõç]+)*)/

      const nameMatch = query.match(fullNamePattern)
      if (nameMatch && nameMatch[1]) {
        const extractedName = nameMatch[1].trim()
        // Ensure we have at least 2 words (first and last name)
        if (extractedName.split(/\s+/).length >= 2) {
          logger.info('[NLP] Extracted full name:', extractedName)
          return extractedName.toUpperCase()
        }
      }

      // If no full name found, try after "funcionário/servidor"
      const servantMatch = query.match(
        /(?:servidor|funcionário|servidora|funcionária)\s+([a-záêéíóúãõç]+(?:\s+[a-záêéíóúãõç]+)+)/i
      )
      if (servantMatch && servantMatch[1]) {
        return servantMatch[1].toUpperCase()
      }

      // If no full name found, try to extract any name-like words
      const words = searchQuery
        .split(' ')
        .filter((word) => word.length > 2 && /^[A-ZÁÊÉÍÓÚÃÕÇ][a-záêéíóúãõç]+$/.test(word))

      if (words.length >= 2) {
        return words.join(' ').toUpperCase()
      }

      // Last resort: return cleaned query
      return searchQuery.toUpperCase()
    }

    // Remove common filter phrases for other data sources
    const filterPhrases = [
      /(?:acima|maior|mais|superior|abaixo|menor|menos|inferior)\s+(?:de\s+)?(?:que\s+)?(?:R\$\s*)?\d+(?:\.\d{3})*(?:,\d{2})?/gi,
      /(?:do|da)\s+(?:ministério|ministerio)\s+(?:da|do)\s+\w+/gi,
      /(?:em|no|na)\s+\d{4}/gi,
      /(?:em|no|na)\s+(?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/gi,
      /(?:este|esse|último|passado)\s+(?:ano|mês|mes)/gi,
      /órgão\s+\d{5}/gi,
      /R\$\s*\d+(?:\.\d{3})*(?:,\d{2})?/gi,
    ]

    for (const phrase of filterPhrases) {
      searchQuery = searchQuery.replace(phrase, '').trim()
    }

    // For contracts/expenses, extract object description
    if (dataSource === 'contratos') {
      const keywords = [
        'contratos de',
        'contrato de',
        'serviços de',
        'serviço de',
        'compra de',
        'aquisição de',
      ]
      for (const keyword of keywords) {
        const match = query.match(
          new RegExp(
            `${keyword}\\s+([\\wáêéíóúçãõ\\s]+?)(?:\\s+(?:com|acima|abaixo|do|da|no|em)|$)`,
            'i'
          )
        )
        if (match) {
          return match[1].trim()
        }
      }
    }

    // If no specific extraction, use cleaned query or "todos"
    return searchQuery || 'todos'
  }

  /**
   * Calculate confidence score for the parsed query
   */
  private static calculateConfidence(
    query: string,
    dataSource: DataSourceType,
    filters: Record<string, any>
  ): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence for each detected element
    const keywords = DATA_SOURCE_KEYWORDS[dataSource]
    const keywordMatches = keywords.filter((k) => query.includes(k)).length
    confidence += keywordMatches * 0.1

    // Increase confidence for filters
    if (filters.orgao) confidence += 0.1
    if (filters.ano) confidence += 0.1
    if (filters.mes) confidence += 0.05
    if (filters.valorInicial || filters.valorFinal) confidence += 0.1

    // Cap at 0.95
    return Math.min(confidence, 0.95)
  }

  /**
   * Get a human-readable description of the parsed query
   */
  static getDescription(parsed: ParsedQuery): string {
    const parts: string[] = []

    // Data source
    const sourceNames: Record<DataSourceType, string> = {
      servidores: 'servidores públicos',
      contratos: 'contratos',
      despesas: 'despesas',
      licitacoes: 'licitações',
      convenios: 'convênios',
      'empresas-sancionadas': 'empresas sancionadas',
    }
    parts.push(`Buscar ${sourceNames[parsed.dataSource]}`)

    // Query
    if (parsed.query && parsed.query !== 'todos') {
      parts.push(`relacionados a "${parsed.query}"`)
    }

    // Filters
    if (parsed.filters.orgao) {
      const orgName = Object.entries(ORGANIZATION_MAP).find(
        ([_, code]) => code === parsed.filters.orgao
      )?.[0]
      if (orgName) {
        parts.push(`do ${orgName}`)
      }
    }

    if (parsed.filters.ano) {
      parts.push(`em ${parsed.filters.ano}`)
    }

    if (parsed.filters.mes) {
      const monthName = Object.entries(MONTH_MAP).find(
        ([_, num]) => num === parsed.filters.mes
      )?.[0]
      if (monthName) {
        parts.push(`no mês de ${monthName}`)
      }
    }

    if (parsed.filters.valorInicial) {
      parts.push(`com valor acima de R$ ${parsed.filters.valorInicial.toLocaleString('pt-BR')}`)
    }

    if (parsed.filters.valorFinal) {
      parts.push(`com valor abaixo de R$ ${parsed.filters.valorFinal.toLocaleString('pt-BR')}`)
    }

    return parts.join(' ')
  }
}

// Export convenience function
export function parseNaturalLanguage(query: string): ParsedQuery {
  return NaturalLanguageParser.parse(query)
}
