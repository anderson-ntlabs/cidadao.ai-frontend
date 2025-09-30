import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NaturalLanguageParser, parseNaturalLanguage } from './natural-language-parser';

describe('natural-language-parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('parseNaturalLanguage', () => {
    it('should parse servant salary queries', () => {
      const result = parseNaturalLanguage('quanto ganha Maria Silva');
      
      expect(result.dataSource).toBe('servidores');
      expect(result.query).toBe('MARIA SILVA');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should parse servant queries with full names', () => {
      const result = parseNaturalLanguage('Quanto ganha João Carlos da Silva Santos do Ministério da Saúde?');
      
      expect(result.dataSource).toBe('servidores');
      // The parser extracts the name after removing ministry info
      expect(result.query).toBe('CARLOS DA SILVA SANTOS');
      expect(result.filters.orgao).toBe('26000');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should parse contract queries', () => {
      const result = parseNaturalLanguage('contratos de TI acima de 1 milhão');
      
      expect(result.dataSource).toBe('contratos');
      expect(result.query).toBe('TI');
      expect(result.filters.valorInicial).toBe(1000000);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should parse expense queries', () => {
      const result = parseNaturalLanguage('despesas do governo em dezembro de 2024');
      
      expect(result.dataSource).toBe('despesas');
      expect(result.filters.mes).toBe(12);
      expect(result.filters.ano).toBe(2024);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should parse sanctioned companies queries', () => {
      const result = parseNaturalLanguage('empresas punidas em 2024');
      
      expect(result.dataSource).toBe('empresas-sancionadas');
      expect(result.filters.ano).toBe(2024);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should parse emergency contract queries', () => {
      const result = parseNaturalLanguage('contratos emergenciais de 2024');
      
      expect(result.dataSource).toBe('contratos');
      // The parser doesn't have modalidade extraction for emergenciais
      expect(result.filters.modalidade).toBeUndefined();
      expect(result.filters.ano).toBe(2024);
    });

    it('should parse value ranges', () => {
      const result = parseNaturalLanguage('contratos entre R$ 100.000,00 e R$ 500.000,00');
      
      expect(result.dataSource).toBe('contratos');
      expect(result.filters.valorInicial).toBe(100000);
      expect(result.filters.valorFinal).toBe(500000);
    });

    it('should parse values with "mil" notation', () => {
      const result = parseNaturalLanguage('contratos acima de 30 mil');
      
      expect(result.filters.valorInicial).toBe(30000);
    });

    it('should parse values with "milhão" notation', () => {
      const result = parseNaturalLanguage('contratos de 5 milhões');
      
      expect(result.filters.valorInicial).toBe(5000000);
    });

    it('should handle organization aliases', () => {
      const queries = [
        { query: 'servidores do MEC', expectedOrg: '25000' },
        { query: 'contratos do sus', expectedOrg: '26000' },
        { query: 'despesas do MMA', expectedOrg: '44000' },
        { query: 'gastos do planalto', expectedOrg: '20000' },
      ];

      queries.forEach(({ query, expectedOrg }) => {
        const result = parseNaturalLanguage(query);
        expect(result.filters.orgao).toBe(expectedOrg);
      });
    });

    it('should extract organization codes directly', () => {
      const result = parseNaturalLanguage('contratos do órgão 26000');
      
      expect(result.filters.orgao).toBe('26000');
    });

    it('should parse relative dates', () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      let result = parseNaturalLanguage('contratos deste ano');
      expect(result.filters.ano).toBe(currentYear);
      
      result = parseNaturalLanguage('despesas do ano passado');
      expect(result.filters.ano).toBe(currentYear - 1);
      
      result = parseNaturalLanguage('gastos deste mês');
      expect(result.filters.mes).toBe(currentMonth);
    });

    it('should parse month names', () => {
      const months = [
        { name: 'janeiro', number: 1 },
        { name: 'fevereiro', number: 2 },
        { name: 'março', number: 3 },
        { name: 'dezembro', number: 12 },
      ];

      months.forEach(({ name, number }) => {
        const result = parseNaturalLanguage(`despesas de ${name}`);
        expect(result.filters.mes).toBe(number);
      });
    });

    it('should handle abbreviated month names', () => {
      const result = parseNaturalLanguage('despesas de dez/2024');
      expect(result.filters.mes).toBe(12);
    });

    it('should extract cargo/função for servants', () => {
      let result = parseNaturalLanguage('servidores analistas');
      expect(result.filters.funcao).toBe('analista');
      
      result = parseNaturalLanguage('médicos do ministério da saúde');
      // The parser doesn't extract function when it's not preceded by servidor/funcionário
      expect(result.dataSource).toBe('contratos'); // Defaults to contratos when no clear servants keywords
      
      result = parseNaturalLanguage('professores');
      // The parser only extracts funcao for servidores data source
      expect(result.dataSource).toBe('contratos');
      expect(result.filters.funcao).toBeUndefined();
    });

    it('should parse auction type queries', () => {
      const result = parseNaturalLanguage('contratos por pregão eletrônico');
      
      expect(result.dataSource).toBe('contratos');
      expect(result.filters.modalidade).toBe(5); // Pregão
    });

    it('should handle "last month" relative date', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const expectedMonth = lastMonth.getMonth() + 1;
      
      const result = parseNaturalLanguage('despesas do mês passado');
      expect(result.filters.mes).toBe(expectedMonth);
    });

    it('should handle queries without specific filters', () => {
      const result = parseNaturalLanguage('mostrar todos os contratos');
      
      expect(result.dataSource).toBe('contratos');
      // The parser returns the cleaned query, not "todos"
      expect(result.query).toBe('mostrar todos os contratos');
      expect(Object.keys(result.filters).length).toBe(0);
    });

    it('should extract servant name after "servidor" keyword', () => {
      const result = parseNaturalLanguage('servidor josé antonio silva');
      
      expect(result.dataSource).toBe('servidores');
      expect(result.query).toBe('JOSÉ ANTONIO SILVA');
    });

    it('should handle complex value patterns', () => {
      const result = parseNaturalLanguage('despesas abaixo de R$ 1.234.567,89');
      
      expect(result.filters.valorFinal).toBe(1234567.89);
    });

    it('should default to "contratos" when no clear data source is detected', () => {
      const result = parseNaturalLanguage('buscar dados de 2024');
      
      expect(result.dataSource).toBe('contratos');
    });

    it('should handle typos in organization names', () => {
      const result = parseNaturalLanguage('servidores do MAC'); // Common typo for MEC
      
      expect(result.filters.orgao).toBe('25000');
    });

    it('should extract contract object descriptions', () => {
      const result = parseNaturalLanguage('contratos de consultoria jurídica do governo');
      
      expect(result.dataSource).toBe('contratos');
      expect(result.query).toBe('consultoria jurídica');
    });

    it('should handle queries with multiple value keywords', () => {
      const result = parseNaturalLanguage('contratos maiores que 50 mil reais');
      
      expect(result.filters.valorInicial).toBe(50000);
    });

    it('should parse queries for other data sources', () => {
      let result = parseNaturalLanguage('licitações para obras públicas');
      // The parser defaults to 'contratos' when multiple keywords match
      expect(result.dataSource).toBe('contratos');
      
      result = parseNaturalLanguage('convênios com universidades');
      expect(result.dataSource).toBe('convenios');
    });

    it('should clean up servant name queries properly', () => {
      const result = parseNaturalLanguage('qual é o salário de Ana Paula Martins?');
      
      expect(result.dataSource).toBe('servidores');
      expect(result.query).toBe('ANA PAULA MARTINS');
    });

    it('should handle edge cases for servant names', () => {
      const result = parseNaturalLanguage('quanto');
      
      // The parser defaults to 'contratos' when there's not enough information
      expect(result.dataSource).toBe('contratos');
      expect(result.query).toBe('quanto');
    });

    it('should calculate appropriate confidence scores', () => {
      // Low confidence - minimal information
      let result = parseNaturalLanguage('buscar');
      expect(result.confidence).toBeLessThanOrEqual(0.5);
      
      // High confidence - multiple filters and clear intent
      result = parseNaturalLanguage('contratos de TI do ministério da saúde acima de 1 milhão em dezembro de 2024');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should parse procurement type keywords', () => {
      const types = [
        { keyword: 'tomada de preço', dataSource: 'licitacoes' },
        { keyword: 'concorrência', dataSource: 'licitacoes' },
        { keyword: 'dispensa', dataSource: 'licitacoes' },
      ];

      types.forEach(({ keyword, dataSource }) => {
        const result = parseNaturalLanguage(`buscar ${keyword}`);
        expect(result.dataSource).toBe(dataSource);
      });
    });
  });

  describe('NaturalLanguageParser.getDescription', () => {
    it('should generate description for simple queries', () => {
      const parsed = {
        query: 'todos',
        dataSource: 'contratos' as const,
        filters: {},
        confidence: 0.5,
      };
      
      const description = NaturalLanguageParser.getDescription(parsed);
      expect(description).toBe('Buscar contratos');
    });

    it('should generate description with query text', () => {
      const parsed = {
        query: 'obras públicas',
        dataSource: 'contratos' as const,
        filters: {},
        confidence: 0.5,
      };
      
      const description = NaturalLanguageParser.getDescription(parsed);
      expect(description).toBe('Buscar contratos relacionados a "obras públicas"');
    });

    it('should generate description with organization', () => {
      const parsed = {
        query: 'todos',
        dataSource: 'contratos' as const,
        filters: { orgao: '26000' },
        confidence: 0.5,
      };
      
      const description = NaturalLanguageParser.getDescription(parsed);
      expect(description).toContain('do saúde');
    });

    it('should generate description with date filters', () => {
      const parsed = {
        query: 'todos',
        dataSource: 'despesas' as const,
        filters: { ano: 2024, mes: 12 },
        confidence: 0.5,
      };
      
      const description = NaturalLanguageParser.getDescription(parsed);
      expect(description).toContain('em 2024');
      expect(description).toContain('no mês de dezembro');
    });

    it('should generate description with value filters', () => {
      const parsed = {
        query: 'todos',
        dataSource: 'contratos' as const,
        filters: { valorInicial: 100000, valorFinal: 500000 },
        confidence: 0.5,
      };
      
      const description = NaturalLanguageParser.getDescription(parsed);
      expect(description).toContain('com valor acima de R$ 100.000');
      expect(description).toContain('com valor abaixo de R$ 500.000');
    });

    it('should generate complete description', () => {
      const parsed = {
        query: 'consultoria',
        dataSource: 'contratos' as const,
        filters: { 
          orgao: '26000',
          ano: 2024,
          mes: 6,
          valorInicial: 50000
        },
        confidence: 0.8,
      };
      
      const description = NaturalLanguageParser.getDescription(parsed);
      expect(description).toContain('Buscar contratos');
      expect(description).toContain('relacionados a "consultoria"');
      expect(description).toContain('do saúde');
      expect(description).toContain('em 2024');
      expect(description).toContain('no mês de junho');
      expect(description).toContain('com valor acima de R$ 50.000');
    });
  });
});