/**
 * EscolaValor BR - API Server
 *
 * Entry point principal do servidor HTTP
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { swaggerUI } from '@hono/swagger-ui';
import { apiReference } from '@scalar/hono-api-reference';

import { logger } from './utils/logger';
import { validateWeights } from './score/weights';
import { authMiddleware } from './api/middleware/auth';
import { rateLimitMiddleware, iniciarLimpezaRateLimit } from './api/middleware/rate-limit';

import healthRouter from './api/routes/health';
import escolasRouter from './api/routes/escolas';
import rankingRouter from './api/routes/ranking';
import rankingAgregadoRouter from './api/routes/ranking-agregado';
import compararRouter from './api/routes/comparar';
import historicoRouter from './api/routes/historico';
import municipiosRouter from './api/routes/municipios';
import filtrosRouter from './api/routes/filtros';
import chatRouter from './api/routes/chat';

const PORT = parseInt(process.env.PORT || '3000');

// Validar configuração no startup
try {
  validateWeights();
  logger.info('system', 'Pesos do Score validados com sucesso');
} catch (error) {
  logger.error('system', 'Erro ao validar pesos do Score', { error });
  process.exit(1);
}

// Criar app Hono
const app = new Hono();

// Middlewares globais
app.use('*', honoLogger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use('*', rateLimitMiddleware);
iniciarLimpezaRateLimit();

// Autenticação (aplicada automaticamente, rotas públicas ignoradas internamente)
app.use('*', authMiddleware);

// Documentação
app.get('/docs', swaggerUI({ url: '/openapi.json' }));
app.get('/api-reference', apiReference({
  spec: {
    url: '/openapi.json',
  },
  theme: 'purple',
}));

// OpenAPI spec (placeholder)
app.get('/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'EscolaValor BR API',
      version: '0.1.0',
      description: 'API open source que rastreia escolas brasileiras e compara custo-benefício',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Desenvolvimento',
      },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': { description: 'Sistema saudável' },
          },
        },
      },
      '/escolas': {
        get: {
          summary: 'Lista escolas',
          parameters: [
            { name: 'uf', in: 'query', schema: { type: 'string' } },
            { name: 'tipo', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Lista de escolas' },
          },
        },
      },
      '/ranking': {
        get: {
          summary: 'Ranking por ICB',
          responses: {
            '200': { description: 'Top escolas por custo-benefício' },
          },
        },
      },
      '/comparar': {
        post: {
          summary: 'Compara escolas',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ids: {
                      type: 'array',
                      items: { type: 'string', format: 'uuid' },
                      minItems: 2,
                      maxItems: 4,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Comparação de escolas' },
          },
        },
      },
    },
  });
});

// Rotas
app.route('/health', healthRouter);
app.route('/escolas', escolasRouter);
app.route('/ranking', rankingRouter);
app.route('/ranking-agregado', rankingAgregadoRouter);
app.route('/comparar', compararRouter);
app.route('/historico', historicoRouter);
app.route('/municipios', municipiosRouter);
app.route('/filtros', filtrosRouter);
app.route('/chat', chatRouter);

// Rota raiz
app.get('/', (c) => {
  return c.json({
    name: 'EscolaValor BR',
    version: '0.1.0',
    description: 'API open source que rastreia escolas brasileiras e compara custo-benefício',
    docs: '/docs',
    apiReference: '/api-reference',
    health: '/health',
  });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'Rota não encontrada',
      },
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  logger.error('api', 'Erro não tratado', { error: err.message, stack: err.stack });

  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    },
    500
  );
});

// Iniciar servidor
logger.info('system', `Servidor iniciando na porta ${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
