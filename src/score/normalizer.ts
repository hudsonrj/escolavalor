/**
 * Normalização de valores de fontes diferentes para escala 0-10
 */

export type FonteOrigem = 'enem' | 'ideb' | 'aprovacao_univ' | 'olimpiadas';

export interface NormalizacaoConfig {
  fonte: FonteOrigem;
  valor_original: number;
  escala_original: string;
  max_historico?: number; // para olimpíadas
}

/**
 * Normaliza um valor de qualquer fonte para escala 0-10
 */
export function normalizar(config: NormalizacaoConfig): number {
  const { fonte, valor_original, max_historico } = config;

  // Validação básica
  if (valor_original < 0) {
    throw new Error(`Valor original não pode ser negativo: ${valor_original}`);
  }

  let normalizado: number;

  switch (fonte) {
    case 'enem':
      // ENEM: 0-1000 → 0-10
      normalizado = valor_original / 100;
      break;

    case 'ideb':
      // IDEB: 0-10 → 0-10 (direto)
      normalizado = valor_original;
      break;

    case 'aprovacao_univ':
      // Aprovação: 0-100% → 0-10
      normalizado = valor_original / 10;
      break;

    case 'olimpiadas':
      // Olimpíadas: escalar pelo máximo histórico do dataset
      if (!max_historico || max_historico === 0) {
        throw new Error('max_historico obrigatório e deve ser > 0 para olimpíadas');
      }
      normalizado = (valor_original / max_historico) * 10;
      break;

    default:
      throw new Error(`Fonte desconhecida: ${fonte}`);
  }

  // Garantir que o valor normalizado esteja entre 0 e 10
  return Math.max(0, Math.min(10, normalizado));
}

/**
 * Calcula pontos de olimpíada com base no nível da medalha
 */
export function calcularPontosOlimpiada(nivel: 'ouro' | 'prata' | 'bronze' | 'mencao'): number {
  const pontos = {
    ouro: 3.0,
    prata: 2.0,
    bronze: 1.0,
    mencao: 0.5,
  };

  return pontos[nivel];
}

/**
 * Valida se um valor normalizado está na faixa correta
 */
export function validarNormalizado(valor: number): boolean {
  return valor >= 0 && valor <= 10;
}
