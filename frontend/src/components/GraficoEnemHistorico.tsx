import { TrendingUp, BarChart3 } from 'lucide-react';
import type { EnemDetalhes } from '../types';

interface GraficoEnemHistoricoProps {
  enemDetalhes: EnemDetalhes[];
}

export function GraficoEnemHistorico({ enemDetalhes }: GraficoEnemHistoricoProps) {
  if (!enemDetalhes || enemDetalhes.length === 0) return null;

  // Ordenar por ano (mais recente primeiro)
  const dadosOrdenados = [...enemDetalhes].sort((a, b) => b.ano_referencia - a.ano_referencia).slice(0, 5);

  // Calcular máximos para escala
  const maxNota = Math.max(...dadosOrdenados.map(d => parseFloat(d.nota_media)));
  const maxAlunos = Math.max(...dadosOrdenados.map(d => d.total_alunos));

  // Calcular tendência (comparar ano mais recente com o mais antigo)
  const notaRecente = parseFloat(dadosOrdenados[0]?.nota_media || '0');
  const notaAntiga = parseFloat(dadosOrdenados[dadosOrdenados.length - 1]?.nota_media || '0');
  const tendencia = notaAntiga > 0 ? ((notaRecente - notaAntiga) / notaAntiga) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Evolução do ENEM - Últimos {dadosOrdenados.length} Anos
        </h4>
        {tendencia !== 0 && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className={`h-4 w-4 ${tendencia > 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`font-semibold ${tendencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {tendencia > 0 ? '+' : ''}{tendencia.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Gráfico de barras - Nota Média */}
      <div className="space-y-4">
        {dadosOrdenados.map((dado) => {
          const notaMedia = parseFloat(dado.nota_media);
          const largura = (notaMedia / maxNota) * 100;

          return (
            <div key={dado.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 dark:text-gray-300 w-12">
                    {dado.ano_referencia}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    {dado.total_alunos} alunos
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  {notaMedia.toFixed(1)}
                </span>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${largura}%` }}
                >
                  {largura > 30 && (
                    <span className="text-xs font-semibold text-white">
                      {notaMedia.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela detalhada de áreas - Ano mais recente */}
      {dadosOrdenados[0] && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Desempenho por Área ({dadosOrdenados[0].ano_referencia})
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {dadosOrdenados[0].matematica_media && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Matemática</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {parseFloat(dadosOrdenados[0].matematica_media).toFixed(1)}
                </p>
              </div>
            )}
            {dadosOrdenados[0].linguagens_media && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Linguagens</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {parseFloat(dadosOrdenados[0].linguagens_media).toFixed(1)}
                </p>
              </div>
            )}
            {dadosOrdenados[0].ciencias_humanas_media && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">C. Humanas</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  {parseFloat(dadosOrdenados[0].ciencias_humanas_media).toFixed(1)}
                </p>
              </div>
            )}
            {dadosOrdenados[0].ciencias_natureza_media && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">C. Natureza</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  {parseFloat(dadosOrdenados[0].ciencias_natureza_media).toFixed(1)}
                </p>
              </div>
            )}
            {dadosOrdenados[0].redacao_media && (
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Redação</p>
                <p className="text-lg font-bold text-pink-700 dark:text-pink-400">
                  {parseFloat(dadosOrdenados[0].redacao_media).toFixed(0)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
