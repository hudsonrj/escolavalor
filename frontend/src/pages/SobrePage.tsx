import { ArrowLeft, Target, Users, TrendingUp, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SobrePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para o início
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Sobre o EscolaValor</h1>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                Nossa Missão
              </h2>
              <p className="text-lg leading-relaxed">
                Democratizar o acesso à informação educacional de qualidade, ajudando famílias
                brasileiras a encontrar a escola ideal para seus filhos através de dados
                transparentes, análises objetivas e inteligência artificial.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Quem Somos
              </h2>
              <p>
                O EscolaValor é uma plataforma educacional brasileira que utiliza tecnologia
                e ciência de dados para transformar informações públicas em insights valiosos.
              </p>
              <p>
                Analisamos milhares de escolas em todo o Brasil, considerando múltiplos fatores:
                desempenho acadêmico (ENEM, IDEB), aprovações em universidades, medalhas em
                olimpíadas científicas, infraestrutura, inclusão, e custo-benefício.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                O que Fazemos
              </h2>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Rankings Inteligentes:</strong> Analisamos dados de ENEM, IDEB,
                  aprovações universitárias e olimpíadas para criar rankings objetivos.
                </li>
                <li>
                  <strong>Análise de Custo-Benefício:</strong> Calculamos o ICB (Índice
                  Custo-Benefício) para ajudar famílias a encontrar escolas com o melhor
                  retorno sobre investimento.
                </li>
                <li>
                  <strong>Foco em Inclusão:</strong> Destacamos escolas com programas de
                  inclusão para TEA, TDAH, dislexia, superdotação e outras necessidades
                  especiais.
                </li>
                <li>
                  <strong>Dados Atualizados:</strong> Nossa base de dados é constantemente
                  atualizada com informações oficiais do MEC, INEP e outras fontes confiáveis.
                </li>
                <li>
                  <strong>Busca Personalizada:</strong> Inteligência artificial para recomendar
                  escolas baseadas no perfil e necessidades específicas de cada família.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Heart className="w-8 h-8 text-blue-600" />
                Nossos Valores
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Transparência</h3>
                  <p className="text-sm">
                    Todos os nossos dados são baseados em fontes públicas e oficiais.
                    Nossa metodologia de ranqueamento é clara e objetiva.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Inclusão</h3>
                  <p className="text-sm">
                    Acreditamos que toda criança merece acesso a educação de qualidade,
                    independente de suas necessidades específicas.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Inovação</h3>
                  <p className="text-sm">
                    Utilizamos tecnologia de ponta e inteligência artificial para
                    fornecer as melhores recomendações.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Imparcialidade</h3>
                  <p className="text-sm">
                    Não recebemos pagamentos de escolas. Nossos rankings são
                    100% baseados em mérito e dados oficiais.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Fontes de Dados</h2>
              <p>Utilizamos exclusivamente dados públicos e oficiais:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>INEP - Instituto Nacional de Estudos e Pesquisas Educacionais</li>
                <li>MEC - Ministério da Educação</li>
                <li>ENEM - Exame Nacional do Ensino Médio</li>
                <li>IDEB - Índice de Desenvolvimento da Educação Básica</li>
                <li>Resultados de Olimpíadas Científicas (OBMEP, OBF, OBQ, etc.)</li>
                <li>Dados de aprovações em vestibulares e SISU</li>
              </ul>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Junte-se a Nós</h2>
              <p>
                O EscolaValor está em constante evolução. Se você acredita que educação
                de qualidade deve ser acessível a todos, junte-se a nós nessa missão.
              </p>
              <p className="mt-4">
                <strong>Contato:</strong> contato@escolavalor.com.br
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
