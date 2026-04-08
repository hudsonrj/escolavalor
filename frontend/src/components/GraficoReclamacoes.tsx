import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import type { Reclamacao } from '../types';

interface GraficoReclamacoesProps {
  reclamacoes: Reclamacao[];
}

export function GraficoReclamacoes({ reclamacoes }: GraficoReclamacoesProps) {
  if (!reclamacoes || reclamacoes.length === 0) {
    return null;
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'mensalidade': 'Mensalidade',
      'professores': 'Professores',
      'infraestrutura': 'Infraestrutura',
      'comunicacao': 'Comunicação',
      'atendimento': 'Atendimento',
      'ensino': 'Ensino',
      'transporte': 'Transporte',
      'alimentacao': 'Alimentação',
      'seguranca': 'Segurança',
      'outros': 'Outros',
    };
    return labels[tipo] || tipo;
  };

  // Agrupar por tipo
  const reclamacoesPorTipo = reclamacoes.reduce((acc, recl) => {
    if (!acc[recl.tipo]) {
      acc[recl.tipo] = [];
    }
    acc[recl.tipo].push(recl);
    return acc;
  }, {} as Record<string, Reclamacao[]>);

  // Ordenar por quantidade total (decrescente)
  const tiposOrdenados = Object.entries(reclamacoesPorTipo)
    .map(([tipo, recls]) => ({
      tipo,
      total: recls.reduce((sum, r) => sum + r.quantidade, 0),
      reclamacoes: recls,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Top 5 tipos

  const maxTotal = Math.max(...tiposOrdenados.map(t => t.total));

  // Calcular tendência (últimos 3 meses vs 3 meses anteriores)
  const calcularTendencia = (recls: Reclamacao[]) => {
    const ordenadas = recls.sort((a, b) => {
      const dateA = new Date(a.ano_referencia, a.mes_referencia - 1);
      const dateB = new Date(b.ano_referencia, b.mes_referencia - 1);
      return dateB.getTime() - dateA.getTime();
    });

    const ultimos3 = ordenadas.slice(0, 3).reduce((sum, r) => sum + r.quantidade, 0);
    const anteriores3 = ordenadas.slice(3, 6).reduce((sum, r) => sum + r.quantidade, 0);

    if (anteriores3 === 0) return 0;
    return ((ultimos3 - anteriores3) / anteriores3) * 100;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        Principais Reclamações - Últimos 12 Meses
      </h3>

      <div className="space-y-4">
        {tiposOrdenados.map(({ tipo, total, reclamacoes: recls }) => {
          const tendencia = calcularTendencia(recls);
          const largura = (total / maxTotal) * 100;

          return (
            <div key={tipo} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getTipoLabel(tipo)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Tendência */}
                  <div className="flex items-center gap-1 text-sm">
                    {tendencia > 10 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-semibold">+{tendencia.toFixed(0)}%</span>
                      </>
                    ) : tendencia < -10 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-semibold">{tendencia.toFixed(0)}%</span>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 font-semibold">Estável</span>
                    )}
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{total}</span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-300"
                  style={{ width: `${largura}%` }}
                />
              </div>

              {/* Timeline de reclamações */}
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Ver histórico mensal
                </summary>
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {recls
                    .sort((a, b) => {
                      const dateA = new Date(a.ano_referencia, a.mes_referencia - 1);
                      const dateB = new Date(b.ano_referencia, b.mes_referencia - 1);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .slice(0, 12)
                    .map((recl, idx) => (
                      <div key={idx} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{recl.quantidade}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {recl.mes_referencia}/{recl.ano_referencia}
                        </p>
                      </div>
                    ))}
                </div>
              </details>
            </div>
          );
        })}
      </div>

      {tiposOrdenados.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhuma reclamação registrada nos últimos 12 meses
        </div>
      )}
    </div>
  );
}
