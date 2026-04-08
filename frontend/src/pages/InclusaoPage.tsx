import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { BackgroundIllustration } from '../components/BackgroundIllustration';
import { EscolaInclusaoModal } from '../components/EscolaInclusaoModal';
import { Heart, Brain, Star, Users, Shield, ArrowLeft, Loader2, Filter } from 'lucide-react';

interface NecessidadeEspecial {
  id: string;
  nome: string;
  descricao: string;
  icon: any;
  keywords: string[];
}

const NECESSIDADES: NecessidadeEspecial[] = [
  {
    id: 'autismo',
    nome: 'Autismo / TEA',
    descricao: 'Transtorno do Espectro Autista',
    icon: Heart,
    keywords: ['autismo', 'tea', 'espectro autista'],
  },
  {
    id: 'tdah',
    nome: 'TDAH',
    descricao: 'Transtorno de Déficit de Atenção e Hiperatividade',
    icon: Brain,
    keywords: ['tdah', 'déficit de atenção', 'hiperatividade'],
  },
  {
    id: 'superdotacao',
    nome: 'Superdotação',
    descricao: 'Altas Habilidades / Superdotação',
    icon: Star,
    keywords: ['superdotado', 'altas habilidades', 'dotado'],
  },
  {
    id: 'dislexia',
    nome: 'Dislexia',
    descricao: 'Dificuldades de Aprendizagem',
    icon: Shield,
    keywords: ['dislexia', 'disléxico'],
  },
  {
    id: 'outras',
    nome: 'Outras Necessidades',
    descricao: 'Deficiências e necessidades diversas',
    icon: Users,
    keywords: ['deficiência', 'especial', 'inclusão'],
  },
];

