import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermosPage() {
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
          <h1 className="text-4xl font-black text-gray-900 mb-8">Termos de Uso</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Última atualização: 07 de abril de 2026</p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar o EscolaValor, você concorda com estes Termos de Uso.
                Se você não concordar com qualquer parte destes termos, não use nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p>
                O EscolaValor é uma plataforma que fornece informações sobre escolas brasileiras,
                incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Rankings baseados em dados oficiais (ENEM, IDEB, aprovações universitárias)</li>
                <li>Análise de custo-benefício</li>
                <li>Informações sobre inclusão e acessibilidade</li>
                <li>Dados sobre medalhas em olimpíadas</li>
                <li>Avaliações e recomendações</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Uso da Plataforma</h2>
              <p>Você concorda em usar o EscolaValor apenas para fins legais e de acordo com estes termos:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Não use a plataforma para fins fraudulentos ou ilegais</li>
                <li>Não tente acessar áreas restritas do sistema</li>
                <li>Não copie, reproduza ou distribua conteúdo sem autorização</li>
                <li>Não use scrapers, bots ou ferramentas automatizadas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Fonte de Dados</h2>
              <p>
                As informações fornecidas pelo EscolaValor são baseadas em dados públicos e oficiais,
                incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>INEP (Instituto Nacional de Estudos e Pesquisas Educacionais)</li>
                <li>MEC (Ministério da Educação)</li>
                <li>ENEM (Exame Nacional do Ensino Médio)</li>
                <li>IDEB (Índice de Desenvolvimento da Educação Básica)</li>
                <li>Dados de olimpíadas científicas</li>
                <li>Avaliações de usuários</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Precisão das Informações</h2>
              <p>
                Embora nos esforcemos para fornecer informações precisas e atualizadas:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Não garantimos a precisão completa de todos os dados</li>
                <li>As informações podem estar desatualizadas</li>
                <li>Recomendamos sempre verificar dados diretamente com as escolas</li>
                <li>Os rankings são ferramentas de referência, não decisões definitivas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo do EscolaValor, incluindo texto, gráficos, logos, ícones, imagens,
                e software, é propriedade do EscolaValor ou de seus licenciadores e está protegido
                por leis de direitos autorais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Anúncios</h2>
              <p>
                O EscolaValor pode exibir anúncios através do Google AdSense e outros parceiros.
                Não somos responsáveis pelo conteúdo dos anúncios de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Links para Sites de Terceiros</h2>
              <p>
                Nossa plataforma pode conter links para sites de terceiros. Não somos responsáveis
                pelo conteúdo ou políticas de privacidade desses sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitação de Responsabilidade</h2>
              <p>
                O EscolaValor é fornecido "como está". Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Decisões tomadas com base nas informações fornecidas</li>
                <li>Danos diretos ou indiretos resultantes do uso da plataforma</li>
                <li>Interrupções ou erros no serviço</li>
                <li>Perda de dados ou informações</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modificações dos Termos</h2>
              <p>
                Reservamos o direito de modificar estes termos a qualquer momento. Alterações
                significativas serão notificadas através do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Lei Aplicável</h2>
              <p>
                Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida
                nos tribunais brasileiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contato</h2>
              <p>
                Para questões sobre estes Termos de Uso:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>E-mail:</strong> contato@escolavalor.com.br</li>
                <li><strong>Site:</strong> escolavalor.com.br</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
