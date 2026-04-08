import { db } from '../db/client';
import { escolas, notas, olimpiadas, scores } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { WEIGHTS, validateWeights } from './weights';
import { normalizar } from './normalizer';

export interface ScoreComponentes {
  enem: number | null;
  ideb: number | null;
  aprovacao: number | null;
  olimpiadas: number | null;
}

export interface ScoreResult {
  escola_id: string;
  score_composto: number;
  icb: number | null;
  componentes: ScoreComponentes;
}

/**
 * Calcula o score composto de uma escola
 */
export async function calcularScore(escola_id: string): Promise<ScoreResult | null> {
  // Validar pesos no início
  validateWeights();

  // Buscar escola
  const escola = await db.query.escolas.findFirst({
    where: eq(escolas.id, escola_id),
  });

  if (!escola) {
    return null;
  }

  // Buscar notas da escola (mais recentes de cada fonte)
  const notasEscola = await db
    .select()
    .from(notas)
    .where(eq(notas.escola_id, escola_id))
    .orderBy(sql`${notas.ano_referencia} DESC, ${notas.coletado_em} DESC`);

  // Extrair componentes
  const componentes: ScoreComponentes = {
    enem: null,
    ideb: null,
    aprovacao: null,
    olimpiadas: null,
  };

  // Pegar a nota mais recente de cada fonte
  const notaEnem = notasEscola.find((n) => n.fonte === 'enem');
  const notaIdeb = notasEscola.find((n) => n.fonte === 'ideb');
  const notaAprovacao = notasEscola.find((n) => n.fonte === 'aprovacao_univ');

  if (notaEnem) {
    componentes.enem = parseFloat(notaEnem.valor_normalizado);
  }

  if (notaIdeb) {
    componentes.ideb = parseFloat(notaIdeb.valor_normalizado);
  }

  if (notaAprovacao) {
    componentes.aprovacao = parseFloat(notaAprovacao.valor_normalizado);
  }

  // Calcular score de olimpíadas (soma dos pontos, normalizado)
  const olimpiadasEscola = await db
    .select()
    .from(olimpiadas)
    .where(eq(olimpiadas.escola_id, escola_id));

  if (olimpiadasEscola.length > 0) {
    const totalPontos = olimpiadasEscola.reduce(
      (sum, o) => sum + parseFloat(o.pontos),
      0
    );

    // Buscar máximo histórico de pontos para normalização
    const maxHistorico = await db
      .select({ max: sql<number>`COALESCE(SUM(${olimpiadas.pontos}), 0)` })
      .from(olimpiadas)
      .groupBy(olimpiadas.escola_id)
      .orderBy(sql`SUM(${olimpiadas.pontos}) DESC`)
      .limit(1);

    const max = maxHistorico[0]?.max || totalPontos;

    componentes.olimpiadas = normalizar({
      fonte: 'olimpiadas',
      valor_original: totalPontos,
      escala_original: `0-${max}`,
      max_historico: max,
    });
  }

  // Calcular score composto (média ponderada dos componentes disponíveis)
  let scoreComposto = 0;
  let pesoTotal = 0;

  if (componentes.enem !== null) {
    scoreComposto += componentes.enem * WEIGHTS.enem;
    pesoTotal += WEIGHTS.enem;
  }

  if (componentes.ideb !== null) {
    scoreComposto += componentes.ideb * WEIGHTS.ideb;
    pesoTotal += WEIGHTS.ideb;
  }

  if (componentes.aprovacao !== null) {
    scoreComposto += componentes.aprovacao * WEIGHTS.aprovacao;
    pesoTotal += WEIGHTS.aprovacao;
  }

  if (componentes.olimpiadas !== null) {
    scoreComposto += componentes.olimpiadas * WEIGHTS.olimpiadas;
    pesoTotal += WEIGHTS.olimpiadas;
  }

  // Normalizar pelo peso total disponível
  if (pesoTotal > 0) {
    scoreComposto = scoreComposto / pesoTotal;
  }

  // Calcular ICB
  let icb: number | null = null;

  if (scoreComposto >= 0.1 && escola.mensalidade_anual) {
    const mensalidade = parseFloat(escola.mensalidade_anual);
    if (mensalidade > 0) {
      icb = mensalidade / scoreComposto;
    }
  }

  return {
    escola_id,
    score_composto: scoreComposto,
    icb,
    componentes,
  };
}

/**
 * Salva ou atualiza o score de uma escola no banco
 */
export async function salvarScore(result: ScoreResult): Promise<void> {
  await db
    .insert(scores)
    .values({
      escola_id: result.escola_id,
      score_composto: result.score_composto.toFixed(2),
      icb: result.icb ? result.icb.toFixed(2) : null,
      peso_enem: WEIGHTS.enem.toFixed(2),
      peso_olimpiadas: WEIGHTS.olimpiadas.toFixed(2),
      peso_aprovacao: WEIGHTS.aprovacao.toFixed(2),
      peso_ideb: WEIGHTS.ideb.toFixed(2),
    })
    .onConflictDoUpdate({
      target: scores.escola_id,
      set: {
        score_composto: result.score_composto.toFixed(2),
        icb: result.icb ? result.icb.toFixed(2) : null,
        peso_enem: WEIGHTS.enem.toFixed(2),
        peso_olimpiadas: WEIGHTS.olimpiadas.toFixed(2),
        peso_aprovacao: WEIGHTS.aprovacao.toFixed(2),
        peso_ideb: WEIGHTS.ideb.toFixed(2),
        calculado_em: new Date(),
      },
    });
}

/**
 * Recalcula todos os scores do sistema
 */
export async function recalcularTodosScores(): Promise<number> {
  const todasEscolas = await db.select({ id: escolas.id }).from(escolas);

  let count = 0;

  for (const escola of todasEscolas) {
    const result = await calcularScore(escola.id);
    if (result) {
      await salvarScore(result);
      count++;
    }
  }

  return count;
}
