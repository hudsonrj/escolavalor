/**
 * Middleware de autenticação via API Key
 */

import { Context, Next } from 'hono';
import { logger } from '../../utils/logger';

const API_KEY_SALT = process.env.API_KEY_SALT || 'change-me';

/**
 * Middleware que valida API Key no header Authorization
 */
export async function authMiddleware(c: Context, next: Next) {
  // Em desenvolvimento, desabilitar autenticação
  const isDev = process.env.NODE_ENV !== 'production';

  // Rotas públicas (sem autenticação)
  const publicRoutes = ['/', '/health', '/docs', '/api-reference', '/openapi.json'];

  if (publicRoutes.some(route => c.req.path === route || c.req.path.startsWith(route))) {
    return next();
  }

  // Em desenvolvimento, permitir acesso sem API key
  if (isDev) {
    return next();
  }

  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('api', 'Tentativa de acesso sem API key', {
      path: c.req.path,
      ip: c.req.header('x-forwarded-for') || 'unknown',
    });

    return c.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'API key obrigatória. Use header: Authorization: Bearer <api_key>',
        },
      },
      401
    );
  }

  const apiKey = authHeader.substring('Bearer '.length);

  // Validação simples (em produção, usar hash + salt no banco)
  if (!isValidApiKey(apiKey)) {
    logger.warn('api', 'API key inválida', {
      path: c.req.path,
      ip: c.req.header('x-forwarded-for') || 'unknown',
    });

    return c.json(
      {
        error: {
          code: 'INVALID_API_KEY',
          message: 'API key inválida',
        },
      },
      401
    );
  }

  return next();
}

/**
 * Valida se uma API key é válida (placeholder)
 */
function isValidApiKey(apiKey: string): boolean {
  // TODO: Implementar validação real com banco de dados
  // Por enquanto, aceita qualquer chave não vazia em desenvolvimento
  return apiKey.length > 0;
}
