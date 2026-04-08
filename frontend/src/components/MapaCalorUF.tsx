import { Trophy, TrendingUp, School } from 'lucide-react';
import type { RankingItem } from '../types';

interface MapaCalorUFProps {
  escolas: RankingItem[];
}

interface UFData {
  uf: string;
  totalEscolas: number;
  scoreMedia: number;
  melhorScore: number;
  tipo: { privada: number; federal: number; publica: number };
}

export function MapaCalorUF({ escolas }: MapaCalorUFProps) {
  // Agrupar dados por UF
  const dadosPorUF = escolas.reduce((acc, escola) => {
    if (!acc[escola.uf]) {
      acc[escola.uf] = {
        uf: escola.uf,
        totalEscolas: 0,
        scores: [],
        tipo: { privada: 0, federal: 0, publica: 0 },
      };
    }

    acc[escola.uf].totalEscolas++;
    if (escola.score_composto) {
      acc[escola.uf].scores.push(parseFloat(escola.score_composto));
    }
    acc[escola.uf].tipo[escola.tipo as keyof typeof acc[string]['tipo']]++;

    return acc;
  }, {} as Record<string, { uf: string; totalEscolas: number; scores: number[]; tipo: { privada: number; federal: number; publica: number } }>);

  // Calcular estatísticas por UF
  const ufsComEstatisticas: UFData[] = Object.values(dadosPorUF)
    .map((uf) => ({
      uf: uf.uf,
      totalEscolas: uf.totalEscolas,
      scoreMedia: uf.scores.length > 0 ? uf.scores.reduce((a, b) => a + b, 0) / uf.scores.length : 0,
      melhorScore: uf.scores.length > 0 ? Math.max(...uf.scores) : 0,
      tipo: uf.tipo,
    }))
    .sort((a, b) => b.scoreMedia - a.scoreMedia);

  // Função para obter a cor baseada no score médio
  const getColorClass = (score: number) => {
    if (score >= 7.5) return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400';
    if (score >= 6) return 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400';
    if (score >= 5) return 'bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-400';
    if (score >= 4) return 'bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-400';
    return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400';
  };

  const getIntensity = (score: number) => {
    const normalized = Math.min(Math.max(score / 10, 0), 1);
    return normalized;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Qualidade de Ensino por Estado
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Mapa de calor baseado no score médio das escolas
        </p>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 bg-gradient-to-r from-red-500 to-yellow-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Baixo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 bg-gradient-to-r from-yellow-500 to-green-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Alto</span>
        </div>
      </div>

      {/* Grid de Estados */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {ufsComEstatisticas.map((ufData) => {
          const intensity = getIntensity(ufData.scoreMedia);
          const colorClass = getColorClass(ufData.scoreMedia);

          return (
            <div
              key={ufData.uf}
              className={`border-2 rounded-lg p-4 transition-all duration-200 hover:scale-105 cursor-pointer ${colorClass}`}
              style={{
                opacity: 0.6 + intensity * 0.4,
              }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{ufData.uf}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Trophy className="h-4 w-4" />
                    <span className="font-semibold">{ufData.scoreMedia.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs opacity-80">
                    <School className="h-3 w-3" />
                    <span>{ufData.totalEscolas} escolas</span>
                  </div>
                  {ufData.melhorScore > 0 && (
                    <div className="flex items-center justify-center gap-1 text-xs opacity-70">
                      <TrendingUp className="h-3 w-3" />
                      <span>Máx: {ufData.melhorScore.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top 5 Estados */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top 5 Estados - Melhor Qualidade Média
        </h3>
        <div className="space-y-3">
          {ufsComEstatisticas.slice(0, 5).map((ufData, index) => (
            <div
              key={ufData.uf}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}º</div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{ufData.uf}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {ufData.totalEscolas} escolas
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {ufData.scoreMedia.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  score médio
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
