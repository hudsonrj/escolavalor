/**
 * Rota de health check
 */

import { Hono } from 'hono';
import { db } from '../../db/client';
import { sql } from 'drizzle-orm';
import { validateWeights, getWeightsInfo } from '../../score/weights';

const health = new Hono();

health.get('/', async (c) => {
  const checks: Record<string, { status: string; details?: unknown }> = {};

  // Check: Database
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { status: 'ok' };
  } catch (error) {
    checks.database = {
      status: 'error',
      details: (error as Error).message,
    };
  }

  // Check: Weights
  try {
    validateWeights();
    checks.weights = {
      status: 'ok',
      details: getWeightsInfo(),
    };
  } catch (error) {
    checks.weights = {
      status: 'error',
      details: (error as Error).message,
    };
  }

  const allOk = Object.values(checks).every((check) => check.status === 'ok');

  return c.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    allOk ? 200 : 503
  );
});

export default health;
