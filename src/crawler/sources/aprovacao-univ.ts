/**
 * Crawler de taxas de aprovação em universidades (Fuvest, Unicamp, federais)
 */

import { z } from 'zod';
import { db } from '../../db/client';
import { escolas, notas } from '../../db/schema';
import { logger } from '../../utils/logger';
import { scrape } from '../pipeline';
import { eq } from 'drizzle-orm';
import { normalizar } from '../../score/normalizer';

const FUVEST_URL = 'https://www.fuvest.br/estatisticas-inscricoes-aprovacoes/';
const COMVEST_URL = 'https://www.comvest.unicamp.br/estatisticas/';

const AprovacaoEscolaSchema = z.object({
  escola: z.string(),
  cnpj: z.string().optional(),
  municipio: z.string(),
  uf: z.string().length(2),
  total_alunos: z.number().int().positive(),
  aprovados: z.number().int().nonnegative(),
  taxa_aprovacao: z.number().min(0).max(100), // percentual
  ano: z.number().int(),
});

type AprovacaoEscola = z.infer<typeof AprovacaoEscolaSchema>;

/**
 * Extrai dados de aprovação da Fuvest
 */
async function extrairFuvest(): Promise<AprovacaoEscola[]> {
  logger.info('crawler', 'Extraindo dados Fuvest', { url: FUVEST_URL });

  try {
    const result = await scrape(FUVEST_URL);

    if (!result.success || !result.data) {
      logger.warn('crawler', 'Falha ao fazer scraping Fuvest');
      return [];
    }

    // TODO: Implementar extração real baseada na estrutura da página
    // Por enquanto, retorna array vazio (placeholder)

    const aprovacoes: AprovacaoEscola[] = [];

    logger.info('crawler', 'Dados Fuvest extraídos', { total: aprovacoes.length });

    return aprovacoes;
  } catch (error) {
    logger.error('crawler', 'Erro ao extrair Fuvest', { error });
    return [];
  }
}

/**
 * Extrai dados de aprovação da Comvest (Unicamp)
 */
async function extrairComvest(): Promise<AprovacaoEscola[]> {
  logger.info('crawler', 'Extraindo dados Comvest', { url: COMVEST_URL });

  try {
    const result = await scrape(COMVEST_URL);

    if (!result.success || !result.data) {
      logger.warn('crawler', 'Falha ao fazer scraping Comvest');
      return [];
    }

    // TODO: Implementar extração real baseada na estrutura da página

    const aprovacoes: AprovacaoEscola[] = [];

    logger.info('crawler', 'Dados Comvest extraídos', { total: aprovacoes.length });

    return aprovacoes;
  } catch (error) {
    logger.error('crawler', 'Erro ao extrair Comvest', { error });
    return [];
  }
}

/**
 * Processa dados de aprovação universitária
 */
async function processarAprovacoes(aprovacoes: AprovacaoEscola[]): Promise<number> {
  let count = 0;

  for (const aprovacao of aprovacoes) {
    try {
      if (!aprovacao.cnpj) {
        continue;
      }

      const escola = await db.query.escolas.findFirst({
        where: eq(escolas.cnpj, aprovacao.cnpj),
      });

      if (!escola) {
        continue;
      }

      // Normalizar taxa de aprovação (0-100% → 0-10)
      const valorNormalizado = normalizar({
        fonte: 'aprovacao_univ',
        valor_original: aprovacao.taxa_aprovacao,
        escala_original: '0-100',
      });

      // Inserir nota de aprovação
      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'aprovacao_univ',
        valor_normalizado: valorNormalizado.toFixed(2),
        valor_original: aprovacao.taxa_aprovacao.toFixed(2),
        escala_original: '0-100',
        ano_referencia: aprovacao.ano,
      });

      count++;
    } catch (error) {
      logger.error('crawler', 'Erro ao processar aprovação', {
        escola: aprovacao.escola,
        error: (error as Error).message,
      });
    }
  }

  return count;
}

/**
 * Processa todos os dados de aprovação universitária
 */
export async function processarAprovacaoUniv(): Promise<number> {
  logger.info('crawler', 'Iniciando processamento de aprovações universitárias');

  const [fuvestData, comvestData] = await Promise.all([
    extrairFuvest(),
    extrairComvest(),
  ]);

  const todasAprovacoes = [...fuvestData, ...comvestData];

  const count = await processarAprovacoes(todasAprovacoes);

  logger.info('crawler', 'Processamento de aprovações concluído', { total: count });

  return count;
}
