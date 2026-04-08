/**
 * Script para recalcular todos os scores do sistema
 *
 * Uso: bun run score:recalculate
 */

import { recalcularTodosScores } from '../score/calculator';
import { logger } from '../utils/logger';

async function main() {
  logger.info('system', 'Iniciando recálculo de todos os scores');

  try {
    const count = await recalcularTodosScores();

    logger.info('system', 'Recálculo concluído com sucesso', {
      escolas_processadas: count,
    });

    process.exit(0);
  } catch (error) {
    logger.error('system', 'Erro ao recalcular scores', { error });
    process.exit(1);
  }
}

main();
