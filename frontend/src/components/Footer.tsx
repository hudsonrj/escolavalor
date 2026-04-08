import { Link } from 'react-router-dom';
import { Mail, Shield, FileText, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-blue-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              EscolaValor
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Plataforma inteligente para encontrar a escola ideal com análise de custo-benefício,
              inclusão e dados oficiais.
            </p>
          </div>

          {/* Links Legais */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacidade" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-gray-300 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <a
                  href="/ads.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  ads.txt
                </a>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Institucional
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/sobre" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-gray-300 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contato
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>contato@escolavalor.com.br</li>
              <li>privacidade@escolavalor.com.br</li>
              <li className="pt-2">
                <a
                  href="https://escolavalor.com.br"
                  className="hover:text-white transition-colors"
                >
                  escolavalor.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            © {new Date().getFullYear()} EscolaValor. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs">
            Dados baseados em fontes públicas oficiais (MEC, INEP, ENEM, IDEB)
          </p>
        </div>
      </div>
    </footer>
  );
}
