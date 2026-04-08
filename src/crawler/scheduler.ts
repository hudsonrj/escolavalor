/**
 * Agendador de tarefas de crawling via cron
 *
 * IMPORTANTE: Sempre spawna processo filho para isolar o crawler
 */

import { logger } from '../utils/logger';

export interface CronJob {
  name: string;
  schedule: string;
  source: string;
  enabled: boolean;
}

/**
 * Definição dos jobs de crawling
 */
export const CRON_JOBS: CronJob[] = [
  {
    name: 'INEP ENEM',
    schedule: '0 3 * * 1', // Segunda-feira às 3h
    source: 'inep-enem',
    enabled: true,
  },
  {
    name: 'IDEB',
    schedule: '0 3 1 * *', // Dia 1 de cada mês às 3h
    source: 'ideb',
    enabled: true,
  },
  {
    name: 'OBMEP',
    schedule: '0 2 * * 3', // Quarta-feira às 2h
    source: 'obmep',
    enabled: true,
  },
  {
    name: 'OBF',
    schedule: '0 2 15 * *', // Dia 15 de cada mês às 2h
    source: 'obf',
    enabled: true,
  },
  {
    name: 'OBQ',
    schedule: '0 2 15 * *', // Dia 15 de cada mês às 2h
    source: 'obq',
    enabled: true,
  },
  {
    name: 'OBA',
    schedule: '0 2 15 * *', // Dia 15 de cada mês às 2h
    source: 'oba',
    enabled: true,
  },
  {
    name: 'Fuvest/Comvest',
    schedule: '0 4 1 * *', // Dia 1 de cada mês às 4h
    source: 'aprovacao',
    enabled: true,
  },
  {
    name: 'Mensalidades',
    schedule: '0 6 * * *', // Diário às 6h
    source: 'mensalidades',
    enabled: true,
  },
];

/**
 * Executa um job de crawling em processo isolado
 */
export async function executarCrawlerJob(source: string): Promise<void> {
  logger.info('crawler', `Iniciando job: ${source}`);

  try {
    // Spawnar processo filho isolado
    const proc = Bun.spawn(['bun', 'src/crawler/runner.ts', source], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    // Timeout de 4 horas
    const timeout = setTimeout(() => {
      proc.kill();
      logger.error('crawler', `Job ${source} excedeu timeout de 4h`);
    }, 4 * 60 * 60 * 1000);

    const exitCode = await proc.exited;
    clearTimeout(timeout);

    if (exitCode === 0) {
      logger.info('crawler', `Job ${source} concluído com sucesso`);
    } else {
      logger.error('crawler', `Job ${source} falhou`, { exitCode });
    }

    // Ler logs do processo filho
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    if (stdout) {
      logger.info('crawler', `Job ${source} stdout`, { stdout });
    }

    if (stderr) {
      logger.error('crawler', `Job ${source} stderr`, { stderr });
    }
  } catch (error) {
    logger.error('crawler', `Erro ao executar job ${source}`, { error });
  }
}

/**
 * Inicializa o scheduler (placeholder para implementação futura)
 */
export function inicializarScheduler(): void {
  logger.info('system', 'Scheduler de crawlers inicializado', {
    jobs: CRON_JOBS.filter((j) => j.enabled).length,
  });

  // TODO: Implementar agendamento real com biblioteca de cron
  // Por enquanto, apenas log dos jobs configurados
  for (const job of CRON_JOBS) {
    if (job.enabled) {
      logger.info('system', `Job agendado: ${job.name}`, {
        schedule: job.schedule,
        source: job.source,
      });
    }
  }
}
