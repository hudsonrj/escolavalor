/**
 * Rotas de filtros dinâmicos (UFs, municípios, etc)
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { escolas } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const filtrosRouter = new Hono();

/**
 * GET /filtros/municipios
 * Lista municípios disponíveis (opcionalmente filtrados por UF)
 */
filtrosRouter.get('/municipios', async (c) => {
  try {
    const uf = c.req.query('uf');

    const query = db
      .selectDistinct({ municipio: escolas.municipio, uf: escolas.uf })
      .from(escolas)
      .orderBy(escolas.municipio);

    const results = uf
      ? await query.where(eq(escolas.uf, uf))
      : await query;

    logger.info('api', 'Lista de municípios', {
      uf,
      total: results.length,
    });

    return c.json({
      data: results,
      meta: {
        total: results.length,
        uf,
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
 * GET /filtros/ufs
 * Lista UFs disponíveis
 */
filtrosRouter.get('/ufs', async (c) => {
  try {
    const results = await db
      .selectDistinct({ uf: escolas.uf })
      .from(escolas)
      .orderBy(escolas.uf);

    logger.info('api', 'Lista de UFs', {
      total: results.length,
    });

    return c.json({
      data: results.map(r => r.uf),
      meta: {
        total: results.length,
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao buscar UFs', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar UFs',
        },
      },
      500
    );
  }
});

export default filtrosRouter;
