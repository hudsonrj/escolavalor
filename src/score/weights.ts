/**
 * Pesos do Score Composto
 *
 * IMPORTANTE: A soma dos pesos DEVE ser sempre 1.0
 * Qualquer alteração deve ser registrada em WEIGHTS_CHANGELOG.md
 */

export const WEIGHTS = {
  enem: parseFloat(process.env.WEIGHT_ENEM || '0.35'),
  olimpiadas: parseFloat(process.env.WEIGHT_OLIMPIADAS || '0.25'),
  aprovacao: parseFloat(process.env.WEIGHT_APROVACAO || '0.25'),
  ideb: parseFloat(process.env.WEIGHT_IDEB || '0.15'),
} as const;

/**
 * Valida se a soma dos pesos é 1.0
 * @throws Error se a soma não for 1.0
 */
export function validateWeights(): void {
  const sum = Object.values(WEIGHTS).reduce((acc, w) => acc + w, 0);
  const tolerance = 0.0001; // tolerância para erros de ponto flutuante

  if (Math.abs(sum - 1.0) > tolerance) {
    throw new Error(
      `Soma dos pesos inválida: ${sum.toFixed(4)}. Deve ser 1.0. ` +
      `Verifique as variáveis de ambiente WEIGHT_* ou src/score/weights.ts`
    );
  }
}

/**
 * Retorna os pesos atuais como objeto com porcentagens
 */
export function getWeightsInfo() {
  return {
    enem: { peso: WEIGHTS.enem, porcentagem: `${(WEIGHTS.enem * 100).toFixed(0)}%` },
    olimpiadas: { peso: WEIGHTS.olimpiadas, porcentagem: `${(WEIGHTS.olimpiadas * 100).toFixed(0)}%` },
    aprovacao: { peso: WEIGHTS.aprovacao, porcentagem: `${(WEIGHTS.aprovacao * 100).toFixed(0)}%` },
    ideb: { peso: WEIGHTS.ideb, porcentagem: `${(WEIGHTS.ideb * 100).toFixed(0)}%` },
    soma: Object.values(WEIGHTS).reduce((acc, w) => acc + w, 0),
  };
}
