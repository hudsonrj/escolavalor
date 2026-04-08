/**
 * Rota de histórico de ICB
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { escolas, historico } from '../../db/schema';
import { eq, desc, gte } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const historicoRouter = new Hono();

/**
 * GET /historico/:id
 * Série histórica de ICB de uma escola
 */
historicoRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const anos = parseInt(c.req.query('anos') || '5');

    // Buscar escola
    const escola = await db.query.escolas.findFirst({
      where: eq(escolas.id, id),
    });

    if (!escola) {
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Escola não encontrada',
          },
        },
        404
      );
    }

    // Buscar histórico
    const anoAtual = new Date().getFullYear();
    const anoInicio = anoAtual - anos;

    const historicoData = await db
      .select()
      .from(historico)
      .where(
        eq(historico.escola_id, id)
      )
      .where(gte(historico.referencia_ano, anoInicio))
      .orderBy(desc(historico.referencia_ano));

    logger.info('api', 'Histórico de escola', {
      id,
      nome: escola.nome,
      anos,
      registros: historicoData.length,
    });

    return c.json({
      data: {
        escola: {
          id: escola.id,
          nome: escola.nome,
          tipo: escola.tipo,
          uf: escola.uf,
          municipio: escola.municipio,
        },
        historico: historicoData,
      },
      meta: {
        anos,
        registros: historicoData.length,
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao buscar histórico', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar histórico',
        },
      },
      500
    );
  }
});

export default historicoRouter;
