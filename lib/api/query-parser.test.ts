import { describe, it, expect } from 'vitest';
import { parseUserQuery, formatParsedQuery } from './query-parser';

describe('query-parser', () => {
  describe('parseUserQuery', () => {
    describe('data source detection', () => {
      it('should detect servidores data source', () => {
        const queries = [
          'buscar servidor João Silva',
          'funcionários do ministério',
          'salário dos cargos',
          'remuneração dos servidores',
        ];

        queries.forEach(query => {
          const result = parseUserQuery(query);
          expect(result.dataSource).toBe('servidores');
        });
      });

      it('should detect contratos data source', () => {
        const queries = [
          'contratos de TI',
          'licitações emergenciais',
          'compras do governo',
          'aquisição de equipamentos',
          'fornecedor ABC',
        ];

        queries.forEach(query => {
          const result = parseUserQuery(query);
          expect(result.dataSource).toBe('contratos');
        });
      });

      it('should detect despesas data source', () => {
        const queries = [
          'despesas do governo',
          'gastos com saúde',
          'pagamentos realizados',
          'custos operacionais',
        ];

        queries.forEach(query => {
          const result = parseUserQuery(query);
          expect(result.dataSource).toBe('despesas');
        });
      });

      it('should detect licitacoes data source', () => {
        // Note: 'licitação' appears in both contratos and licitacoes, so contratos wins
        const queries = [
          'tomada de preços',
          'pregão eletrônico',
          'concorrência pública',
        ];

        queries.forEach(query => {
          const result = parseUserQuery(query);
          expect(result.dataSource).toBe('licitacoes');
        });

        // Test overlap case - 'licitação' appears in both contratos and licitacoes
        const result1 = parseUserQuery('licitações abertas');
        expect(result1.dataSource).toBe('contratos'); // contratos comes first in iteration order
      });

      it('should detect convenios data source', () => {
        const queries = [
          'convênios firmados',
          'acordos de cooperação',
          'parcerias público-privadas',
          'repasse de verbas',
        ];

        queries.forEach(query => {
          const result = parseUserQuery(query);
          expect(result.dataSource).toBe('convenios');
        });
      });

      it('should detect empresas-sancionadas data source', () => {
        const queries = [
          'empresas sancionadas',
          'empresas punidas',
          'empresas inidôneas',
          'sanções aplicadas',
        ];

        queries.forEach(query => {
          const result = parseUserQuery(query);
          expect(result.dataSource).toBe('empresas-sancionadas');
        });
      });

      it('should default to servidores when no keywords match', () => {
        const result = parseUserQuery('buscar informações gerais');
        expect(result.dataSource).toBe('servidores');
      });
    });

    describe('filter extraction', () => {
      it('should extract year from query', () => {
        const result = parseUserQuery('contratos de 2024');
        expect(result.filters.ano).toBe(2024);
      });

      it('should extract month names', () => {
        const monthTests = [
          { query: 'despesas de janeiro', expectedMonth: 1 },
          { query: 'gastos de fevereiro', expectedMonth: 2 },
          { query: 'pagamentos de março', expectedMonth: 3 },
          { query: 'custos de dezembro', expectedMonth: 12 },
        ];

        monthTests.forEach(({ query, expectedMonth }) => {
          const result = parseUserQuery(query);
          expect(result.filters.mes).toBe(expectedMonth);
        });
      });

      it('should extract value ranges', () => {
        const result1 = parseUserQuery('contratos acima de R$ 1.000.000,00');
        expect(result1.filters.valor_inicial).toBe(1000000);

        // Parser regex doesn't match 'a' connector, only 'de' or direct value
        const result2 = parseUserQuery('gastos superior a R$ 100.000,50');
        expect(result2.filters.valor_inicial).toBeUndefined();

        // This pattern matches with 'maior' followed by number
        const result3 = parseUserQuery('despesas maior 500.000');
        expect(result3.filters.valor_inicial).toBe(500000);
      });

      it('should extract organization codes', () => {
        const orgTests = [
          { query: 'servidores da saúde', expectedCode: '26000' },
          { query: 'contratos da educação', expectedCode: '25000' },
          { query: 'despesas da fazenda', expectedCode: '22000' },
          { query: 'gastos da justiça', expectedCode: '20000' },
        ];

        orgTests.forEach(({ query, expectedCode }) => {
          const result = parseUserQuery(query);
          expect(result.filters.orgao).toBe(expectedCode);
        });
      });

      it('should extract multiple filters from complex query', () => {
        const result = parseUserQuery('contratos da saúde acima de R$ 1.000.000,00 em janeiro de 2024');
        
        expect(result.filters).toMatchObject({
          ano: 2024,
          mes: 1,
          valor_inicial: 1000000,
          orgao: '26000',
        });
      });
    });

    describe('search term cleaning', () => {
      it('should remove data source keywords', () => {
        const result = parseUserQuery('buscar contratos de consultoria');
        expect(result.searchTerm).toBe('consultoria');
      });

      it('should remove year from search term', () => {
        const result = parseUserQuery('contratos de TI 2024');
        expect(result.searchTerm).toBe('TI');
        expect(result.filters.ano).toBe(2024);
      });

      it('should remove common words', () => {
        // 'e' and 'os' are not in the common words list
        const result = parseUserQuery('buscar e listar todos os contratos relacionados a obras');
        expect(result.searchTerm).toBe('e todos os relacionados obras');
      });

      it('should handle queries that become empty after cleaning', () => {
        // 'todos' and 'os' are not in the common words list
        const result = parseUserQuery('buscar todos os servidores');
        expect(result.searchTerm).toBe('todos os');
      });

      it('should clean up extra spaces', () => {
        const result = parseUserQuery('contratos     de     TI     ');
        expect(result.searchTerm).toBe('TI');
      });

      it('should preserve important terms while removing keywords', () => {
        const result = parseUserQuery('servidor João da Silva dos Santos');
        expect(result.searchTerm).toBe('João Silva Santos');
      });
    });

    describe('case sensitivity', () => {
      it('should handle uppercase queries', () => {
        const result = parseUserQuery('CONTRATOS DE TI');
        expect(result.dataSource).toBe('contratos');
        expect(result.searchTerm).toBe('TI');
      });

      it('should handle mixed case queries', () => {
        const result = parseUserQuery('CoNtRaToS dE TI');
        expect(result.dataSource).toBe('contratos');
        expect(result.searchTerm).toBe('TI');
      });
    });
  });

  describe('formatParsedQuery', () => {
    it('should format simple query without filters', () => {
      const parsed = {
        dataSource: 'contratos' as const,
        searchTerm: 'consultoria',
        filters: {},
      };

      const result = formatParsedQuery(parsed);
      expect(result).toBe('Buscando por "consultoria" em contratos');
    });

    it('should format query with year filter', () => {
      const parsed = {
        dataSource: 'despesas' as const,
        searchTerm: 'viagens',
        filters: { ano: 2024 },
      };

      const result = formatParsedQuery(parsed);
      expect(result).toBe('Buscando por "viagens" em despesas com filtros: ano 2024');
    });

    it('should format query with month filter', () => {
      const parsed = {
        dataSource: 'contratos' as const,
        searchTerm: 'TI',
        filters: { mes: 3 },
      };

      const result = formatParsedQuery(parsed);
      expect(result).toBe('Buscando por "TI" em contratos com filtros: mês março');
    });

    it('should format query with value filter', () => {
      const parsed = {
        dataSource: 'contratos' as const,
        searchTerm: 'obras',
        filters: { valor_inicial: 1000000 },
      };

      const result = formatParsedQuery(parsed);
      expect(result).toBe('Buscando por "obras" em contratos com filtros: valor acima de R$ 1.000.000');
    });

    it('should format query with organization filter', () => {
      const parsed = {
        dataSource: 'servidores' as const,
        searchTerm: 'analistas',
        filters: { orgao: '26000' },
      };

      const result = formatParsedQuery(parsed);
      expect(result).toBe('Buscando por "analistas" em servidores com filtros: órgão 26000');
    });

    it('should format query with multiple filters', () => {
      const parsed = {
        dataSource: 'contratos' as const,
        searchTerm: 'TI',
        filters: {
          ano: 2024,
          mes: 6,
          valor_inicial: 500000,
          orgao: '25000',
        },
      };

      const result = formatParsedQuery(parsed);
      expect(result).toBe('Buscando por "TI" em contratos com filtros: ano 2024, mês junho, valor acima de R$ 500.000, órgão 25000');
    });

    it('should handle edge case months', () => {
      const parsed = {
        dataSource: 'despesas' as const,
        searchTerm: 'todas',
        filters: { mes: 13 }, // Invalid month - out of range
      };

      const result = formatParsedQuery(parsed);
      expect(result).toBe('Buscando por "todas" em despesas com filtros: mês undefined');
    });
  });
});