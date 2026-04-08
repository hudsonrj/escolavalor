/**
 * Rotas de chat inteligente com Groq + RAG
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { logger } from '../../utils/logger';
import { chatCompletion, type ChatMessage } from '../../services/groq-chat';
import {
  buscarEscolasRelevantes,
  buscarEscolasInclusivas,
  extrairCriteriosDaMensagem,
} from '../../services/rag-service';
import { sql } from 'drizzle-orm';

const chatRouter = new Hono();

/**
 * POST /chat/message
 * Enviar mensagem e receber resposta do assistente
 */
chatRouter.post('/message', async (c) => {
  try {
    const body = await c.req.json();
    const { message, sessionId, history } = body;

    if (!message || typeof message !== 'string') {
      return c.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Mensagem inválida',
          },
        },
        400
      );
    }

    logger.info('chat', 'Nova mensagem recebida', {
      sessionId,
      messageLength: message.length,
    });

    // Extrair critérios da mensagem
    const criterios = await extrairCriteriosDaMensagem(message);

    // Buscar escolas relevantes para contextualizar
    let escolasContext: any[] = [];

    if (Object.keys(criterios).length > 0) {
      if (criterios.necessidades_especiais && criterios.necessidades_especiais.length > 0) {
        // Busca específica para necessidades especiais
        // Mas usar busca geral com os critérios completos para filtrar por localização também
        escolasContext = await buscarEscolasRelevantes(criterios, 10);
      } else {
        // Busca geral
        escolasContext = await buscarEscolasRelevantes(criterios, 10);
      }
    }

    // Preparar histórico de mensagens
    const messages: ChatMessage[] = [];

    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-5)) {
        // Últimas 5 mensagens
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    // Adicionar mensagem atual
    messages.push({
      role: 'user',
      content: message,
    });

    // Preparar contexto
    const context = {
      escolas: escolasContext.map((e) => ({
        nome: e.nome,
        tipo: e.tipo,
        localizacao: `${e.bairro}, ${e.municipio} - ${e.uf}`,
        mensalidade_anual: e.mensalidade_anual,
        score: e.score_composto,
        icb: e.icb,
        enem_media: e.enem_media,
        aprovacoes_universitarias: e.aprovacoes_universitarias,
        olimpiadas_total: e.olimpiadas_total,
        caracteristicas: e.caracteristicas,
      })),
      criterios,
    };

    // Chamar Groq para gerar resposta
    const response = await chatCompletion(messages, context);

    // Salvar conversa no banco
    await db.execute(sql`
      INSERT INTO chat_conversations (session_id, user_message, assistant_message, context)
      VALUES (${sessionId || 'anonymous'}, ${message}, ${response}, ${JSON.stringify(context)}::jsonb)
    `);

    logger.info('chat', 'Resposta gerada', {
      sessionId,
      responseLength: response.length,
      escolasEncontradas: escolasContext.length,
    });

    return c.json({
      message: response,
      context: {
        escolas_encontradas: escolasContext.length,
        criterios_detectados: criterios,
      },
      sessionId: sessionId || 'anonymous',
    });
  } catch (error) {
    logger.error('chat', 'Erro ao processar mensagem', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao processar mensagem. Tente novamente.',
        },
      },
      500
    );
  }
});

/**
 * GET /chat/history/:sessionId
 * Buscar histórico de conversa
 */
chatRouter.get('/history/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const limit = parseInt(c.req.query('limit') || '20');

    const result = await db.execute(sql`
      SELECT id, user_message, assistant_message, context, created_at
      FROM chat_conversations
      WHERE session_id = ${sessionId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);

    logger.info('chat', 'Histórico recuperado', {
      sessionId,
      messages: result.rows.length,
    });

    return c.json({
      history: result.rows.reverse(),
      sessionId,
    });
  } catch (error) {
    logger.error('chat', 'Erro ao buscar histórico', { error });

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

/**
 * POST /chat/search-schools
 * Buscar escolas com filtros específicos
 */
chatRouter.post('/search-schools', async (c) => {
  try {
    const body = await c.req.json();
    const { criterios, limit } = body;

    logger.info('chat', 'Busca de escolas', { criterios });

    const escolas = await buscarEscolasRelevantes(criterios, limit || 10);

    return c.json({
      escolas,
      total: escolas.length,
      criterios,
    });
  } catch (error) {
    logger.error('chat', 'Erro ao buscar escolas', { error });

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar escolas',
        },
      },
      500
    );
  }
});

export default chatRouter;
