import { Trophy } from 'lucide-react';
import type { Olimpiada } from '../types';

interface GraficoMedalhasProps {
  olimpiadas: Olimpiada[];
}

export function GraficoMedalhas({ olimpiadas }: GraficoMedalhasProps) {
  // Agrupar por ano
  const medalhasPorAno = olimpiadas.reduce((acc, olimpiada) => {
    const ano = olimpiada.edicao;
    if (!acc[ano]) {
      acc[ano] = { ouro: 0, prata: 0, bronze: 0, mencao: 0, total: 0 };
    }
    acc[ano][olimpiada.nivel]++;
    acc[ano].total++;
    return acc;
  }, {} as Record<number, { ouro: number; prata: number; bronze: number; mencao: number; total: number }>);

  const anos = Object.keys(medalhasPorAno).sort().slice(-5); // Últimos 5 anos
  const maxTotal = Math.max(...anos.map(ano => medalhasPorAno[parseInt(ano)].total));

  const getMedalColor = (nivel: string) => {
    const colors = {
      ouro: 'bg-yellow-400',
      prata: 'bg-gray-400',
      bronze: 'bg-orange-600',
      mencao: 'bg-blue-500',
    };
    return colors[nivel as keyof typeof colors] || 'bg-gray-400';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-600" />
        Medalhas em Olimpíadas - Últimos 5 Anos ({olimpiadas.length} total)
      </h3>

      {/* Gráfico de barras empilhadas */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-end justify-between gap-4 h-64">
          {anos.map((ano) => {
            const dados = medalhasPorAno[parseInt(ano)];
            const altura = (dados.total / maxTotal) * 100;

            return (
              <div key={ano} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '200px' }}>
                  {/* Ouro */}
                  {dados.ouro > 0 && (
                    <div
                      className="bg-yellow-400 rounded-t transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${(dados.ouro / dados.total) * altura}%` }}
                      title={`${dados.ouro} medalha(s) de ouro`}
                    />
                  )}
                  {/* Prata */}
                  {dados.prata > 0 && (
                    <div
                      className="bg-gray-400 transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${(dados.prata / dados.total) * altura}%` }}
                      title={`${dados.prata} medalha(s) de prata`}
                    />
                  )}
                  {/* Bronze */}
                  {dados.bronze > 0 && (
                    <div
                      className="bg-orange-600 transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${(dados.bronze / dados.total) * altura}%` }}
                      title={`${dados.bronze} medalha(s) de bronze`}
                    />
                  )}
                  {/* Menção */}
                  {dados.mencao > 0 && (
                    <div
                      className="bg-blue-500 rounded-b transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${(dados.mencao / dados.total) * altura}%` }}
                      title={`${dados.mencao} menção(ões) honrosa(s)`}
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{dados.total}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{ano}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Ouro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Prata</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-600 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Bronze</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Menção</span>
          </div>
        </div>
      </div>
    </div>
  );
}
