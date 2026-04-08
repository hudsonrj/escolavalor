/**
 * Rota de ranking de escolas por ICB
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { escolas, scores } from '../../db/schema';
import { eq, and, isNotNull, asc, desc, sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const rankingRouter = new Hono();

/**
 * GET /ranking
 * Top escolas por ICB (menor = melhor custo-benefício)
 */
rankingRouter.get('/', async (c) => {
  try {
    const uf = c.req.query('uf');
    const tipo = c.req.query('tipo');
    const municipio = c.req.query('municipio');
    const redeEnsino = c.req.query('rede_ensino');
    const limit = parseInt(c.req.query('limit') || '50');

    // Construir filtros
    const conditions = [];

    if (uf) {
      conditions.push(eq(escolas.uf, uf));
    }

    if (tipo) {
      conditions.push(eq(escolas.tipo, tipo as any));
    }

    if (municipio) {
      conditions.push(eq(escolas.municipio, municipio));
    }

    if (redeEnsino) {
      conditions.push(eq(escolas.rede_ensino, redeEnsino as any));
    }

    const results = await db
      .select({
        id: escolas.id,
        nome: escolas.nome,
        tipo: escolas.tipo,
        uf: escolas.uf,
        municipio: escolas.municipio,
        bairro: escolas.bairro,
        mensalidade_anual: escolas.mensalidade_anual,
        rede_ensino: escolas.rede_ensino,
        lat: escolas.lat,
        lng: escolas.lng,
        score_composto: scores.score_composto,
        icb: scores.icb,
      })
      .from(escolas)
      .innerJoin(scores, eq(escolas.id, scores.escola_id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        // Ordena primeiro por ICB (quando existe), depois por score decrescente
        sql`CASE WHEN ${scores.icb} IS NULL THEN 1 ELSE 0 END`,
        asc(scores.icb),
        desc(scores.score_composto)
      )
      .limit(limit);

    logger.info('api', 'Ranking de escolas', {
      filters: { uf, tipo, municipio, rede_ensino: redeEnsino },
      limit,
      results: results.length,
    });

    return c.json({
      data: results.map((escola, index) => ({
        posicao: index + 1,
        ...escola,
      })),
      meta: {
        total: results.length,
        limit,
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao buscar ranking', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar ranking',
        },
      },
      500
    );
  }
});

export default rankingRouter;
