import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacidadePage() {
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
          <h1 className="text-4xl font-black text-gray-900 mb-8">Política de Privacidade</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Última atualização: 07 de abril de 2026</p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informações que Coletamos</h2>
              <p>
                O EscolaValor coleta informações para fornecer melhores serviços aos nossos usuários.
                As informações que coletamos incluem:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dados de navegação e uso da plataforma</li>
                <li>Informações sobre buscas realizadas</li>
                <li>Preferências de filtros e critérios de seleção</li>
                <li>Endereço de e-mail (quando fornecido voluntariamente)</li>
                <li>Dados de localização (apenas quando autorizado)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Como Usamos suas Informações</h2>
              <p>Utilizamos as informações coletadas para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer recomendações personalizadas de escolas</li>
                <li>Melhorar nossos algoritmos de busca e ranqueamento</li>
                <li>Analisar padrões de uso para aprimorar a plataforma</li>
                <li>Enviar comunicações relevantes (quando autorizado)</li>
                <li>Garantir a segurança e prevenir fraudes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Compartilhamento de Dados</h2>
              <p>
                <strong>Não vendemos seus dados pessoais.</strong> Compartilhamos informações apenas quando necessário para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cumprir obrigações legais</li>
                <li>Fornecer os serviços solicitados</li>
                <li>Proteger direitos e segurança</li>
              </ul>
              <p className="mt-4">
                Utilizamos o Google AdSense para exibir anúncios. O Google pode usar cookies e
                tecnologias similares para personalizar anúncios. Você pode gerenciar suas preferências
                de anúncios em: <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline">Google Ads Settings</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies e Tecnologias Semelhantes</h2>
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência.
                Cookies são pequenos arquivos armazenados no seu navegador que nos ajudam a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Manter suas preferências de busca</li>
                <li>Analisar o tráfego do site</li>
                <li>Personalizar conteúdo e anúncios</li>
              </ul>
              <p className="mt-4">
                Você pode configurar seu navegador para recusar cookies, mas isso pode afetar
                o funcionamento de algumas funcionalidades.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger
                seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seus Direitos (LGPD)</h2>
              <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou inexatos</li>
                <li>Solicitar a anonimização ou eliminação de dados</li>
                <li>Revogar o consentimento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dados de Menores</h2>
              <p>
                Nossa plataforma não coleta intencionalmente dados de menores de 18 anos sem
                o consentimento dos pais ou responsáveis legais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos
                sobre mudanças significativas através do site ou por e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contato</h2>
              <p>
                Para questões sobre privacidade ou exercer seus direitos, entre em contato:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>E-mail:</strong> privacidade@escolavalor.com.br</li>
                <li><strong>Site:</strong> escolavalor.com.br</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
