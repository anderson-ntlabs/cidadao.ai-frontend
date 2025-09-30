import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendChatAsInvestigation, getMockAgents, getMockSuggestions } from './chat-adapter';
import { api } from './client';
import { parseNaturalLanguage } from './natural-language-parser';

// Mock dependencies
vi.mock('./client');
vi.mock('./natural-language-parser');

describe('chat-adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendChatAsInvestigation', () => {
    const mockRequest = {
      message: 'buscar servidores com salário acima de 30 mil',
      session_id: 'test-session',
    };

    const mockParsedQuery = {
      query: 'servidores com salário acima de 30 mil',
      dataSource: 'servidores',
      filters: { salario_minimo: 30000 },
    };

    const mockInvestigationResponse = {
      status: 'completed',
      data_source: 'servidores',
      total_found: 5,
      anomalies_detected: 2,
      confidence_score: 0.95,
      processing_time_ms: 250,
      results: [
        {
          nome: 'Maria Silva',
          cargo: 'Analista',
          orgao: 'Ministério da Saúde',
          matricula: '12345',
          remuneracao: {
            basica: 35000,
            total_liquido: 32000,
            gratificacoes: 5000,
            auxilios: 2000,
          },
          mes_ano_referencia: '12/2024',
        },
        {
          nome: 'João Santos',
          cargo: 'Diretor',
          orgao: 'Ministério da Educação',
          matricula: '67890',
          remuneracao: {
            basica: 45000,
            total_liquido: 42000,
          },
          mes_ano_referencia: '12/2024',
        },
      ],
      metadata: {
        organizations_searched: ['Ministério da Saúde', 'Ministério da Educação'],
        anomaly_threshold: 30000,
      },
    };

    it('should successfully convert chat message to investigation and format response', async () => {
      vi.mocked(parseNaturalLanguage).mockReturnValue(mockParsedQuery);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockInvestigationResponse,
      });

      const result = await sendChatAsInvestigation(mockRequest);

      expect(parseNaturalLanguage).toHaveBeenCalledWith(mockRequest.message);
      expect(api.post).toHaveBeenCalledWith('/api/investigate', {
        query: mockParsedQuery.query,
        data_source: mockParsedQuery.dataSource,
        filters: mockParsedQuery.filters,
        max_results: 50,
      });

      expect(result.session_id).toBe(mockRequest.session_id);
      expect(result.agent_id).toBe('zumbi');
      expect(result.agent_name).toBe('Zumbi dos Palmares');
      expect(result.confidence).toBe(0.95);
      
      // Check message formatting
      expect(result.message).toContain('Investigação:');
      expect(result.message).toContain('Total encontrado: 5');
      expect(result.message).toContain('Anomalias detectadas: 2');
      expect(result.message).toContain('Confiança: 95.0%');
      expect(result.message).toContain('Maria Silva');
      expect(result.message).toContain('R$ 35.000,00');
      expect(result.message).toContain('João Santos');
      
      expect(result.metadata).toMatchObject({
        investigation_id: expect.stringMatching(/^inv_\d+$/),
        data_source: 'servidores',
        anomalies_count: 2,
        total_found: 5,
        processing_time: 250,
      });
    });

    it('should handle demo mode response', async () => {
      vi.mocked(parseNaturalLanguage).mockReturnValue(mockParsedQuery);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          ...mockInvestigationResponse,
          status: 'demo',
        },
      });

      const result = await sendChatAsInvestigation(mockRequest);

      expect(result.message).toContain('Modo Demonstração');
      expect(result.message).toContain('Para dados reais, configure a API no backend');
    });

    it('should format contract results correctly', async () => {
      const contractParsed = {
        query: 'contratos de TI',
        dataSource: 'contratos',
        filters: {},
      };

      const contractResponse = {
        status: 'completed',
        data_source: 'contratos',
        total_found: 1,
        anomalies_detected: 1,
        confidence_score: 0.9,
        processing_time_ms: 200,
        results: [
          {
            objeto: 'Serviços de TI',
            numero: 'CT-2024-001',
            valor: 1500000,
            fornecedor: {
              nome: 'Tech Solutions',
              cnpj: '12.345.678/0001-90',
            },
            orgao: 'Ministério da Economia',
            data_assinatura: '01/03/2024',
            vigencia: {
              inicio: '01/04/2024',
              fim: '31/03/2025',
            },
            _anomaly: true,
            _z_score: 3.5,
          },
        ],
      };

      vi.mocked(parseNaturalLanguage).mockReturnValue(contractParsed);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: contractResponse,
      });

      const result = await sendChatAsInvestigation({ message: 'contratos de TI' });

      expect(result.message).toContain('Serviços de TI');
      expect(result.message).toContain('CT-2024-001');
      expect(result.message).toContain('R$ 1.500.000,00');
      expect(result.message).toContain('Tech Solutions');
      expect(result.message).toContain('CNPJ: 12.345.678/0001-90');
      expect(result.message).toContain('ANOMALIA DETECTADA');
      expect(result.message).toContain('Z-score: 3.50');
    });

    it('should format expense results correctly', async () => {
      const expenseParsed = {
        query: 'despesas acima de 500 mil',
        dataSource: 'despesas',
        filters: { valor_minimo: 500000 },
      };

      const expenseResponse = {
        status: 'completed',
        data_source: 'despesas',
        total_found: 1,
        anomalies_detected: 0,
        confidence_score: 0.85,
        processing_time_ms: 150,
        results: [
          {
            descricao: 'Aquisição de equipamentos hospitalares',
            valor: 750000,
            favorecido: {
              nome: 'Medical Supplies Ltd',
              codigo: 'MS001',
            },
            orgao: 'Ministério da Saúde',
            data: '15/12/2024',
            programa: 'Saúde Pública',
            acao: 'Modernização Hospitalar',
          },
        ],
      };

      vi.mocked(parseNaturalLanguage).mockReturnValue(expenseParsed);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: expenseResponse,
      });

      const result = await sendChatAsInvestigation({ message: 'despesas acima de 500 mil' });

      expect(result.message).toContain('Aquisição de equipamentos hospitalares');
      expect(result.message).toContain('R$ 750.000,00');
      expect(result.message).toContain('Medical Supplies Ltd');
      expect(result.message).toContain('Código: MS001');
      expect(result.message).toContain('Saúde Pública');
      expect(result.message).toContain('Modernização Hospitalar');
    });

    it('should handle no results found', async () => {
      vi.mocked(parseNaturalLanguage).mockReturnValue(mockParsedQuery);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          ...mockInvestigationResponse,
          total_found: 0,
          results: [],
        },
      });

      const result = await sendChatAsInvestigation(mockRequest);

      expect(result.message).toContain('Nenhum resultado encontrado');
      expect(result.message).toContain('Tente refinar sua busca');
    });

    it('should limit results to 10 items and show count of remaining', async () => {
      const manyResults = Array(15).fill(null).map((_, i) => ({
        nome: `Servidor ${i + 1}`,
        cargo: 'Analista',
        orgao: 'Ministério',
        matricula: `${i + 1}`,
        remuneracao: { basica: 35000, total_liquido: 32000 },
        mes_ano_referencia: '12/2024',
      }));

      vi.mocked(parseNaturalLanguage).mockReturnValue(mockParsedQuery);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          ...mockInvestigationResponse,
          total_found: 15,
          results: manyResults,
        },
      });

      const result = await sendChatAsInvestigation(mockRequest);

      // Should show first 10 results
      for (let i = 1; i <= 10; i++) {
        expect(result.message).toContain(`Servidor ${i}`);
      }
      
      // Should not show 11th result
      expect(result.message).not.toContain('Servidor 11');
      
      // Should show count of remaining
      expect(result.message).toContain('... e mais 5 resultados');
    });

    it('should generate appropriate suggestions based on data source', async () => {
      // Test servants suggestions
      vi.mocked(parseNaturalLanguage).mockReturnValue(mockParsedQuery);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockInvestigationResponse,
      });

      let result = await sendChatAsInvestigation(mockRequest);
      expect(result.suggested_actions).toContain('Investigar anomalias detectadas em detalhes');
      expect(result.suggested_actions).toContain('Buscar outros servidores do mesmo órgão');

      // Test contracts suggestions
      vi.mocked(parseNaturalLanguage).mockReturnValue({
        ...mockParsedQuery,
        dataSource: 'contratos',
      });
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          ...mockInvestigationResponse,
          data_source: 'contratos',
          anomalies_detected: 0,
        },
      });

      result = await sendChatAsInvestigation(mockRequest);
      expect(result.suggested_actions).toContain('Ver contratos do mesmo fornecedor');
      expect(result.suggested_actions).toContain('Analisar contratos emergenciais');

      // Test expenses suggestions
      vi.mocked(parseNaturalLanguage).mockReturnValue({
        ...mockParsedQuery,
        dataSource: 'despesas',
      });
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          ...mockInvestigationResponse,
          data_source: 'despesas',
          anomalies_detected: 0,
        },
      });

      result = await sendChatAsInvestigation(mockRequest);
      expect(result.suggested_actions).toContain('Ver maiores despesas do mês');
      expect(result.suggested_actions).toContain('Analisar gastos por programa');
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(parseNaturalLanguage).mockReturnValue(mockParsedQuery);
      vi.mocked(api.post).mockResolvedValue({
        success: false,
        error: { message: 'API error' },
      });

      const result = await sendChatAsInvestigation(mockRequest);

      expect(result.agent_id).toBe('zumbi');
      expect(result.message).toContain('Desculpe, não consegui processar sua solicitação');
      expect(result.message).toContain('Exemplos de perguntas');
      expect(result.confidence).toBe(0.5);
      expect(result.suggested_actions).toHaveLength(4);
    });

    it('should handle exceptions gracefully', async () => {
      vi.mocked(parseNaturalLanguage).mockImplementation(() => {
        throw new Error('Parse error');
      });

      const result = await sendChatAsInvestigation(mockRequest);

      expect(result.agent_id).toBe('zumbi');
      expect(result.message).toContain('Desculpe, não consegui processar sua solicitação');
      expect(result.session_id).toBe(mockRequest.session_id);
    });

    it('should use default session_id when not provided', async () => {
      vi.mocked(parseNaturalLanguage).mockReturnValue(mockParsedQuery);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockInvestigationResponse,
      });

      const result = await sendChatAsInvestigation({ message: 'test' });

      expect(result.session_id).toBe('investigation_session');
    });

    it('should handle generic data format', async () => {
      const genericParsed = {
        query: 'dados genéricos',
        dataSource: 'unknown',
        filters: {},
      };

      vi.mocked(parseNaturalLanguage).mockReturnValue(genericParsed);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          ...mockInvestigationResponse,
          data_source: 'unknown',
          results: [
            {
              title: 'Generic Item',
              data: { foo: 'bar', baz: 'qux' },
            },
          ],
        },
      });

      const result = await sendChatAsInvestigation({ message: 'dados genéricos' });

      expect(result.message).toContain('Generic Item');
      expect(result.message).toContain('{');
    });

    it('should handle servants without optional fields', async () => {
      const minimalServant = {
        nome: 'Test User',
      };

      vi.mocked(parseNaturalLanguage).mockReturnValue(mockParsedQuery);
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          ...mockInvestigationResponse,
          results: [minimalServant],
        },
      });

      const result = await sendChatAsInvestigation(mockRequest);

      expect(result.message).toContain('Test User');
      expect(result.message).toContain('N/A'); // For missing fields
    });
  });

  describe('getMockAgents', () => {
    it('should return mock agents array', () => {
      const agents = getMockAgents();

      expect(agents).toHaveLength(1);
      expect(agents[0]).toMatchObject({
        id: 'zumbi',
        name: 'Zumbi dos Palmares',
        role: 'Investigador Universal',
        status: 'available',
        specialty: 'Análise de dados governamentais',
        type: 'investigator',
      });
      expect(agents[0].capabilities).toHaveLength(4);
    });
  });

  describe('getMockSuggestions', () => {
    it('should return mock suggestions array', () => {
      const suggestions = getMockSuggestions();

      expect(suggestions).toHaveLength(4);
      expect(suggestions[0]).toMatchObject({
        id: '1',
        label: 'Buscar servidor por nome',
        icon: 'User',
        action: 'Quanto ganha João Silva?',
      });
      expect(suggestions[1].label).toBe('Contratos suspeitos');
      expect(suggestions[2].label).toBe('Gastos do governo');
      expect(suggestions[3].label).toBe('Empresas punidas');
    });
  });
});