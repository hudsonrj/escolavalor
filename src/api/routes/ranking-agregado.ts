/**
 * Rotas de ranking agregado por UF e município
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { escolas, scores } from '../../db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const rankingAgregadoRouter = new Hono();

/**
 * GET /ranking-agregado/por-uf
 * Ranking agregado por UF com média, máximo e mínimo + detalhes das escolas
 */
rankingAgregadoRouter.get('/por-uf', async (c) => {
  try {
    const results = await db
      .select({
        uf: escolas.uf,
        total_escolas: sql<number>`COUNT(DISTINCT ${escolas.id})`,
        score_medio: sql<string>`ROUND(AVG(${scores.score_composto}), 2)`,
        score_maximo: sql<string>`MAX(${scores.score_composto})`,
        score_minimo: sql<string>`MIN(${scores.score_composto})`,
        icb_medio: sql<string>`ROUND(AVG(${scores.icb}), 2)`,
        icb_minimo: sql<string>`MIN(${scores.icb})`,
      })
      .from(escolas)
      .innerJoin(scores, eq(escolas.id, scores.escola_id))
      .where(and(isNotNull(scores.score_composto), sql`${scores.score_composto} > 0`))
      .groupBy(escolas.uf)
      .orderBy(sql`AVG(${scores.score_composto}) DESC`);

    // Para cada UF, buscar escola com score máximo e mínimo
    const enrichedResults = await Promise.all(
      results.map(async (item) => {
        // Escola com score máximo
        const [escolaMax] = await db
          .select({
            id: escolas.id,
            nome: escolas.nome,
            municipio: escolas.municipio,
            score: scores.score_composto,
          })
          .from(escolas)
          .innerJoin(scores, eq(escolas.id, scores.escola_id))
          .where(and(eq(escolas.uf, item.uf), isNotNull(scores.score_composto)))
          .orderBy(sql`${scores.score_composto} DESC`)
          .limit(1);

        // Escola com score mínimo
        const [escolaMin] = await db
          .select({
            id: escolas.id,
            nome: escolas.nome,
            municipio: escolas.municipio,
            score: scores.score_composto,
          })
          .from(escolas)
          .innerJoin(scores, eq(escolas.id, scores.escola_id))
          .where(and(eq(escolas.uf, item.uf), isNotNull(scores.score_composto)))
          .orderBy(sql`${scores.score_composto} ASC`)
          .limit(1);

        return {
          ...item,
          escola_max: escolaMax,
          escola_min: escolaMin,
        };
      })
    );

    logger.info('api', 'Ranking agregado por UF', {
      total_ufs: enrichedResults.length,
    });

    return c.json({
      data: enrichedResults.map((item, index) => ({
        posicao: index + 1,
        ...item,
      })),
      meta: {
        total: enrichedResults.length,
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao buscar ranking por UF', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar ranking por UF',
        },
      },
      500
    );
  }
});

/**
 * GET /ranking-agregado/por-municipio
 * Ranking agregado por município com média, máximo e mínimo + detalhes das escolas
 */
