/**
 * Query parser for natural language to API parameters
 */

export type DataSource = 'servidores' | 'contratos' | 'despesas' | 'licitacoes' | 'convenios' | 'empresas-sancionadas';

export interface ParsedQuery {
  dataSource: DataSource;
  searchTerm: string;
  filters: Record<string, any>;
}

/**
 * Parse natural language query to determine data source and search parameters
 */
export function parseUserQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  
  // Keywords for each data source
  const dataSourceKeywords = {
    servidores: ['servidor', 'servidores', 'funcionário', 'funcionários', 'salário', 'salários', 'remuneração', 'cargo', 'cargos'],
    contratos: ['contrato', 'contratos', 'licitação', 'licitações', 'compra', 'compras', 'aquisição', 'fornecedor'],
    despesas: ['despesa', 'despesas', 'gasto', 'gastos', 'pagamento', 'pagamentos', 'custo', 'custos'],
    licitacoes: ['licitação', 'licitações', 'pregão', 'pregões', 'concorrência', 'tomada de preços'],
    convenios: ['convênio', 'convênios', 'acordo', 'acordos', 'parceria', 'parcerias', 'repasse'],
    'empresas-sancionadas': ['sanção', 'sanções', 'sancionada', 'sancionadas', 'punida', 'punidas', 'inidônea']
  };
  
  // Detect data source from keywords
  let detectedSource: DataSource = 'servidores'; // default
  for (const [source, keywords] of Object.entries(dataSourceKeywords)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      detectedSource = source as DataSource;
      break;
    }
  }
  
  // Extract filters
  const filters: Record<string, any> = {};
  
  // Extract year (formato: 2024, 2023, etc)
  const yearMatch = query.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    filters.ano = parseInt(yearMatch[1]);
  }
  
  // Extract month names
  const monthNames = {
    'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
    'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
    'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
  };
  
  for (const [monthName, monthNum] of Object.entries(monthNames)) {
    if (lowerQuery.includes(monthName)) {
      filters.mes = monthNum;
      break;
    }
  }
  
  // Extract value ranges
  const valueMatch = query.match(/(?:acima|maior|superior)\s+(?:de\s+)?(?:R\$\s*)?([0-9.,]+)/i);
  if (valueMatch) {
    const value = parseFloat(valueMatch[1].replace(/\./g, '').replace(',', '.'));
    filters.valor_inicial = value;
  }
  
  // Extract organization codes or names
  const orgKeywords = {
    'saúde': '26000',
    'educação': '25000',
    'fazenda': '22000',
    'justiça': '20000'
  };
  
  for (const [keyword, code] of Object.entries(orgKeywords)) {
    if (lowerQuery.includes(keyword)) {
      filters.orgao = code;
      break;
    }
  }
  
  // Clean search term by removing detected filters and data source keywords
  let searchTerm = query;
  
  // Remove year
  if (yearMatch) {
    searchTerm = searchTerm.replace(yearMatch[0], '');
  }
  
  // Remove data source keywords
  for (const keywords of Object.values(dataSourceKeywords)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      searchTerm = searchTerm.replace(regex, '');
    }
  }
  
  // Remove common words
  const commonWords = ['buscar', 'procurar', 'encontrar', 'listar', 'mostrar', 'ver', 'relacionado', 'relacionada', 'a', 'de', 'do', 'da', 'dos', 'das', 'com', 'para', 'em'];
  for (const word of commonWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    searchTerm = searchTerm.replace(regex, '');
  }
  
  // Clean up extra spaces
  searchTerm = searchTerm.replace(/\s+/g, ' ').trim();
  
  // If search term is empty after cleaning, use a default
  if (!searchTerm) {
    searchTerm = 'todos';
  }
  
  return {
    dataSource: detectedSource,
    searchTerm,
    filters
  };
}

/**
 * Format the parsed query for display
 */
export function formatParsedQuery(parsed: ParsedQuery): string {
  let description = `Buscando por "${parsed.searchTerm}" em ${parsed.dataSource}`;
  
  if (Object.keys(parsed.filters).length > 0) {
    const filterParts = [];
    
    if (parsed.filters.ano) {
      filterParts.push(`ano ${parsed.filters.ano}`);
    }
    
    if (parsed.filters.mes) {
      const monthNames = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                         'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      filterParts.push(`mês ${monthNames[parsed.filters.mes]}`);
    }
    
    if (parsed.filters.valor_inicial) {
      filterParts.push(`valor acima de R$ ${parsed.filters.valor_inicial.toLocaleString('pt-BR')}`);
    }
    
    if (parsed.filters.orgao) {
      filterParts.push(`órgão ${parsed.filters.orgao}`);
    }
    
    if (filterParts.length > 0) {
      description += ` com filtros: ${filterParts.join(', ')}`;
    }
  }
  
  return description;
}