import { X, MapPin, Award, TrendingUp, BookOpen, Medal, GraduationCap, Users, Trophy, Building2, Star, Phone, Mail, Globe, Languages, Plane, BadgeCheck, MessageCircle, ThumbsUp, AlertCircle, Inbox, Sparkles } from 'lucide-react';
import type { EscolaDetalhada } from '../types';
import { GraficoMedalhas } from './GraficoMedalhas';
import { GraficoReclamacoes } from './GraficoReclamacoes';
import { GraficoEnemAreas } from './GraficoEnemAreas';
import { GraficoEnemHistorico } from './GraficoEnemHistorico';
import { GraficoAprovacoes5Anos } from './GraficoAprovacoes5Anos';
import {
  formatCurrency,
  formatScore,
  formatICB,
  getTipoLabel,
  getICBRating
} from '../lib/utils';
import { cn } from '../lib/utils';

interface EscolaDetalhesModalProps {
  escola: EscolaDetalhada;
  onClose: () => void;
}

// Componente para seção vazia
function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
      <div className="bg-white p-4 rounded-full shadow-md mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h4 className="text-lg font-bold text-gray-700 mb-2">{title}</h4>
      <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>
    </div>
  );
}

export function EscolaDetalhesModal({ escola, onClose }: EscolaDetalhesModalProps) {
  const score = escola.score?.score_composto ? parseFloat(String(escola.score.score_composto)) : 0;
  const icb = escola.score?.icb ? parseFloat(String(escola.score.icb)) : null;
  const icbRating = icb ? getICBRating(icb) : null;

  const enemDetalhe = escola.enemDetalhes?.[0];
  const totalAprovacoes = escola.aprovacoesUniversitarias?.reduce((sum, a) => sum + a.quantidade, 0) || 0;
  const totalMilitares = escola.concursosMilitares?.reduce((sum, c) => sum + c.aprovados, 0) || 0;

  // Agrupar aprovações por universidade
  const aprovacoesPorUniversidade = escola.aprovacoesUniversitarias?.reduce((acc, aprov) => {
    if (!acc[aprov.universidade]) {
      acc[aprov.universidade] = { total: 0 };
    }
    acc[aprov.universidade].total += aprov.quantidade;
    return acc;
  }, {} as Record<string, { total: number }>);

  // Agrupar medalhas por competição e nível
  const medalhasPorCompeticao = escola.olimpiadas?.reduce((acc, olimpiada) => {
    const comp = olimpiada.competicao.toUpperCase();
    if (!acc[comp]) {
      acc[comp] = { ouro: 0, prata: 0, bronze: 0, mencao: 0, total: 0 };
    }
    acc[comp][olimpiada.nivel]++;
    acc[comp].total++;
    return acc;
  }, {} as Record<string, { ouro: number; prata: number; bronze: number; mencao: number; total: number }>);

  const getCompetitionLabel = (comp: string): string => {
    const labels: Record<string, string> = {
      'OBMEP': 'Olimpíada Brasileira de Matemática',
      'OBF': 'Olimpíada Brasileira de Física',
      'OBQ': 'Olimpíada Brasileira de Química',
      'OBA': 'Olimpíada Brasileira de Astronomia',
      'CANGURU': 'Canguru de Matemática',
      'OMERJ': 'Olimpíada de Matemática do RJ',
      'MANDACARU': 'Olimpíada Mandacaru de Matemática',
    };
    return labels[comp] || comp;
  };

  const getConcursoLabel = (concurso: string): string => {
    const labels: Record<string, string> = {
      'espcex': 'EsPCEx',
      'afa': 'AFA',
      'efomm': 'EFOMM',
      'en': 'Escola Naval',
      'ita': 'ITA',
      'ime': 'IME',
    };
    return labels[concurso] || concurso;
  };

  const getMetodologiaLabel = (metodologia: string | null): string => {
    const labels: Record<string, string> = {
      'tradicional': 'Tradicional',
      'montessori': 'Montessori',
      'waldorf': 'Waldorf',
      'construtivista': 'Construtivista',
      'sociointeracionista': 'Sociointeracionista',
      'freiriana': 'Freiriana',
      'internacional': 'Internacional',
    };
    return metodologia ? labels[metodologia] || metodologia : 'Não informada';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Gradiente */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl p-8 flex items-start justify-between z-10 shadow-lg">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                <Sparkles className="h-3 w-3" />
                {getTipoLabel(escola.tipo)}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
              {escola.nome}
            </h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{escola.municipio}, {escola.uf}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/20 transition-all backdrop-blur-sm"
            aria-label="Fechar"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Composto */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white/90 uppercase tracking-wide">
                    Score Composto
                  </p>
                </div>
                <p className="text-5xl font-black text-white mb-1">
                  {score > 0 ? score.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-white/70 font-medium">Avaliação Geral</p>
              </div>
            </div>

            {/* Mensalidade */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white/90 uppercase tracking-wide">
                    Mensalidade Anual
                  </p>
                </div>
                <p className="text-3xl font-black text-white mb-1">
                  {escola.mensalidade_anual ? formatCurrency(escola.mensalidade_anual) : 'Gratuita'}
                </p>
                <p className="text-xs text-white/70 font-medium">Valor Estimado</p>
              </div>
            </div>

            {/* ICB */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white/90 uppercase tracking-wide">
                    Custo-Benefício
                  </p>
                </div>
                {icb && icbRating ? (
                  <>
                    <p className="text-5xl font-black text-white mb-1">
                      {icb.toFixed(2)}
                    </p>
                    <p className="text-xs text-white/70 font-medium">{icbRating.label}</p>
                  </>
                ) : (
                  <>
                    <p className="text-5xl font-black text-white mb-1">—</p>
                    <p className="text-xs text-white/70 font-medium">Não disponível</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Informações da Escola
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {escola.total_alunos && (
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total de Alunos</p>
                    <p className="text-lg font-bold text-gray-900">{escola.total_alunos.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {escola.total_professores && (
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total de Professores</p>
                    <p className="text-lg font-bold text-gray-900">{escola.total_professores.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {escola.informacoes?.metodologia && (
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Metodologia</p>
                    <p className="text-lg font-bold text-gray-900">{getMetodologiaLabel(escola.informacoes.metodologia)}</p>
                  </div>
                </div>
              )}
              {escola.informacoes?.bilingue === 'sim' && (
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Languages className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Ensino Bilíngue</p>
                    <p className="text-lg font-bold text-gray-900">Sim</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desempenho no ENEM */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              Desempenho no ENEM
            </h3>

            {escola.enemDetalhes && escola.enemDetalhes.length > 0 ? (
              <>
                {/* Resumo do ano mais recente */}
                {enemDetalhe && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-1 font-bold">Média Geral</p>
                      <p className="text-3xl font-black text-blue-600">
                        {parseFloat(enemDetalhe.nota_media).toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{enemDetalhe.ano_referencia}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-1 font-bold">Maior Nota</p>
                      <p className="text-3xl font-black text-green-600">
                        {parseFloat(enemDetalhe.nota_maxima).toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{enemDetalhe.ano_referencia}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-1 font-bold">Total de Alunos</p>
                      <p className="text-3xl font-black text-purple-600">
                        {enemDetalhe.total_alunos}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{enemDetalhe.ano_referencia}</p>
                    </div>
                    {enemDetalhe.matematica_media && (
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1 font-bold">Matemática</p>
                        <p className="text-3xl font-black text-orange-600">
                          {parseFloat(enemDetalhe.matematica_media).toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-1">{enemDetalhe.ano_referencia}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Histórico de Notas</h4>
                    <GraficoEnemHistorico enemDetalhes={escola.enemDetalhes} />
                  </div>
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Desempenho por Área</h4>
                    {enemDetalhe && (
                      <GraficoEnemAreas enemDetalhe={enemDetalhe} />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Inbox}
                title="Sem dados do ENEM"
                description="Esta escola ainda não possui informações de desempenho no ENEM em nossa base de dados."
              />
            )}
          </div>

          {/* Aprovações Universitárias */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              Aprovações Universitárias
            </h3>

            {escola.aprovacoesUniversitarias && escola.aprovacoesUniversitarias.length > 0 ? (
              <>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-bold mb-1">Total de Aprovações</p>
                      <p className="text-5xl font-black text-green-600">{totalAprovacoes}</p>
                      <p className="text-sm text-gray-500 font-medium mt-1">Últimos 5 anos</p>
                    </div>
                    <Trophy className="h-16 w-16 text-green-300" />
                  </div>
                </div>

                {/* Gráfico de aprovações */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Aprovações por Ano</h4>
                  <GraficoAprovacoes5Anos aprovacoesUniversitarias={escola.aprovacoesUniversitarias} />
                </div>

                {/* Top Universidades */}
                {aprovacoesPorUniversidade && Object.keys(aprovacoesPorUniversidade).length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Principais Universidades</h4>
                    <div className="space-y-3">
                      {Object.entries(aprovacoesPorUniversidade)
                        .sort((a, b) => b[1].total - a[1].total)
                        .slice(0, 10)
                        .map(([univ, data]) => (
                          <div key={univ} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <BadgeCheck className="h-5 w-5 text-green-600" />
                              </div>
                              <span className="font-bold text-gray-900">{univ}</span>
                            </div>
                            <span className="text-2xl font-black text-green-600">{data.total}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={GraduationCap}
                title="Sem aprovações registradas"
                description="Esta escola ainda não possui registros de aprovações universitárias em nossa base de dados."
              />
            )}
          </div>

          {/* Olimpíadas */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <Medal className="h-6 w-6 text-white" />
              </div>
              Medalhas em Olimpíadas
            </h3>

            {escola.olimpiadas && escola.olimpiadas.length > 0 ? (
              <>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-bold mb-1">Total de Medalhas</p>
                      <p className="text-5xl font-black text-amber-600">{escola.olimpiadas.length}</p>
                      <p className="text-sm text-gray-500 font-medium mt-1">Todas as competições</p>
                    </div>
                    <Medal className="h-16 w-16 text-amber-300" />
                  </div>
                </div>

                {/* Gráfico de medalhas */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Medalhas</h4>
                  <GraficoMedalhas olimpiadas={escola.olimpiadas} />
                </div>

                {/* Por competição */}
                {medalhasPorCompeticao && Object.keys(medalhasPorCompeticao).length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Medalhas por Competição</h4>
                    <div className="space-y-3">
                      {Object.entries(medalhasPorCompeticao)
                        .sort((a, b) => b[1].total - a[1].total)
                        .map(([comp, medals]) => (
                          <div key={comp} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-gray-900">{getCompetitionLabel(comp)}</h5>
                              <span className="text-2xl font-black text-amber-600">{medals.total}</span>
                            </div>
                            <div className="flex gap-2">
                              {medals.ouro > 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                                  🥇 {medals.ouro}
                                </span>
                              )}
                              {medals.prata > 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">
                                  🥈 {medals.prata}
                                </span>
                              )}
                              {medals.bronze > 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                                  🥉 {medals.bronze}
                                </span>
                              )}
                              {medals.mencao > 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                  ⭐ {medals.mencao}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Medal}
                title="Sem medalhas registradas"
                description="Esta escola ainda não possui registros de medalhas em olimpíadas científicas em nossa base de dados."
              />
            )}
          </div>

          {/* Concursos Militares */}
          {escola.concursosMilitares && escola.concursosMilitares.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                Concursos Militares
              </h3>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-bold mb-1">Total de Aprovados</p>
                    <p className="text-5xl font-black text-indigo-600">{totalMilitares}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Todos os concursos</p>
                  </div>
                  <Star className="h-16 w-16 text-indigo-300" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Aprovações por Concurso</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {escola.concursosMilitares.map((concurso) => (
                    <div key={concurso.id} className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                      <p className="text-sm text-gray-600 font-bold mb-1">{getConcursoLabel(concurso.concurso)}</p>
                      <p className="text-3xl font-black text-indigo-600">{concurso.aprovados}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{concurso.ano_referencia}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reclamações */}
          {escola.reclamacoes && escola.reclamacoes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                Reclamações e Avaliações
              </h3>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Reclamações</h4>
                <GraficoReclamacoes reclamacoes={escola.reclamacoes} />
              </div>
            </div>
          )}

          {/* Contato */}
          {(escola.informacoes?.site || escola.informacoes?.telefone || escola.informacoes?.email) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="h-6 w-6 text-blue-600" />
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {escola.informacoes.site && (
                  <a
                    href={escola.informacoes.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">Site</p>
                      <p className="text-sm font-bold text-blue-600 truncate">Visitar site</p>
                    </div>
                  </a>
                )}
                {escola.informacoes.telefone && (
                  <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Telefone</p>
                      <p className="text-sm font-bold text-gray-900">{escola.informacoes.telefone}</p>
                    </div>
                  </div>
                )}
                {escola.informacoes.email && (
                  <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">E-mail</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{escola.informacoes.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Endereço */}
          {escola.endereco_completo && (
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-gray-600" />
                Endereço
              </h3>
              <p className="text-gray-700 font-medium">{escola.endereco_completo}</p>
              {escola.cep && (
                <p className="text-sm text-gray-500 font-medium mt-2">CEP: {escola.cep}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
