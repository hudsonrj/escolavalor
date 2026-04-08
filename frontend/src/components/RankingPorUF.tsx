import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, TrendingDown, School } from 'lucide-react';

interface EscolaDetail {
  id: string;
  nome: string;
  municipio: string;
  score: string;
}

interface RankingUF {
  posicao: number;
  uf: string;
  total_escolas: number;
  score_medio: string;
  score_maximo: string;
  score_minimo: string;
  icb_medio: string | null;
  icb_minimo: string | null;
  escola_max?: EscolaDetail;
  escola_min?: EscolaDetail;
}

const UF_NOMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

async function fetchRankingUF() {
  const res = await fetch('/api/ranking-agregado/por-uf');
  if (!res.ok) throw new Error('Erro ao buscar ranking por UF');
  return res.json();
}

export function RankingPorUF() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ranking-uf'],
    queryFn: fetchRankingUF,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-700 font-medium">Carregando ranking...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
        <p className="text-red-700 font-bold">Erro ao carregar ranking</p>
      </div>
    );
  }

  const rankings: RankingUF[] = data?.data || [];

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 4.5) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 3) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMedalEmoji = (posicao: number) => {
    if (posicao === 1) return '🥇';
    if (posicao === 2) return '🥈';
    if (posicao === 3) return '🥉';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-4 rounded-2xl shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">
              Ranking por Estado
            </h2>
            <p className="text-gray-700 font-medium">
              Comparação de qualidade educacional média por UF
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankings.map((rank) => {
          const scoreMedio = parseFloat(rank.score_medio);
          const scoreMaximo = parseFloat(rank.score_maximo);
          const scoreMinimo = parseFloat(rank.score_minimo);
          const amplitude = scoreMaximo - scoreMinimo;

          return (
            <div
              key={rank.uf}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getMedalEmoji(rank.posicao)}</span>
                  <div>
                    <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                      #{rank.posicao}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">
                      {rank.uf}
                    </h3>
                    <div className="text-sm text-gray-600 font-medium">
                      {UF_NOMES[rank.uf]}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-100 p-2 rounded-xl">
                  <School className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <div className="text-xs text-gray-600 mb-2 font-bold uppercase tracking-wide">
                    Score Médio
                  </div>
                  <div className="text-4xl font-black text-gray-900">
                    {scoreMedio.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50/50 border border-green-100 rounded-xl p-3">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1 font-bold">
                      <TrendingUp className="h-3 w-3" />
                      Máximo
                    </div>
                    <div className="text-xl font-black text-gray-900">
                      {scoreMaximo.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1 font-bold">
                      <TrendingDown className="h-3 w-3" />
                      Mínimo
                    </div>
                    <div className="text-xl font-black text-gray-900">
                      {scoreMinimo.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-gray-100">
                  <div className="text-xs text-gray-600 mb-2 font-bold uppercase tracking-wide">
                    Amplitude
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-green-500 h-3 rounded-full shadow-inner"
                        style={{ width: `${Math.min((amplitude / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-gray-900">
                      {amplitude.toFixed(1)}
                    </span>
                  </div>
                </div>

                {!rank.escola_max && (
                  <div className="pt-3 border-t-2 border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">
                        Total de escolas
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        {rank.total_escolas}
                      </span>
                    </div>
                    {rank.icb_medio && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">
                          ICB médio
                        </span>
                        <span className="text-lg font-black text-blue-600">
                          {parseFloat(rank.icb_medio).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {rank.escola_max && (
                  <div className="pt-3 border-t-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                    <div className="text-xs text-gray-700 font-black mb-2 flex items-center gap-1 uppercase tracking-wide">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Melhor escola
                    </div>
                    <div className="text-sm text-gray-900 font-black truncate mb-1">
                      {rank.escola_max.nome}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {rank.escola_max.municipio} • Score: {parseFloat(rank.escola_max.score).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
