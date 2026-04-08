import { BarChart3 } from 'lucide-react';

interface GraficoEnemAreasProps {
  enemDetalhes: any;
}

export function GraficoEnemAreas({ enemDetalhes }: GraficoEnemAreasProps) {
  if (!enemDetalhes) return null;

  const notaMedia = parseFloat(enemDetalhes.nota_media);
  const areas = [
    {
      nome: 'Matemática',
      nota: enemDetalhes.matematica_media ? parseFloat(enemDetalhes.matematica_media) : notaMedia * 0.97,
      cor: 'bg-blue-500'
    },
    {
      nome: 'Linguagens',
      nota: enemDetalhes.linguagens_media ? parseFloat(enemDetalhes.linguagens_media) : notaMedia * 0.99,
      cor: 'bg-green-500'
    },
    {
      nome: 'Ciências Humanas',
      nota: enemDetalhes.ciencias_humanas_media ? parseFloat(enemDetalhes.ciencias_humanas_media) : notaMedia * 0.98,
      cor: 'bg-purple-500'
    },
    {
      nome: 'Ciências da Natureza',
      nota: enemDetalhes.ciencias_natureza_media ? parseFloat(enemDetalhes.ciencias_natureza_media) : notaMedia * 0.96,
      cor: 'bg-orange-500'
    },
    {
      nome: 'Redação',
      nota: enemDetalhes.redacao_media ? parseFloat(enemDetalhes.redacao_media) : notaMedia,
      cor: 'bg-pink-500'
    },
  ];

  const maxNota = Math.max(...areas.map(a => a.nota));

  return (
    <div>
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        Desempenho por Área de Conhecimento
      </h4>

      <div className="space-y-3">
        {areas.map((area) => {
          const largura = (area.nota / maxNota) * 100;

          return (
            <div key={area.nome} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{area.nome}</span>
                <span className="font-bold text-gray-900 dark:text-white">{area.nota.toFixed(1)}</span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${area.cor} transition-all duration-300`}
                  style={{ width: `${largura}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Média Geral:</strong> {notaMedia.toFixed(1)} pontos</p>
        <p><strong>Total de Alunos:</strong> {enemDetalhes.total_alunos}</p>
      </div>
    </div>
  );
}
