import { MapPin, School, TrendingUp, Award } from 'lucide-react';
import type { RankingItem } from '../types';

interface EstatisticasMunicipioProps {
  escolas: RankingItem[];
}

interface MunicipioData {
  municipio: string;
  uf: string;
  totalEscolas: number;
  scoreMedia: number;
  melhorEscola: {
    nome: string;
    score: number;
  };
  tipos: {
    privada: number;
    federal: number;
    publica: number;
  };
}

export function EstatisticasMunicipio({ escolas }: EstatisticasMunicipioProps) {
  // Agrupar por município
  const dadosPorMunicipio = escolas.reduce((acc, escola) => {
    const key = `${escola.municipio}-${escola.uf}`;

    if (!acc[key]) {
      acc[key] = {
        municipio: escola.municipio,
        uf: escola.uf,
        totalEscolas: 0,
        scores: [],
        escolas: [],
        tipos: { privada: 0, federal: 0, publica: 0 },
      };
    }

    acc[key].totalEscolas++;
    if (escola.score_composto) {
      acc[key].scores.push(parseFloat(escola.score_composto));
    }
    acc[key].escolas.push(escola);
    acc[key].tipos[escola.tipo as keyof typeof acc[string]['tipos']]++;

    return acc;
  }, {} as Record<string, { municipio: string; uf: string; totalEscolas: number; scores: number[]; escolas: RankingItem[]; tipos: { privada: number; federal: number; publica: number } }>);

  // Processar estatísticas
  const municipiosComEstatisticas: MunicipioData[] = Object.values(dadosPorMunicipio)
    .map((mun) => {
      const melhorEscolaData = mun.escolas.sort((a, b) => {
        const scoreA = parseFloat(a.score_composto || '0');
        const scoreB = parseFloat(b.score_composto || '0');
        return scoreB - scoreA;
      })[0];

      return {
        municipio: mun.municipio,
        uf: mun.uf,
        totalEscolas: mun.totalEscolas,
        scoreMedia: mun.scores.length > 0 ? mun.scores.reduce((a, b) => a + b, 0) / mun.scores.length : 0,
        melhorEscola: {
          nome: melhorEscolaData.nome,
          score: parseFloat(melhorEscolaData.score_composto || '0'),
        },
        tipos: mun.tipos,
      };
    })
    .sort((a, b) => b.totalEscolas - a.totalEscolas);

  // Top 10 municípios com mais escolas
  const top10Municipios = municipiosComEstatisticas.slice(0, 10);

  // Municípios com melhor qualidade (min 2 escolas)
  const melhorQualidade = municipiosComEstatisticas
    .filter((m) => m.totalEscolas >= 2)
    .sort((a, b) => b.scoreMedia - a.scoreMedia)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Título */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-gray-100 p-8 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-3">
          Estatísticas por Município
        </h2>
        <p className="text-lg text-gray-700 font-medium">
          Análise detalhada das escolas por cidade
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Municípios</h3>
          </div>
          <div className="text-5xl font-black text-gray-900 mb-2">
            {municipiosComEstatisticas.length}
          </div>
          <div className="text-sm text-gray-700 font-bold">
            cidades com escolas
          </div>
        </div>

        <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-600 p-3 rounded-xl shadow-lg">
              <School className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Média</h3>
          </div>
          <div className="text-5xl font-black text-gray-900 mb-2">
            {(escolas.length / municipiosComEstatisticas.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-700 font-bold">
            escolas por município
          </div>
        </div>

        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-600 p-3 rounded-xl shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Maior</h3>
          </div>
          <div className="text-5xl font-black text-gray-900 mb-2">
            {top10Municipios[0]?.totalEscolas || 0}
          </div>
          <div className="text-sm text-gray-700 font-bold">
            {top10Municipios[0]?.municipio || 'N/A'}
          </div>
        </div>
      </div>

      {/* Top 10 Municípios - Mais Escolas */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-gray-100 shadow-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
            <School className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            Top 10 Municípios - Quantidade de Escolas
          </h3>
        </div>
        <div className="space-y-3">
          {top10Municipios.map((mun, index) => (
            <div
              key={`${mun.municipio}-${mun.uf}`}
              className="group flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-100/70 border border-blue-100 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-black text-blue-600 w-8">{index + 1}º</div>
                <div>
                  <div className="font-black text-gray-900 text-lg">
                    {mun.municipio}, {mun.uf}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Score médio: <span className="font-bold">{mun.scoreMedia.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-gray-900">
                  {mun.totalEscolas}
                </div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wide">escolas</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 Municípios - Melhor Qualidade */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-gray-100 shadow-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-2xl shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            Top 10 Municípios - Melhor Qualidade Média
          </h3>
        </div>
        <div className="space-y-3">
          {melhorQualidade.map((mun, index) => (
            <div
              key={`${mun.municipio}-${mun.uf}-quality`}
              className="group flex items-center justify-between p-4 bg-green-50/50 hover:bg-green-100/70 border border-green-100 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-black text-green-600 w-8">{index + 1}º</div>
                <div>
                  <div className="font-black text-gray-900 text-lg">
                    {mun.municipio}, {mun.uf}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {mun.totalEscolas} escolas
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-gray-900">
                  {mun.scoreMedia.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wide">score médio</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
