import { ArrowLeft, Mail, MapPin, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContatoPage() {
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
          <h1 className="text-4xl font-black text-gray-900 mb-8">Entre em Contato</h1>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            <p className="text-lg">
              Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">E-mail</h2>
                </div>
                <p className="text-gray-700">
                  <strong>Geral:</strong> contato@escolavalor.com.br<br />
                  <strong>Privacidade:</strong> privacidade@escolavalor.com.br<br />
                  <strong>Suporte:</strong> suporte@escolavalor.com.br
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-8 h-8 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Website</h2>
                </div>
                <p className="text-gray-700">
                  <a
                    href="https://escolavalor.com.br"
                    className="text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    escolavalor.com.br
                  </a>
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Localização</h2>
                </div>
                <p className="text-gray-700">
                  Brasil<br />
                  Plataforma 100% online
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-8 h-8 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900">Horário</h2>
                </div>
                <p className="text-gray-700">
                  Segunda a Sexta<br />
                  9h às 18h (Horário de Brasília)<br />
                  Respondemos em até 24h úteis
                </p>
              </div>
            </div>

            <section className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Como vocês coletam os dados?</h3>
                  <p className="text-sm text-gray-700">
                    Utilizamos exclusivamente dados públicos e oficiais do MEC, INEP, ENEM,
                    e outras fontes governamentais. Não coletamos dados privados de escolas.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Os dados estão atualizados?</h3>
                  <p className="text-sm text-gray-700">
                    Sim! Nossa base de dados é atualizada diariamente com as informações
                    mais recentes disponíveis nas fontes oficiais.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Como posso adicionar minha escola?</h3>
                  <p className="text-sm text-gray-700">
                    As escolas são adicionadas automaticamente com base nos dados públicos.
                    Se sua escola tem dados oficiais no MEC/INEP, ela será incluída.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Vocês cobram das escolas?</h3>
                  <p className="text-sm text-gray-700">
                    Não! Somos 100% imparciais. Não cobramos nada das escolas e não vendemos
                    posições nos rankings. Tudo é baseado em mérito e dados oficiais.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Como exercer meus direitos (LGPD)?</h3>
                  <p className="text-sm text-gray-700">
                    Entre em contato através do e-mail <strong>privacidade@escolavalor.com.br</strong>
                    {' '}para solicitar acesso, correção ou exclusão de seus dados pessoais.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Parcerias e Imprensa</h2>
              <p>
                Interessado em parceria, entrevista ou matéria sobre o EscolaValor?
              </p>
              <p className="mt-2">
                <strong>E-mail:</strong> contato@escolavalor.com.br<br />
                <strong>Assunto:</strong> "Parceria" ou "Imprensa"
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