async function buscarEscolasInclusivas(necessidade?: string, uf?: string) {
  const params = new URLSearchParams();
  if (necessidade) params.append('necessidade', necessidade);
  if (uf) params.append('uf', uf);

  const response = await fetch(`/api/chat/search-schools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      criterios: {
        uf,
        necessidades_especiais: necessidade ? [necessidade] : [],
      },
      limit: 50,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar escolas');
  }

  return response.json();
}

interface InclusaoPageProps {
  onVoltar?: () => void;
}

export function InclusaoPage({ onVoltar }: InclusaoPageProps) {
  const [necessidadeSelecionada, setNecessidadeSelecionada] = useState<string | null>(null);
  const [uf, setUf] = useState('RJ');
  const [escolaSelecionada, setEscolaSelecionada] = useState<any | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['escolas-inclusivas', necessidadeSelecionada, uf],
    queryFn: () => buscarEscolasInclusivas(necessidadeSelecionada || undefined, uf),
    enabled: !!necessidadeSelecionada,
  });

  return (
    <div className="min-h-screen relative">
      <BackgroundIllustration />
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {onVoltar && (
            <button
              onClick={onVoltar}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl shadow-md hover:shadow-lg mb-6 transition-all font-bold border-2 border-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>
          )}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-gray-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-4 rounded-2xl shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-black text-gray-900">
                Educação Inclusiva
              </h1>
            </div>
            <p className="text-lg text-gray-700 font-medium">
              Encontre escolas preparadas para necessidades especiais e neurodivergência
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-3xl p-8 mb-8 shadow-lg">
          <h2 className="text-xl font-black text-gray-900 mb-3">
            Sobre Esta Ferramenta
          </h2>
          <p className="text-gray-700 leading-relaxed font-medium">
            Ajudamos você a encontrar escolas que oferecem suporte adequado para crianças com necessidades especiais,
            incluindo autismo, TDAH, superdotação, dislexia e outras condições. As escolas listadas foram avaliadas
            com base em sua estrutura, metodologias e experiência comprovada em educação inclusiva.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              Selecione o Perfil
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* UF Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Estado
              </label>
              <select
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
              >
                <option value="">Todos os estados</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="SP">São Paulo</option>
                <option value="MG">Minas Gerais</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="PR">Paraná</option>
                <option value="SC">Santa Catarina</option>
                <option value="BA">Bahia</option>
                <option value="PE">Pernambuco</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
              </select>
            </div>
          </div>

          {/* Necessidades Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NECESSIDADES.map((necessidade) => {
              const Icon = necessidade.icon;
              const isSelected = necessidadeSelecionada === necessidade.id;

              return (
                <button
                  key={necessidade.id}
                  onClick={() => setNecessidadeSelecionada(necessidade.id)}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 hover:-translate-y-1 ${
                    isSelected
                      ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-xl'
                      : 'border-gray-200 bg-white hover:border-pink-300 shadow-md hover:shadow-xl'
                  }`}
                >
                  <div className={`mb-4 inline-flex p-3 rounded-xl ${
                    isSelected
                      ? 'bg-gradient-to-br from-pink-600 to-rose-600 shadow-lg'
                      : 'bg-gray-100 group-hover:bg-pink-100'
                  }`}>
                    <Icon className={`h-7 w-7 ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-pink-600'}`} />
                  </div>
                  <h3 className={`text-lg font-black mb-2 ${
                      isSelected ? 'text-gray-900' : 'text-gray-900'
                    }`}
                  >
                    {necessidade.nome}
                  </h3>
                  <p className={`text-sm font-medium ${
                      isSelected ? 'text-gray-700' : 'text-gray-600'
                    }`}
                  >
                    {necessidade.descricao}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        {necessidadeSelecionada && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Escolas Recomendadas
            </h2>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                <span className="ml-3 text-gray-900 font-bold">
                  Buscando escolas...
                </span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <p className="text-red-700 font-bold">
                  Erro ao carregar escolas. Tente novamente.
                </p>
              </div>
            )}

            {!isLoading && !error && data?.escolas && (
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
                  <p className="text-gray-900 font-bold">
                    Encontramos <span className="text-blue-600 text-xl">{data.escolas.length}</span> escolas
                    que atendem suas necessidades
                  </p>
                </div>

                {data.escolas.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-700 font-bold mb-2">
                      Nenhuma escola encontrada com os critérios selecionados.
                    </p>
                    <p className="text-gray-600 font-medium">
                      Tente expandir a busca para outros estados ou use nosso chat para ajuda personalizada.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.escolas.map((escola: any) => (
                      <div
                        key={escola.id}
                        className="group bg-white/90 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-6 hover:shadow-2xl hover:border-pink-300 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                        onClick={() => setEscolaSelecionada(escola)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-black text-gray-900 text-lg group-hover:text-pink-600 transition-colors leading-tight pr-2">
                            {escola.nome}
                          </h3>
                          <div className="bg-pink-100 p-2 rounded-xl">
                            <Heart className="h-5 w-5 text-pink-600 flex-shrink-0" />
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 flex items-center gap-2 font-medium">
                          <span className="inline-block w-2 h-2 bg-pink-500 rounded-full"></span>
                          {escola.bairro}, {escola.municipio} - {escola.uf}
                        </p>

                        <div className="space-y-3 mb-4">
                          {escola.score_composto && (
                            <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
                              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                Score Acadêmico
                              </span>
                              <span className="text-lg font-black text-gray-900">
                                {parseFloat(escola.score_composto).toFixed(1)}
                              </span>
                            </div>
                          )}
                          {escola.mensalidade_anual && (
                            <div className="flex items-center justify-between bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3">
                              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                Mensalidade
                              </span>
                              <span className="text-lg font-black text-gray-900">
                                R$ {(parseFloat(escola.mensalidade_anual) / 12).toFixed(2)}/mês
                              </span>
                            </div>
                          )}
                        </div>

                        <button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white py-3 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                          Ver por que é ideal
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!necessidadeSelecionada && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-gray-100 p-12 text-center">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-3xl inline-block mb-6">
              <Heart className="h-16 w-16 text-pink-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">
              Selecione uma necessidade especial acima
            </h3>
            <p className="text-gray-700 font-medium max-w-md mx-auto">
              Escolha o perfil que melhor se adequa às necessidades do seu filho para ver escolas recomendadas
            </p>
          </div>
        )}
      </main>

      {/* Modal de Detalhes */}
      {escolaSelecionada && necessidadeSelecionada && (
        <EscolaInclusaoModal
          escola={escolaSelecionada}
          necessidade={NECESSIDADES.find(n => n.id === necessidadeSelecionada)!}
          onClose={() => setEscolaSelecionada(null)}
        />
      )}
    </div>
  );
}
