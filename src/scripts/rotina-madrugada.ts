/**
 * Rotina principal que roda na madrugada (3h da manhã)
 * 1. Busca novas escolas
 * 2. Atualiza dados das escolas existentes
 * 3. Recalcula todos os scores
 */

import { logger } from '../utils/logger';
import { buscarTodasEscolas } from './buscar-escolas-inep';
import { atualizarTodasEscolas } from './atualizar-dados-escolas';

async function executarRotinaMadrugada() {
  const inicio = Date.now();

  logger.info('rotina-madrugada', '========================================');
  logger.info('rotina-madrugada', 'Iniciando rotina de atualização diária');
  logger.info('rotina-madrugada', '========================================');

  try {
    // ETAPA 1: Buscar novas escolas
    logger.info('rotina-madrugada', 'ETAPA 1/2: Buscando novas escolas');
    await buscarTodasEscolas();
    logger.info('rotina-madrugada', 'ETAPA 1/2: Concluída ✓');

    // Delay de 5 segundos entre etapas
    await new Promise(resolve => setTimeout(resolve, 5000));

    // ETAPA 2: Atualizar dados das escolas existentes
    logger.info('rotina-madrugada', 'ETAPA 2/2: Atualizando dados das escolas');
    await atualizarTodasEscolas();
    logger.info('rotina-madrugada', 'ETAPA 2/2: Concluída ✓');

    const duracao = ((Date.now() - inicio) / 1000 / 60).toFixed(2);

    logger.info('rotina-madrugada', '========================================');
    logger.info('rotina-madrugada', `Rotina finalizada com sucesso em ${duracao} minutos`);
    logger.info('rotina-madrugada', '========================================');

    return { sucesso: true, duracao };
  } catch (error) {
    logger.error('rotina-madrugada', 'Erro na execução da rotina', { error });

    return { sucesso: false, erro: error };
  }
}

// Executar se for chamado diretamente
if (import.meta.main) {
  executarRotinaMadrugada()
    .then((resultado) => {
      if (resultado.sucesso) {
        logger.info('rotina-madrugada', 'Processo concluído com sucesso');
        process.exit(0);
      } else {
        logger.error('rotina-madrugada', 'Processo concluído com erros');
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error('rotina-madrugada', 'Erro fatal na execução', { error });
      process.exit(1);
    });
}

export { executarRotinaMadrugada };
