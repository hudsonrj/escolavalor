/**
 * Rota de comparação de escolas
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { escolas, scores } from '../../db/schema';
import { inArray, eq } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { z } from 'zod';

const compararRouter = new Hono();

const CompararSchema = z.object({
  ids: z.array(z.string().uuid()).min(2).max(4),
});

/**
 * POST /comparar
 * Compara até 4 escolas lado a lado
 */
compararRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validation = CompararSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'IDs inválidos. Envie entre 2 e 4 UUIDs válidos',
            details: validation.error.errors,
          },
        },
        400
      );
    }

    const { ids } = validation.data;

    const results = await db
      .select({
        id: escolas.id,
        nome: escolas.nome,
        tipo: escolas.tipo,
        uf: escolas.uf,
        municipio: escolas.municipio,
        mensalidade_anual: escolas.mensalidade_anual,
        score_composto: scores.score_composto,
        icb: scores.icb,
        peso_enem: scores.peso_enem,
        peso_olimpiadas: scores.peso_olimpiadas,
        peso_aprovacao: scores.peso_aprovacao,
        peso_ideb: scores.peso_ideb,
      })
      .from(escolas)
      .leftJoin(scores, eq(escolas.id, scores.escola_id))
      .where(inArray(escolas.id, ids));

    if (results.length !== ids.length) {
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Uma ou mais escolas não foram encontradas',
          },
        },
        404
      );
    }

    logger.info('api', 'Comparação de escolas', {
      ids,
      count: results.length,
    });

    return c.json({
      data: results,
      meta: {
        count: results.length,
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao comparar escolas', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao comparar escolas',
        },
      },
      500
    );
  }
});

export default compararRouter;