rankingAgregadoRouter.get('/por-municipio', async (c) => {
  try {
    const uf = c.req.query('uf');
    const minEscolas = parseInt(c.req.query('min_escolas') || '1');

    const conditions = [isNotNull(scores.score_composto), sql`${scores.score_composto} > 0`];

    if (uf) {
      conditions.push(eq(escolas.uf, uf));
    }

    const results = await db
      .select({
        municipio: escolas.municipio,
        uf: escolas.uf,
        total_escolas: sql<number>`COUNT(DISTINCT ${escolas.id})`,
        score_medio: sql<string>`ROUND(AVG(${scores.score_composto}), 2)`,
        score_maximo: sql<string>`MAX(${scores.score_composto})`,
        score_minimo: sql<string>`MIN(${scores.score_composto})`,
        icb_medio: sql<string>`ROUND(AVG(${scores.icb}), 2)`,
        icb_minimo: sql<string>`MIN(${scores.icb})`,
      })
      .from(escolas)
      .innerJoin(scores, eq(escolas.id, scores.escola_id))
      .where(and(...conditions))
      .groupBy(escolas.municipio, escolas.uf)
      .having(sql`COUNT(DISTINCT ${escolas.id}) >= ${minEscolas}`)
      .orderBy(sql`AVG(${scores.score_composto}) DESC`);

    // Para cada município, buscar escola com score máximo e mínimo
    const enrichedResults = await Promise.all(
      results.map(async (item) => {
        // Escola com score máximo
        const [escolaMax] = await db
          .select({
            id: escolas.id,
            nome: escolas.nome,
            tipo: escolas.tipo,
            score: scores.score_composto,
          })
          .from(escolas)
          .innerJoin(scores, eq(escolas.id, scores.escola_id))
          .where(
            and(
              eq(escolas.municipio, item.municipio),
              eq(escolas.uf, item.uf),
              isNotNull(scores.score_composto),
              sql`${scores.score_composto} > 0`
            )
          )
          .orderBy(sql`${scores.score_composto} DESC`)
          .limit(1);

        // Escola com score mínimo
        const [escolaMin] = await db
          .select({
            id: escolas.id,
            nome: escolas.nome,
            tipo: escolas.tipo,
            score: scores.score_composto,
          })
          .from(escolas)
          .innerJoin(scores, eq(escolas.id, scores.escola_id))
          .where(
            and(
              eq(escolas.municipio, item.municipio),
              eq(escolas.uf, item.uf),
              isNotNull(scores.score_composto),
              sql`${scores.score_composto} > 0`
            )
          )
          .orderBy(sql`${scores.score_composto} ASC`)
          .limit(1);

        return {
          ...item,
          escola_max: escolaMax,
          escola_min: escolaMin,
        };
      })
    );

    logger.info('api', 'Ranking agregado por município', {
      filters: { uf, min_escolas: minEscolas },
      total_municipios: enrichedResults.length,
    });

    return c.json({
      data: enrichedResults.map((item, index) => ({
        posicao: index + 1,
        ...item,
      })),
      meta: {
        total: enrichedResults.length,
        filters: { uf, min_escolas: minEscolas },
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao buscar ranking por município', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar ranking por município',
        },
      },
      500
    );
  }
});

/**
 * GET /ranking-agregado/por-bairro/:municipio/:uf
 * Ranking agregado por bairro dentro de um município
 */
rankingAgregadoRouter.get('/por-bairro/:municipio/:uf', async (c) => {
  try {
    const municipio = c.req.param('municipio');
    const uf = c.req.param('uf');
    const minEscolas = parseInt(c.req.query('min_escolas') || '1');

    const results = await db
      .select({
        bairro: escolas.bairro,
        municipio: escolas.municipio,
        uf: escolas.uf,
        total_escolas: sql<number>`COUNT(DISTINCT ${escolas.id})`,
        score_medio: sql<string>`ROUND(AVG(${scores.score_composto}), 2)`,
        score_maximo: sql<string>`MAX(${scores.score_composto})`,
        score_minimo: sql<string>`MIN(${scores.score_composto})`,
        icb_medio: sql<string>`ROUND(AVG(${scores.icb}), 2)`,
        icb_minimo: sql<string>`MIN(${scores.icb})`,
      })
      .from(escolas)
      .innerJoin(scores, eq(escolas.id, scores.escola_id))
      .where(
        and(
          eq(escolas.municipio, municipio),
          eq(escolas.uf, uf),
          isNotNull(scores.score_composto),
          sql`${scores.score_composto} > 0`
        )
      )
      .groupBy(escolas.bairro, escolas.municipio, escolas.uf)
      .having(sql`COUNT(DISTINCT ${escolas.id}) >= ${minEscolas}`)
      .orderBy(sql`AVG(${scores.score_composto}) DESC`);

    logger.info('api', 'Ranking agregado por bairro', {
      municipio,
      uf,
      min_escolas: minEscolas,
      total_bairros: results.length,
    });

    return c.json({
      data: results.map((item, index) => ({
        posicao: index + 1,
        ...item,
      })),
      meta: {
        total: results.length,
        filters: { municipio, uf, min_escolas: minEscolas },
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao buscar ranking por bairro', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar ranking por bairro',
        },
      },
      500
    );
  }
});

export default rankingAgregadoRouter;
