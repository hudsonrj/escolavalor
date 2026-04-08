import { TrendingUp, GraduationCap } from 'lucide-react';
import type { AprovacaoUniversitaria } from '../types';

interface GraficoAprovacoes5AnosProps {
  aprovacoes: AprovacaoUniversitaria[];
}

export function GraficoAprovacoes5Anos({ aprovacoes }: GraficoAprovacoes5AnosProps) {
  if (!aprovacoes || aprovacoes.length === 0) return null;

  // Agrupar por ano
  const aprovacoesPorAno = aprovacoes.reduce((acc, aprov) => {
    if (!acc[aprov.ano_referencia]) {
      acc[aprov.ano_referencia] = {
        total: 0,
        universidades: new Set(),
      };
    }
    acc[aprov.ano_referencia].total += aprov.quantidade;
    acc[aprov.ano_referencia].universidades.add(aprov.universidade);
    return acc;
  }, {} as Record<number, { total: number; universidades: Set<string> }>);

  // Ordenar anos (mais recente primeiro) e limitar a 5
  const anosOrdenados = Object.entries(aprovacoesPorAno)
    .map(([ano, dados]) => ({
      ano: parseInt(ano),
      total: dados.total,
      universidades: dados.universidades.size,
    }))
    .sort((a, b) => b.ano - a.ano)
    .slice(0, 5);

  const maxTotal = Math.max(...anosOrdenados.map(a => a.total));

  // Calcular tendência
  const totalRecente = anosOrdenados[0]?.total || 0;
  const totalAntigo = anosOrdenados[anosOrdenados.length - 1]?.total || 0;
  const tendencia = totalAntigo > 0 ? ((totalRecente - totalAntigo) / totalAntigo) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-green-600" />
          Evolução de Aprovações - Últimos {anosOrdenados.length} Anos
        </h4>
        {tendencia !== 0 && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className={`h-4 w-4 ${tendencia > 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`font-semibold ${tendencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {tendencia > 0 ? '+' : ''}{tendencia.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {anosOrdenados.map((item) => {
          const largura = (item.total / maxTotal) * 100;

          return (
            <div key={item.ano} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 dark:text-gray-300 w-12">
                    {item.ano}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    {item.universidades} universidades
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  {item.total} alunos
                </span>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${largura}%` }}
                >
                  {largura > 30 && (
                    <span className="text-xs font-semibold text-white">
                      {item.total}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estatísticas totais */}
      <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-lg border border-green-200 dark:border-green-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {anosOrdenados.reduce((sum, item) => sum + item.total, 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Total de Aprovações ({anosOrdenados.length} anos)
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {Math.round(anosOrdenados.reduce((sum, item) => sum + item.total, 0) / anosOrdenados.length)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Média por Ano
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
