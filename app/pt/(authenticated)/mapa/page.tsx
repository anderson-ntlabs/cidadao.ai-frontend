/**
 * Mapa de Transparência - Cidadão.AI
 *
 * Autor: Anderson Henrique da Silva
 * Localização: Minas Gerais, Brasil
 * Data de Criação: 2025-10-23 12:45:13 -0300
 *
 * Interactive map showing transparency API coverage across Brazilian states
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  transparencyAPIs,
  estadoNomes,
  calculateMapSummary,
  type StateAPICoverage,
  type APIStatus
} from '@/data/transparency-apis';

interface StateData {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][][]; // MultiPolygon: [[[lon, lat]]]
  };
  properties: {
    sigla: string;
    nome: string;
    regiao: string;
  };
}

export default function MapaTransparencia() {
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>('');
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [statesData, setStatesData] = useState<StateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewBox, setViewBox] = useState('0 0 1000 1000');
  const [showModal, setShowModal] = useState(false);

  const summary = calculateMapSummary();

  // Carregar dados do estado selecionado
  const estadoInfo = estadoSelecionado ? transparencyAPIs[estadoSelecionado] : null;

  // Calcular estatísticas do estado para o tooltip
  const getStateStats = (sigla: string) => {
    const stateData = transparencyAPIs[sigla];
    if (!stateData) {
      return {
        name: estadoNomes[sigla] || sigla,
        totalAPIs: 0,
        healthyAPIs: 0,
        errorAPIs: 0,
        hasData: false as const
      };
    }

    const healthyAPIs = stateData.apis.filter(api => api.status === 'healthy').length;
    const errorAPIs = stateData.apis.filter(api =>
      api.status === 'degraded' || api.status === 'blocked' || api.status === 'server_error'
    ).length;

    return {
      name: stateData.name,
      totalAPIs: stateData.apis.length,
      healthyAPIs,
      errorAPIs,
      hasData: true as const,
      region: stateData.region,
      status: stateData.overall_status
    };
  };

  // Handler para mouse move no mapa
  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>, sigla: string) => {
    setHoveredState(sigla);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
    setTooltipPosition(null);
  };

  // Projeção Mercator simplificada
  const projectCoordinate = useCallback((lon: number, lat: number): [number, number] => {
    const scale = 1500;
    const centerLon = -53;
    const centerLat = -15;

    const x = Number((lon - centerLon) * scale);
    const y = Number(-(lat - centerLat) * scale);

    return [x, y];
  }, []);

  const calculateBounds = useCallback((features: StateData[]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    features.forEach(feature => {
      if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
          polygon.forEach(ring => {
            ring.forEach((coord: number[]) => {
              const [x, y] = projectCoordinate(coord[0], coord[1]);
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            });
          });
        });
      }
    });

    return { minX, minY, maxX, maxY };
  }, [projectCoordinate]);

  useEffect(() => {
    // Carregar dados do mapa do Brasil
    fetch('/brazil-states.json')
      .then(res => res.json())
      .then(data => {
        setStatesData(data.features);
        setIsLoading(false);

        // Calcular viewBox baseado nos dados
        const bounds = calculateBounds(data.features);
        const padding = 50;
        const width = bounds.maxX - bounds.minX + padding * 2;
        const height = bounds.maxY - bounds.minY + padding * 2;
        setViewBox(`${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}`);
      })
      .catch(err => {
        console.error('Erro ao carregar mapa:', err);
        setIsLoading(false);
      });
  }, [calculateBounds]);

  useEffect(() => {
    if (estadoSelecionado) {
      setShowModal(true);
    }
  }, [estadoSelecionado]);

  const createPath = (coordinates: number[][][][]) => {
    let path = '';

    coordinates.forEach((polygon, polygonIndex) => {
      polygon.forEach((ring, ringIndex) => {
        ring.forEach((coord: number[], coordIndex) => {
          const [x, y] = projectCoordinate(coord[0], coord[1]);

          if (coordIndex === 0) {
            path += `${polygonIndex > 0 || ringIndex > 0 ? ' ' : ''}M ${x} ${y}`;
          } else {
            path += ` L ${x} ${y}`;
          }
        });
        path += ' Z';
      });
    });

    return path;
  };

  const getStateColor = (sigla: string): string => {
    const stateData = transparencyAPIs[sigla];

    if (hoveredState === sigla) {
      if (!stateData) return '#9ca3af'; // gray-400
      switch (stateData.overall_status) {
        case 'healthy': return '#10b981'; // green-500 (hover)
        case 'degraded': return '#f59e0b'; // amber-500 (hover)
        case 'blocked': return '#ef4444'; // red-500 (hover)
        default: return '#9ca3af';
      }
    }

    if (estadoSelecionado === sigla) {
      if (!stateData) return '#6b7280'; // gray-500
      switch (stateData.overall_status) {
        case 'healthy': return '#059669'; // green-600 (selected)
        case 'degraded': return '#d97706'; // amber-600 (selected)
        case 'blocked': return '#dc2626'; // red-600 (selected)
        default: return '#6b7280';
      }
    }

    if (!stateData) return '#e5e7eb'; // gray-200 (no API)

    switch (stateData.overall_status) {
      case 'healthy': return '#34d399'; // green-400
      case 'degraded': return '#fbbf24'; // amber-400
      case 'blocked': return '#f87171'; // red-400
      case 'server_error': return '#fb923c'; // orange-400
      default: return '#e5e7eb';
    }
  };

  const getStatusBadge = (status: APIStatus) => {
    switch (status) {
      case 'healthy':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">🟢 Online</span>;
      case 'degraded':
        return <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs">🟡 Degradado</span>;
      case 'blocked':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs">🔴 Bloqueado</span>;
      case 'server_error':
        return <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs">⚠️ Erro</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded text-xs">⚫ Sem API</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/pt/home"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Voltar
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🗺️ Mapa de Transparência do Brasil
              </h1>
            </div>

            <div className="hidden md:flex gap-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                Online: {summary.healthy_apis}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                Total: {summary.total_apis} APIs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {summary.states_with_apis}/27
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Estados com APIs</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {summary.states_working}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">APIs Funcionando</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {summary.states_degraded}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Com Problemas</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {summary.overall_coverage_percentage.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cobertura Nacional</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mapa SVG */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Mapa Interativo
              </h2>

              {isLoading && (
                <div className="flex items-center justify-center h-[500px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Carregando mapa...</p>
                  </div>
                </div>
              )}

              {!isLoading && (
                <>
                  <svg
                    viewBox={viewBox}
                    className="w-full h-[500px]"
                    style={{ backgroundColor: '#f9fafb' }}
                  >
                    {statesData.map((state, index) => {
                      const sigla = state.properties?.sigla || '';
                      const nome = estadoNomes[sigla] || state.properties?.nome || '';
                      const hasAPI = transparencyAPIs[sigla];

                      return (
                        <g key={index}>
                          <path
                            d={createPath(state.geometry.coordinates)}
                            fill={getStateColor(sigla)}
                            stroke="#fff"
                            strokeWidth="2"
                            className={`transition-all duration-200 ${hasAPI ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}`}
                            onMouseMove={(e) => handleMouseMove(e, sigla)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => hasAPI && setEstadoSelecionado(sigla)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Legenda */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">APIs Funcionando</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-400 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">Problemas/Degradado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-400 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">Bloqueado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">Sem API Pública</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 Clique em um estado no mapa ou selecione na lista para ver detalhes das APIs de transparência disponíveis.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-6">
            {/* Seletor de Estado */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                📍 Selecione um Estado
              </h3>

              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={estadoSelecionado}
                onChange={(e) => setEstadoSelecionado(e.target.value)}
              >
                <option value="">Selecione um estado</option>
                {Object.entries(estadoNomes).map(([sigla, nome]) => (
                  <option key={sigla} value={sigla}>
                    {nome} {transparencyAPIs[sigla] && `(${transparencyAPIs[sigla].apis.length} APIs)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Informações do Estado Selecionado */}
            {estadoInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {estadoInfo.name}
                  </h3>
                  {getStatusBadge(estadoInfo.overall_status)}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Região:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{estadoInfo.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">APIs Disponíveis:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{estadoInfo.apis.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cobertura:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{estadoInfo.coverage_percentage}%</span>
                  </div>
                  {estadoInfo.population && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">População:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {estadoInfo.population.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                {estadoInfo.notes && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      ℹ️ {estadoInfo.notes}
                    </p>
                  </div>
                )}

                {/* Lista de APIs */}
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">APIs Disponíveis:</h4>
                  {estadoInfo.apis.map((api, index) => (
                    <div
                      key={api.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">{api.name}</h5>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{api.type}</span>
                        </div>
                        {getStatusBadge(api.status)}
                      </div>

                      {api.url && (
                        <a
                          href={api.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline block mb-2"
                        >
                          🔗 {api.url}
                        </a>
                      )}

                      {api.coverage.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {api.coverage.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      {api.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <p className="text-xs text-red-700 dark:text-red-400">❌ {api.error}</p>
                        </div>
                      )}

                      {api.action && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-xs text-blue-700 dark:text-blue-400">ℹ️ {api.action}</p>
                        </div>
                      )}

                      {api.responseTimeMs && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          ⏱️ Tempo de resposta: {api.responseTimeMs}ms
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!estadoSelecionado && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Selecione um estado no mapa ou na lista acima para ver as APIs de transparência disponíveis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip Flutuante */}
      {hoveredState && tooltipPosition && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y - 10,
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 p-4 min-w-[280px]">
            {(() => {
              const stats = getStateStats(hoveredState);
              return (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                        {stats.name}
                      </h4>
                      {stats.hasData && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stats.region}
                        </span>
                      )}
                    </div>
                    {stats.hasData && getStatusBadge(stats.status)}
                  </div>

                  {/* Estatísticas */}
                  {stats.hasData ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          Total de APIs:
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {stats.totalAPIs}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Funcionando:
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {stats.healthyAPIs}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          Com Erros:
                        </span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {stats.errorAPIs}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          💡 Clique para ver detalhes
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ⚠️ Sem APIs públicas mapeadas
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Aguardando integração
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </motion.div>
      )}
    </div>
  );
}
