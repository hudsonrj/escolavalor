import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, TrendingUp, TrendingDown, School, Filter } from 'lucide-react';

interface RankingMunicipio {
  posicao: number;
  municipio: string;
  uf: string;
  total_escolas: number;
  score_medio: string;
  score_maximo: string;
  score_minimo: string;
  icb_medio: string | null;
  icb_minimo: string | null;
}

async function fetchRankingMunicipio(uf?: string, minEscolas: number = 2) {
  const params = new URLSearchParams();
  if (uf) params.append('uf', uf);
  params.append('min_escolas', minEscolas.toString());

  const res = await fetch(`/api/ranking-agregado/por-municipio?${params}`);
  if (!res.ok) throw new Error('Erro ao buscar ranking por município');
  return res.json();
}

export function RankingPorMunicipio() {
  const [ufFilter, setUfFilter] = useState<string>('');
  const [minEscolas, setMinEscolas] = useState(2);

  const { data, isLoading, error } = useQuery({
    queryKey: ['ranking-municipio', ufFilter, minEscolas],
    queryFn: () => fetchRankingMunicipio(ufFilter || undefined, minEscolas),
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

  const rankings: RankingMunicipio[] = data?.data || [];

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
          <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-4 rounded-2xl shadow-lg">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">
              Ranking por Município
            </h2>
            <p className="text-gray-700 font-medium">
              Comparação de qualidade educacional média por cidade
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-black text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Estado (Opcional)
            </label>
            <select
              value={ufFilter}
              onChange={(e) => setUfFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
            >
              <option value="">Todos os estados</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="PR">Paraná</option>
              <option value="SC">Santa Catarina</option>
              <option value="BA">Bahia</option>
              <option value="PE">Pernambuco</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="GO">Goiás</option>
              <option value="ES">Espírito Santo</option>
              <option value="AM">Amazonas</option>
              <option value="PA">Pará</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="PI">Piauí</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="PB">Paraíba</option>
              <option value="AL">Alagoas</option>
              <option value="SE">Sergipe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Mínimo de escolas
            </label>
            <select
              value={minEscolas}
              onChange={(e) => setMinEscolas(parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
            >
              <option value="1">1 ou mais</option>
              <option value="2">2 ou mais</option>
              <option value="5">5 ou mais</option>
              <option value="10">10 ou mais</option>
              <option value="20">20 ou mais</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 shadow-md">
        <p className="text-gray-900 font-bold">
          Mostrando <span className="text-purple-600 text-xl">{rankings.length}</span> {rankings.length === 1 ? 'município' : 'municípios'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rankings.map((rank) => {
          const scoreMedio = parseFloat(rank.score_medio);
          const scoreMaximo = parseFloat(rank.score_maximo);
          const scoreMinimo = parseFloat(rank.score_minimo);
          const amplitude = scoreMaximo - scoreMinimo;

          return (
            <div
              key={`${rank.municipio}-${rank.uf}`}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {rank.posicao <= 3 && (
                    <span className="text-2xl">{getMedalEmoji(rank.posicao)}</span>
                  )}
                  <div>
                    <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                      #{rank.posicao}
                    </div>
                    <h3 className="text-xl font-black text-gray-900">
                      {rank.municipio}
                    </h3>
                    <div className="text-sm text-gray-600 font-medium">
                      {rank.uf} • {rank.total_escolas} {rank.total_escolas === 1 ? 'escola' : 'escolas'}
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 p-2 rounded-xl">
                  <School className="h-5 w-5 text-purple-600" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1 font-bold uppercase">Médio</div>
                  <div className="text-2xl font-black text-gray-900">
                    {scoreMedio.toFixed(2)}
                  </div>
                </div>
                <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1 font-bold uppercase">
                    <TrendingUp className="h-3 w-3" />
                    Máx
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {scoreMaximo.toFixed(2)}
                  </div>
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1 font-bold uppercase">
                    <TrendingDown className="h-3 w-3" />
                    Mín
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {scoreMinimo.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-gray-100">
                <div className="text-xs text-gray-600 mb-2 font-bold uppercase tracking-wide">
                  Amplitude de qualidade
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full shadow-inner"
                      style={{ width: `${Math.min((amplitude / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    {amplitude.toFixed(1)}
                  </span>
                </div>
              </div>

              {rank.icb_medio && (
                <div className="mt-3 pt-3 border-t-2 border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">ICB médio</span>
                  <span className="text-lg font-black text-blue-600">{parseFloat(rank.icb_medio).toFixed(2)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
