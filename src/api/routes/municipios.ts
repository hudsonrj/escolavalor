/**
 * Rota de municípios (mapa de calor de ICB)
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { escolas, scores } from '../../db/schema';
import { eq, sql, and, isNotNull } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const municipiosRouter = new Hono();

/**
 * GET /municipios/:uf
 * ICB médio por município (para mapa de calor)
 */
municipiosRouter.get('/:uf', async (c) => {
  try {
    const uf = c.req.param('uf').toUpperCase();

    if (uf.length !== 2) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'UF deve ter 2 caracteres',
          },
        },
        400
      );
    }

    // Agregar ICB médio por município
    const municipios = await db
      .select({
        municipio: escolas.municipio,
        uf: escolas.uf,
        total_escolas: sql<number>`count(distinct ${escolas.id})`,
        icb_medio: sql<number>`avg(${scores.icb})`,
        icb_min: sql<number>`min(${scores.icb})`,
        icb_max: sql<number>`max(${scores.icb})`,
        score_medio: sql<number>`avg(${scores.score_composto})`,
      })
      .from(escolas)
      .innerJoin(scores, eq(escolas.id, scores.escola_id))
      .where(and(eq(escolas.uf, uf), isNotNull(scores.icb)))
      .groupBy(escolas.municipio, escolas.uf)
      .orderBy(sql`avg(${scores.icb})`);

    logger.info('api', 'Municípios por UF', {
      uf,
      total: municipios.length,
    });

    return c.json({
      data: municipios.map((m) => ({
        municipio: m.municipio,
        uf: m.uf,
        total_escolas: Number(m.total_escolas),
        icb_medio: m.icb_medio ? Number(m.icb_medio).toFixed(2) : null,
        icb_min: m.icb_min ? Number(m.icb_min).toFixed(2) : null,
        icb_max: m.icb_max ? Number(m.icb_max).toFixed(2) : null,
        score_medio: m.score_medio ? Number(m.score_medio).toFixed(2) : null,
      })),
      meta: {
        uf,
        total_municipios: municipios.length,
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao buscar municípios', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar municípios',
        },
      },
      500
    );
  }
});

/**
 * GET /municipios
 * Lista todos os municípios com dados
 */
municipiosRouter.get('/', async (c) => {
  try {
    const municipios = await db
      .select({
        municipio: escolas.municipio,
        uf: escolas.uf,
        total_escolas: sql<number>`count(distinct ${escolas.id})`,
      })
      .from(escolas)
      .groupBy(escolas.municipio, escolas.uf)
      .orderBy(escolas.uf, escolas.municipio);

    logger.info('api', 'Lista de municípios', {
      total: municipios.length,
    });

    return c.json({
      data: municipios.map((m) => ({
        municipio: m.municipio,
        uf: m.uf,
        total_escolas: Number(m.total_escolas),
      })),
      meta: {
        total: municipios.length,
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao listar municípios', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao listar municípios',
        },
      },
      500
    );
  }
});

export default municipiosRouter;
