import { useState } from 'react';
import { GraduationCap, Brain, Heart, Cpu, Sparkles, Gift, Menu, X, Info, Phone, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      {/* Decorative gradient line */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Logo */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 md:p-3.5 rounded-xl md:rounded-2xl shadow-lg hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5 md:h-7 md:w-7 text-white" />
            </div>

            {/* Brand */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 md:gap-2">
                <h1 className="text-lg md:text-3xl font-black font-display text-gray-900">
                  EscolaValor
                </h1>
                <div className="hidden sm:flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
                  <Cpu className="h-2.5 w-2.5 md:h-3 md:w-3 text-blue-700" />
                  <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-purple-700" />
                  <span className="text-[9px] md:text-[10px] font-black text-blue-900 uppercase">IA</span>
                </div>
              </div>

              {/* Tags - Hidden on small mobile */}
              <div className="hidden sm:flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                <div className="flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 bg-purple-100 rounded-full border border-purple-200">
                  <Brain className="h-2.5 w-2.5 md:h-3 md:w-3 text-purple-700" />
                  <span className="text-[9px] md:text-[10px] font-bold text-purple-900">Psicologia</span>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 bg-pink-100 rounded-full border border-pink-200">
                  <Heart className="h-2.5 w-2.5 md:h-3 md:w-3 text-pink-700" />
                  <span className="text-[9px] md:text-[10px] font-bold text-pink-900">Inclusão</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Free Badge */}
          <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border-2 border-green-300 shadow-lg animate-bounce-gentle">
            <Gift className="h-5 w-5 text-green-700" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-green-900 uppercase tracking-wider">100% Grátis</span>
              <span className="text-[10px] font-bold text-green-700">Sempre!</span>
            </div>
          </div>

          {/* Mobile: Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-900" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* Free Badge - Mobile */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300 mb-4">
              <Gift className="h-5 w-5 text-green-700" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-green-900 uppercase tracking-wider">100% Grátis</span>
                <span className="text-[10px] font-bold text-green-700">Sempre!</span>
              </div>
            </div>

            {/* Menu Links */}
            <Link
              to="/sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Sobre Nós</p>
                <p className="text-xs text-gray-500">Conheça o EscolaValor</p>
              </div>
            </Link>

            <Link
              to="/contato"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="bg-purple-100 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Contato</p>
                <p className="text-xs text-gray-500">Entre em contato conosco</p>
              </div>
            </Link>

            <Link
              to="/termos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="bg-green-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Termos de Uso</p>
                <p className="text-xs text-gray-500">Nossos termos e políticas</p>
              </div>
            </Link>

            <Link
              to="/privacidade"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="bg-pink-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Privacidade</p>
                <p className="text-xs text-gray-500">Política de privacidade</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
