/**
 * Rotas de escolas
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { escolas, scores, notas, olimpiadas, aprovacoesUniversitarias, enemDetalhes, concursosMilitares, informacoesEscola, avaliacoesExternas, reclamacoes } from '../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const escolasRouter = new Hono();

/**
 * GET /escolas
 * Lista paginada de escolas com filtros
 */
escolasRouter.get('/', async (c) => {
  try {
    const uf = c.req.query('uf');
    const tipo = c.req.query('tipo');
    const municipio = c.req.query('municipio');
    const icbMin = c.req.query('icb_min');
    const icbMax = c.req.query('icb_max');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

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

    // Query base
    let query = db
      .select({
        id: escolas.id,
        cnpj: escolas.cnpj,
        nome: escolas.nome,
        tipo: escolas.tipo,
        uf: escolas.uf,
        municipio: escolas.municipio,
        mensalidade_anual: escolas.mensalidade_anual,
        score_composto: scores.score_composto,
        icb: scores.icb,
      })
      .from(escolas)
      .leftJoin(scores, eq(escolas.id, scores.escola_id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Filtros de ICB (aplicar após join)
    if (icbMin) {
      query = query.where(gte(scores.icb, icbMin));
    }

    if (icbMax) {
      query = query.where(lte(scores.icb, icbMax));
    }

    const results = await query;

    // Contar total para paginação
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(escolas)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    logger.info('api', 'Lista de escolas', {
      filters: { uf, tipo, municipio, icbMin, icbMax },
      page,
      limit,
      results: results.length,
    });

    return c.json({
      data: results,
      meta: {
        total,
        page,
        limit,
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao listar escolas', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao listar escolas',
        },
      },
      500
    );
  }
});

/**
 * GET /escolas/:id
 * Detalhes de uma escola específica
 */
escolasRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const escola = await db.query.escolas.findFirst({
      where: eq(escolas.id, id),
      with: {
        score: true,
        notas: {
          orderBy: (notas, { desc }) => [desc(notas.ano_referencia)],
          limit: 10,
        },
        olimpiadas: {
          orderBy: (olimpiadas, { desc }) => [desc(olimpiadas.edicao)],
          limit: 50,
        },
        aprovacoesUniversitarias: {
          orderBy: (aprovacoes, { desc }) => [desc(aprovacoes.ano_referencia), desc(aprovacoes.quantidade)],
          limit: 500, // Aumentar limite para 5 anos de dados
        },
        enemDetalhes: {
          orderBy: (enem, { desc }) => [desc(enem.ano_referencia)],
          limit: 5,
        },
        concursosMilitares: {
          orderBy: (concursos, { desc }) => [desc(concursos.ano_referencia)],
          limit: 20,
        },
        informacoes: true,
        avaliacoesExternas: {
          orderBy: (avaliacoes, { desc }) => [desc(avaliacoes.ano_referencia), desc(avaliacoes.mes_referencia)],
          limit: 100,
        },
        reclamacoes: {
          orderBy: (recl, { desc }) => [desc(recl.ano_referencia), desc(recl.mes_referencia)],
          limit: 100,
        },
      },
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

    logger.info('api', 'Detalhes de escola', { id, nome: escola.nome });

    return c.json({
      data: escola,
      meta: {
        calculado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('api', 'Erro ao buscar escola', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar escola',
        },
      },
      500
    );
  }
});

export default escolasRouter;
