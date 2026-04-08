import { X, Heart, Brain, Star, Shield, Users, CheckCircle, Award, BookOpen, TrendingUp, MapPin, DollarSign, Sparkles, Target, MessageCircle, Activity, Lightbulb } from 'lucide-react';

interface EscolaInclusaoModalProps {
  escola: any;
  necessidade: {
    id: string;
    nome: string;
    descricao: string;
  };
  onClose: () => void;
}

export function EscolaInclusaoModal({ escola, necessidade, onClose }: EscolaInclusaoModalProps) {
  const getNecessidadeIcon = () => {
    switch (necessidade.id) {
      case 'autismo':
        return Heart;
      case 'tdah':
        return Brain;
      case 'superdotacao':
        return Star;
      case 'dislexia':
        return Shield;
      default:
        return Users;
    }
  };

  const getNecessidadeColor = () => {
    switch (necessidade.id) {
      case 'autismo':
        return { from: 'from-red-500', to: 'to-pink-600', bg: 'from-red-50 to-pink-50', border: 'border-red-200' };
      case 'tdah':
        return { from: 'from-purple-500', to: 'to-fuchsia-600', bg: 'from-purple-50 to-fuchsia-50', border: 'border-purple-200' };
      case 'superdotacao':
        return { from: 'from-amber-500', to: 'to-yellow-600', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200' };
      case 'dislexia':
        return { from: 'from-blue-500', to: 'to-cyan-600', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200' };
      default:
        return { from: 'from-green-500', to: 'to-emerald-600', bg: 'from-green-50 to-emerald-50', border: 'border-green-200' };
    }
  };

  const Icon = getNecessidadeIcon();
  const colors = getNecessidadeColor();

  const inclusaoInfo = escola.caracteristicas?.inclusao || '';
  const metodologia = escola.caracteristicas?.metodologia || 'tradicional';
  const diferenciais = escola.caracteristicas?.diferenciais || [];
  const atividades = escola.caracteristicas?.atividades_extracurriculares || [];
  const bilingue = escola.caracteristicas?.bilingue;
  const internacional = escola.caracteristicas?.internacional;

  const getMotivos = () => {
    const motivos: string[] = [];

    if (necessidade.id === 'autismo') {
      if (inclusaoInfo.toLowerCase().includes('tea') || inclusaoInfo.toLowerCase().includes('autismo')) {
        motivos.push('Experiência comprovada com TEA');
      }
      if (inclusaoInfo.toLowerCase().includes('equipe multidisciplinar') || inclusaoInfo.toLowerCase().includes('psicólogo')) {
        motivos.push('Equipe multidisciplinar especializada');
      }
      if (inclusaoInfo.toLowerCase().includes('sala de recursos')) {
        motivos.push('Sala de recursos disponível');
      }
      if (inclusaoInfo.toLowerCase().includes('individualizado') || inclusaoInfo.toLowerCase().includes('adaptações')) {
        motivos.push('Acompanhamento individualizado');
      }
    }

    if (necessidade.id === 'tdah') {
      if (inclusaoInfo.toLowerCase().includes('tdah')) {
        motivos.push('Experiência específica com TDAH');
      }
      if (inclusaoInfo.toLowerCase().includes('psicopedagogo') || inclusaoInfo.toLowerCase().includes('psicólogo')) {
        motivos.push('Suporte psicopedagógico');
      }
      if (metodologia !== 'tradicional') {
        motivos.push('Metodologia adaptada e flexível');
      }
      if (inclusaoInfo.toLowerCase().includes('adaptações pedagógicas')) {
        motivos.push('Adaptações pedagógicas personalizadas');
      }
    }

    if (necessidade.id === 'superdotacao') {
      if (inclusaoInfo.toLowerCase().includes('superdota') || inclusaoInfo.toLowerCase().includes('altas habilidades')) {
        motivos.push('Programa específico para superdotação');
      }
      if (atividades.some((a: string) => a.toLowerCase().includes('olimpíada'))) {
        motivos.push('Forte tradição em olimpíadas acadêmicas');
      }
      if (inclusaoInfo.toLowerCase().includes('enriquecimento') || inclusaoInfo.toLowerCase().includes('avançad')) {
        motivos.push('Atividades de enriquecimento curricular');
      }
      if (metodologia === 'sociointeracionista' || metodologia === 'construtivista') {
        motivos.push('Metodologia que estimula criatividade');
      }
    }

    if (necessidade.id === 'dislexia') {
      if (inclusaoInfo.toLowerCase().includes('dislexia')) {
        motivos.push('Experiência com dislexia');
      }
      if (inclusaoInfo.toLowerCase().includes('sala de recursos')) {
        motivos.push('Sala de recursos para reforço');
      }
      if (inclusaoInfo.toLowerCase().includes('adaptações')) {
        motivos.push('Adaptações de avaliação e materiais');
      }
    }

    if (escola.tipo === 'federal') {
      motivos.push('Escola pública federal de excelência');
    }
    if (escola.score_composto && parseFloat(escola.score_composto) > 70) {
      motivos.push('Alto desempenho acadêmico');
    }
    if (bilingue) {
      motivos.push('Programa bilíngue');
    }
    if (internacional) {
      motivos.push('Currículo internacional');
    }

    return motivos.length > 0 ? motivos : ['Atende educação inclusiva'];
  };

  const getVantagens = () => {
    const vantagens: string[] = [];

    if (metodologia === 'sociointeracionista') {
      vantagens.push('Metodologia que respeita ritmos individuais de aprendizagem');
    } else if (metodologia === 'construtivista') {
      vantagens.push('Foco no protagonismo do aluno e aprendizado ativo');
    } else if (metodologia === 'montessoriana') {
      vantagens.push('Ambiente preparado e aprendizado autodirigido');
    } else if (metodologia === 'waldorf') {
      vantagens.push('Educação holística com foco no desenvolvimento integral');
    }

    if (Array.isArray(diferenciais)) {
      diferenciais.slice(0, 3).forEach((dif: string) => {
        vantagens.push(dif);
      });
    }

    if (atividades.length > 0) {
      vantagens.push(`Atividades diversificadas: ${atividades.slice(0, 3).join(', ')}`);
    }

    return vantagens;
  };

  const motivos = getMotivos();
  const vantagens = getVantagens();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-100">
        {/* Header */}
        <div className={`sticky top-0 bg-gradient-to-br ${colors.from} ${colors.to} text-white p-8 rounded-t-3xl z-10 shadow-lg`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-white/30 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-white/40">
                <Icon className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black mb-3">{escola.nome}</h2>
                <div className="flex items-center gap-2 text-white/95 mb-4">
                  <MapPin className="h-5 w-5" />
                  <span className="text-base font-bold">
                    {escola.bairro}, {escola.municipio} - {escola.uf}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full border-2 border-white/40 shadow-lg">
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-black">{necessidade.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full border-2 border-white/40 shadow-lg">
                    <Brain className="h-5 w-5" />
                    <span className="text-sm font-black">Análise Psicopedagógica</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-3 rounded-xl transition-all hover:scale-110">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Motivos */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl shadow-xl">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900">
                Por que recomendamos esta escola?
              </h3>
            </div>
            <ul className="space-y-4">
              {motivos.map((motivo, index) => (
                <li key={index} className="flex items-start gap-4 group">
                  <div className="bg-green-100 p-2 rounded-xl group-hover:bg-green-200 transition-colors">
                    <CheckCircle className="h-6 w-6 text-green-700 flex-shrink-0" />
                  </div>
                  <span className="text-gray-900 text-base leading-relaxed font-bold">
                    {motivo}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Inclusão */}
          {inclusaoInfo && (
            <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-3xl p-8 shadow-lg`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`bg-gradient-to-br ${colors.from} ${colors.to} p-4 rounded-2xl shadow-xl`}>
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">
                  Estrutura de Inclusão
                </h3>
              </div>
              <p className="text-gray-900 text-base leading-relaxed font-bold">
                {inclusaoInfo}
              </p>
            </div>
          )}

          {/* Vantagens */}
          {vantagens.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">
                  Diferenciais Pedagógicos
                </h3>
              </div>
              <ul className="space-y-4">
                {vantagens.map((vantagem, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <div className="bg-blue-100 p-2 rounded-xl group-hover:bg-blue-200 transition-colors">
                      <Award className="h-6 w-6 text-blue-700 flex-shrink-0" />
                    </div>
                    <span className="text-gray-900 text-base leading-relaxed font-bold">
                      {vantagem}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gray-100 p-2 rounded-xl">
                  <BookOpen className="h-6 w-6 text-gray-700" />
                </div>
                <h4 className="font-black text-gray-900 text-base">Tipo</h4>
              </div>
              <p className="text-gray-900 capitalize font-black text-xl">{escola.tipo}</p>
              {metodologia && (
                <p className="text-sm text-gray-600 mt-2 capitalize font-bold">{metodologia}</p>
              )}
            </div>

            {escola.score_composto && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-600 p-2 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-black text-gray-900 text-base">Desempenho</h4>
                </div>
                <p className="text-4xl font-black text-gray-900">
                  {parseFloat(escola.score_composto).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 font-bold mt-2">Score composto</p>
              </div>
            )}

            {escola.mensalidade_anual && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-600 p-2 rounded-xl">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-black text-gray-900 text-base">Mensalidade</h4>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  R$ {(parseFloat(escola.mensalidade_anual) / 12).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 font-bold mt-2">por mês</p>
              </div>
            )}

            {escola.icb && (
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-600 p-2 rounded-xl">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-black text-gray-900 text-base">Custo-Benefício</h4>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  {parseFloat(escola.icb).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 font-bold mt-2">ICB</p>
              </div>
            )}
          </div>

          {/* Atividades */}
          {atividades.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-2 border-purple-200 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-4 rounded-2xl shadow-xl">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">
                  Atividades Extracurriculares
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {atividades.map((atividade: string, index: number) => (
                  <span key={index} className="px-5 py-2.5 bg-white text-gray-900 text-base rounded-full border-2 border-purple-200 font-black shadow-md hover:shadow-lg transition-all hover:scale-105">
                    {atividade}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-3xl p-8 shadow-lg">
            <div className="flex items-start gap-6">
              <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-4 rounded-2xl shadow-xl flex-shrink-0">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black text-gray-900 mb-4">
                  Próximos Passos
                </h3>
                <p className="text-gray-900 text-base mb-6 leading-relaxed font-bold">
                  Recomendamos agendar uma visita presencial para conhecer a estrutura, conversar com a equipe pedagógica
                  e verificar se a escola atende às necessidades do seu filho.
                </p>
                <button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-xl transition-all font-black text-base flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105">
                  <MessageCircle className="h-6 w-6" />
                  Conversar com a Assistente IA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
