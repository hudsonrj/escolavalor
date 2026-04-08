import { MapPin, TrendingDown } from 'lucide-react';
import type { Escola } from '../types';
import {
  formatCurrency,
  formatScore,
  formatICB,
  getTipoBadgeColor,
  getTipoLabel,
  getScoreColor,
  getICBRating
} from '../lib/utils';
import { cn } from '../lib/utils';

interface EscolaCardProps {
  escola: Escola;
  onClick?: () => void;
  rank?: number;
}

export function EscolaCard({ escola, onClick, rank }: EscolaCardProps) {
  const score = escola.score_composto ? parseFloat(escola.score_composto) : 0;
  const icb = escola.icb ? parseFloat(escola.icb) : null;
  const icbRating = icb ? getICBRating(icb) : null;

  return (
    <div
      onClick={onClick}
      className="group relative p-6 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>

      {/* Content wrapper */}
      <div className="relative">
        {rank && (
          <div className="absolute -top-9 -left-9 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-xl text-lg">
            {rank}
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {escola.nome}
            </h3>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 font-medium">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>{escola.municipio}, {escola.uf}</span>
            </div>

            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
              {getTipoLabel(escola.tipo)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-gray-100">
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1 font-bold uppercase tracking-wide">
              Score
            </p>
            <p className="text-3xl font-black text-gray-900">
              {formatScore(escola.score_composto)}
            </p>
          </div>

          <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs text-gray-600 mb-1 font-bold uppercase tracking-wide">
              Mensalidade/ano
            </p>
            <p className="text-lg font-black text-gray-900">
              {formatCurrency(escola.mensalidade_anual)}
            </p>
          </div>
        </div>

        {icb && icbRating && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-bold text-gray-900">
                  ICB: {formatICB(escola.icb)}
                </span>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                {icbRating.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
