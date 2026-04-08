import { useState } from 'react';
import { useRanking } from '../hooks/useEscolas';
import { Header } from '../components/Header';
import { BackgroundIllustration } from '../components/BackgroundIllustration';
import { MapaEscolas } from '../components/MapaEscolas';
import { MapaCalorUF } from '../components/MapaCalorUF';
import { MapaCalorGeografico } from '../components/MapaCalorGeografico';
import { EstatisticasMunicipio } from '../components/EstatisticasMunicipio';
import { RankingPorUF } from '../components/RankingPorUF';
import { RankingPorMunicipio } from '../components/RankingPorMunicipio';
import { Map, BarChart3, MapPin, Loader2, ArrowLeft, Trophy, Building2, Flame } from 'lucide-react';

interface MapaPageProps {
  onVoltar?: () => void;
}

export function MapaPage({ onVoltar }: MapaPageProps) {
  const [visualizacao, setVisualizacao] = useState<'mapa' | 'calor' | 'calor-geo' | 'municipios' | 'ranking-uf' | 'ranking-municipio'>('mapa');
  const { data, isLoading, error } = useRanking({ limit: 500 });

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundIllustration />
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Carregando dados das escolas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <BackgroundIllustration />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-red-900 mb-2">Erro ao carregar dados</h2>
            <p className="text-red-700">
              Não foi possível carregar as informações das escolas. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const escolas = data?.data || [];

  return (
    <div className="min-h-screen relative">
      <BackgroundIllustration />
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header da Página */}
        <div className="mb-8">
          {onVoltar && (
            <button
              onClick={onVoltar}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl shadow-md hover:shadow-lg mb-6 transition-all font-bold border-2 border-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar para o Ranking
            </button>
          )}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-gray-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-4 rounded-2xl shadow-lg">
                <Map className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-black text-gray-900">
                Visualização Geográfica
              </h1>
            </div>
            <p className="text-lg text-gray-700 font-medium">
              Explore a distribuição e qualidade das escolas pelo Brasil
            </p>
          </div>
        </div>

        {/* Tabs de Visualização */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-100 p-2 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setVisualizacao('mapa')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                visualizacao === 'mapa'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Map className="h-5 w-5" />
              Mapa Interativo
            </button>
            <button
              onClick={() => setVisualizacao('calor-geo')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                visualizacao === 'calor-geo'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Flame className="h-5 w-5" />
              Mapa de Calor
            </button>
            <button
              onClick={() => setVisualizacao('ranking-uf')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                visualizacao === 'ranking-uf'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Trophy className="h-5 w-5" />
              Ranking por UF
            </button>
            <button
              onClick={() => setVisualizacao('ranking-municipio')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                visualizacao === 'ranking-municipio'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building2 className="h-5 w-5" />
              Ranking por Município
            </button>
            <button
              onClick={() => setVisualizacao('municipios')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                visualizacao === 'municipios'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin className="h-5 w-5" />
              Estatísticas
            </button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-100 p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="text-sm text-gray-600 mb-2 font-bold uppercase tracking-wide">Total de Escolas</div>
            <div className="text-4xl font-black text-gray-900">{escolas.length}</div>
          </div>
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-100 p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="text-sm text-gray-600 mb-2 font-bold uppercase tracking-wide">Estados</div>
            <div className="text-4xl font-black text-gray-900">
              {new Set(escolas.map((e) => e.uf)).size}
            </div>
          </div>
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-pink-100 p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="text-sm text-gray-600 mb-2 font-bold uppercase tracking-wide">Municípios</div>
            <div className="text-4xl font-black text-gray-900">
              {new Set(escolas.map((e) => `${e.municipio}-${e.uf}`)).size}
            </div>
          </div>
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-green-100 p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="text-sm text-gray-600 mb-2 font-bold uppercase tracking-wide">Score Médio</div>
            <div className="text-4xl font-black text-gray-900">
              {escolas.filter((e) => e.score_composto).length > 0
                ? (
                    escolas
                      .filter((e) => e.score_composto)
                      .reduce((sum, e) => sum + parseFloat(e.score_composto!), 0) /
                    escolas.filter((e) => e.score_composto).length
                  ).toFixed(2)
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className={visualizacao === 'ranking-uf' || visualizacao === 'ranking-municipio' || visualizacao === 'calor-geo' ? '' : 'bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-gray-100 shadow-xl p-8'}>
          {visualizacao === 'mapa' && <MapaEscolas escolas={escolas} />}
          {visualizacao === 'calor' && <MapaCalorUF escolas={escolas} />}
          {visualizacao === 'calor-geo' && <MapaCalorGeografico />}
          {visualizacao === 'ranking-uf' && <RankingPorUF />}
          {visualizacao === 'ranking-municipio' && <RankingPorMunicipio />}
          {visualizacao === 'municipios' && <EstatisticasMunicipio escolas={escolas} />}
        </div>
      </main>
    </div>
  );
}
