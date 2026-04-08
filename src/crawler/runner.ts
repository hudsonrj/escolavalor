#!/usr/bin/env bun

/**
 * Runner do Crawler
 *
 * Script executado em processo isolado via Bun.spawn()
 * Uso: bun src/crawler/runner.ts <fonte>
 */

import { logger } from '../utils/logger';
import { processarEnem } from './sources/inep-enem';
import { processarIdeb } from './sources/ideb';
import { processarObmep } from './sources/obmep';
import { processarObf, processarObq, processarOba } from './sources/olimpiadas-cientificas';
import { processarAprovacaoUniv } from './sources/aprovacao-univ';
import { processarMensalidades } from './sources/mensalidades';
import { recalcularTodosScores } from '../score/calculator';

type FonteCrawler =
  | 'inep-enem'
  | 'ideb'
  | 'obmep'
  | 'obf'
  | 'obq'
  | 'oba'
  | 'aprovacao'
  | 'mensalidades';

/**
 * Executa o crawler para uma fonte específica
 */
async function executarCrawler(fonte: FonteCrawler): Promise<number> {
  logger.info('crawler', `Executando crawler: ${fonte}`);

  const startTime = Date.now();
  let count = 0;

  try {
    switch (fonte) {
      case 'inep-enem':
        count = await processarEnem();
        break;

      case 'ideb':
        count = await processarIdeb();
        break;

      case 'obmep':
        count = await processarObmep();
        break;

      case 'obf':
        count = await processarObf();
        break;

      case 'obq':
        count = await processarObq();
        break;

      case 'oba':
        count = await processarOba();
        break;

      case 'aprovacao':
        count = await processarAprovacaoUniv();
        break;

      case 'mensalidades':
        count = await processarMensalidades();
        break;

      default:
        throw new Error(`Fonte desconhecida: ${fonte}`);
    }

    const duration = Date.now() - startTime;

    logger.info('crawler', `Crawler ${fonte} concluído`, {
      count,
      duration: `${duration}ms`,
    });

    // Recalcular scores após coleta bem-sucedida
    if (count > 0) {
      logger.info('crawler', 'Recalculando scores após coleta');
      const scoresRecalculados = await recalcularTodosScores();
      logger.info('crawler', 'Scores recalculados', { total: scoresRecalculados });
    }

    return count;
  } catch (error) {
    logger.error('crawler', `Erro ao executar crawler ${fonte}`, {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.error('crawler', 'Uso: bun src/crawler/runner.ts <fonte>');
    logger.error('crawler', 'Fontes disponíveis: inep-enem, ideb, obmep, obf, obq, oba, aprovacao, mensalidades');
    process.exit(1);
  }

  const fonte = args[0] as FonteCrawler;

  logger.info('crawler', 'Runner iniciado', { fonte, pid: process.pid });

  try {
    const count = await executarCrawler(fonte);

    logger.info('crawler', 'Runner concluído com sucesso', {
      fonte,
      count,
      pid: process.pid,
    });

    process.exit(0);
  } catch (error) {
    logger.error('crawler', 'Runner falhou', {
      fonte,
      error: (error as Error).message,
      pid: process.pid,
    });

    process.exit(1);
  }
}

// Executar
main();
