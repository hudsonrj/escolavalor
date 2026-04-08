/**
 * Middleware de rate limiting
 */

import { Context, Next } from 'hono';
import { logger } from '../../utils/logger';

// Armazena contadores de requisições em memória (em produção, usar Redis)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 req/min com API key
const RATE_LIMIT_MAX_REQUESTS_NO_KEY = 20; // 20 req/min sem API key

/**
 * Middleware de rate limiting por IP ou API key
 */
export async function rateLimitMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const hasApiKey = authHeader?.startsWith('Bearer ');

  const identifier = hasApiKey
    ? authHeader.substring('Bearer '.length)
    : c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  const maxRequests = hasApiKey
    ? RATE_LIMIT_MAX_REQUESTS
    : RATE_LIMIT_MAX_REQUESTS_NO_KEY;

  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetAt) {
    // Novo período ou primeiro acesso
    requestCounts.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return next();
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);

    logger.warn('api', 'Rate limit excedido', {
      identifier: hasApiKey ? 'api_key' : identifier,
      path: c.req.path,
    });

    c.header('Retry-After', retryAfter.toString());

    return c.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Limite de ${maxRequests} requisições por minuto excedido`,
          retryAfter,
        },
      },
      429
    );
  }

  // Incrementar contador
  record.count++;
  requestCounts.set(identifier, record);

  return next();
}

/**
 * Limpa contadores expirados periodicamente
 */
export function iniciarLimpezaRateLimit() {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of requestCounts.entries()) {
      if (now > record.resetAt) {
        requestCounts.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('system', 'Rate limit cache limpo', { cleaned });
    }
  }, 60 * 1000); // Limpar a cada 1 minuto
}
