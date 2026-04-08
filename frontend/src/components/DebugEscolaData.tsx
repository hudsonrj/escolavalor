import type { EscolaDetalhada } from '../types';

interface DebugEscolaDataProps {
  escola: EscolaDetalhada;
}

export function DebugEscolaData({ escola }: DebugEscolaDataProps) {
  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-md z-50 text-xs">
      <h3 className="font-bold mb-2 text-yellow-800">DEBUG - Dados da Escola</h3>
      <pre className="text-gray-800 whitespace-pre-wrap">
        {JSON.stringify({
          nome: escola.nome,
          enemDetalhes_count: escola.enemDetalhes?.length || 0,
          enemDetalhes_anos: escola.enemDetalhes?.map(e => e.ano_referencia) || [],
          aprovacoesUniversitarias_count: escola.aprovacoesUniversitarias?.length || 0,
          olimpiadas_count: escola.olimpiadas?.length || 0,
          reclamacoes_count: escola.reclamacoes?.length || 0,
          tem_matematica: escola.enemDetalhes?.[0]?.matematica_media ? 'SIM' : 'NAO',
          primeira_nota: escola.enemDetalhes?.[0]?.nota_media || 'N/A'
        }, null, 2)}
      </pre>
    </div>
  );
}
