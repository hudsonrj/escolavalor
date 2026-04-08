import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Header } from './components/Header';
import { EscolaCard } from './components/EscolaCard';
import { EscolaDetalhesModal } from './components/EscolaDetalhesModal';
import { MapaPage } from './pages/MapaPage';
import { InclusaoPage } from './pages/InclusaoPage';
import { ChatWidget } from './components/ChatWidget';
import { StatsInfographic } from './components/StatsInfographic';
import { BackgroundIllustration } from './components/BackgroundIllustration';
import { Footer } from './components/Footer';
import { InstallPWA } from './components/InstallPWA';
import { useRanking, useEscola } from './hooks/useEscolas';
import { Search, Filter, Trophy, Loader2, Map, List, Heart, Sparkles, Gift, Zap } from 'lucide-react';

const queryClient = new QueryClient();

function AppContent() {
  const [pagina, setPagina] = useState<'ranking' | 'mapa' | 'inclusao'>('ranking');
  const [uf, setUf] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [redeEnsino, setRedeEnsino] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEscolaId, setSelectedEscolaId] = useState<string | null>(null);

  const { data, isLoading, error} = useRanking({
    uf: uf || undefined,
    municipio: municipio || undefined,
    rede_ensino: redeEnsino || undefined,
    limit: 100
  });
  const { data: escolaDetalhadaResponse } = useEscola(selectedEscolaId || '');

  const filteredEscolas = data?.data.filter(escola =>
    searchTerm ? escola.nome.toLowerCase().includes(searchTerm.toLowerCase()) : true
  ) || [];

  if (pagina === 'mapa') {
    return <MapaPage onVoltar={() => setPagina('ranking')} />;
  }

  if (pagina === 'inclusao') {
    return <InclusaoPage onVoltar={() => setPagina('ranking')} />;
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundIllustration />
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Navegação */}
        <div className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-center gap-2 md:gap-3">
          <button
            onClick={() => setPagina('ranking')}
            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-base ${
              pagina === 'ranking'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 shadow-md'
            }`}
          >
            <List className="h-4 w-4 md:h-5 md:w-5" />
            <span>Ranking</span>
          </button>
          <button
            onClick={() => setPagina('mapa')}
            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-base ${
              pagina === 'mapa'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-cyan-300 shadow-md'
            }`}
          >
            <Map className="h-4 w-4 md:h-5 md:w-5" />
            <span>Mapa</span>
          </button>
          <button
            onClick={() => setPagina('inclusao')}
            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-base ${
              pagina === 'inclusao'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-pink-300 shadow-md'
            }`}
          >
            <Heart className="h-4 w-4 md:h-5 md:w-5" />
            <span>Inclusão</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative text-center mb-8 md:mb-16 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2 bg-white rounded-full shadow-lg border-2 border-blue-100 mb-4 md:mb-6">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
            <span className="text-xs md:text-sm font-bold text-gray-800">Powered by AI</span>
          </div>

          {/* Title */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-center gap-4 mb-3 md:mb-4">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl">
                <Trophy className="h-8 w-8 md:h-14 md:w-14 text-white" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black font-display mb-3 md:mb-4 leading-tight text-gray-900 px-2">
              Encontre a Escola
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Perfeita!
              </span> 🎓
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-6 md:mb-8 font-medium px-4">
            Análise inteligente com{' '}
            <span className="font-black text-blue-600">custo-benefício</span>,{' '}
            <span className="font-black text-pink-600">inclusão</span> e{' '}
            <span className="font-black text-purple-600">qualidade pedagógica</span>
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 px-4">
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-full shadow-md border-2 border-blue-100">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs md:text-sm font-bold text-gray-800">1.427 Escolas</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-full shadow-md border-2 border-purple-100">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs md:text-sm font-bold text-gray-800">Dados Oficiais</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-full shadow-md border-2 border-green-100">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs md:text-sm font-bold text-gray-800">100% Grátis</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatsInfographic />

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              Filtros de Busca
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Estado
              </label>
              <select
                value={uf}
                onChange={(e) => {
                  setUf(e.target.value);
                  setMunicipio('');
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
              >
                <option value="">Todos os estados</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Município
              </label>
              <input
                type="text"
                placeholder="Digite o município..."
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Rede de Ensino
              </label>
              <select
                value={redeEnsino}
                onChange={(e) => setRedeEnsino(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
              >
                <option value="">Todas as redes</option>
                <option value="privada">Privada</option>
                <option value="federal">Federal</option>
                <option value="estadual">Estadual</option>
                <option value="municipal">Municipal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Buscar escola
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Erro ao carregar dados
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEscolas.map(escola => (
                <EscolaCard
                  key={escola.id}
                  escola={escola}
                  onClick={() => setSelectedEscolaId(escola.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {escolaDetalhadaResponse?.data && (
        <EscolaDetalhesModal
          escola={escolaDetalhadaResponse.data}
          onClose={() => setSelectedEscolaId(null)}
        />
      )}

      <ChatWidget />
      <InstallPWA />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
