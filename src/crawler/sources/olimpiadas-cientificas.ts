/**
 * Crawler genérico para olimpíadas científicas (OBF, OBQ, OBA)
 */

import { z } from 'zod';
import { db } from '../../db/client';
import { escolas, olimpiadas } from '../../db/schema';
import { logger } from '../../utils/logger';
import { scrape } from '../pipeline';
import { eq } from 'drizzle-orm';
import { calcularPontosOlimpiada } from '../../score/normalizer';
import crypto from 'crypto';

type Competicao = 'obf' | 'obq' | 'oba';

const URLS_OLIMPIADAS: Record<Competicao, string> = {
  obf: 'http://www.sbfisica.org.br/~obf/resultados/',
  obq: 'http://www.obquimica.org/resultados/',
  oba: 'http://www.oba.org.br/site/index.php?p=conteudo&idcat=3&pag=conteudo',
};

const MedalhistaGenericoSchema = z.object({
  aluno: z.string(),
  escola: z.string(),
  cnpj: z.string().optional(),
  municipio: z.string(),
  uf: z.string().length(2),
  nivel: z.enum(['ouro', 'prata', 'bronze', 'mencao']),
  edicao: z.number().int(),
});

type MedalhistaGenerico = z.infer<typeof MedalhistaGenericoSchema>;

/**
 * Gera hash anonimizado
 */
function anonimizar(nome: string, escola: string, edicao: number): string {
  const data = `${nome.toLowerCase().trim()}-${escola}-${edicao}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Extrai medalhistas de uma olimpíada específica
 */
async function extrairMedalhistas(
  competicao: Competicao,
  edicao: number
): Promise<MedalhistaGenerico[]> {
  const baseUrl = URLS_OLIMPIADAS[competicao];
  const url = `${baseUrl}${edicao}.html`;

  logger.info('crawler', `Extraindo medalhistas ${competicao.toUpperCase()}`, {
    url,
    edicao,
  });

  try {
    const result = await scrape(url);

    if (!result.success || !result.data) {
      logger.warn('crawler', `Falha ao fazer scraping ${competicao.toUpperCase()}`, { url });
      return [];
    }

    // TODO: Implementar extração real baseada na estrutura de cada site
    // Por enquanto, retorna array vazio (placeholder)

    const medalhistas: MedalhistaGenerico[] = [];

    logger.info('crawler', `Medalhistas ${competicao.toUpperCase()} extraídos`, {
      url,
      total: medalhistas.length,
    });

    return medalhistas;
  } catch (error) {
    logger.error('crawler', `Erro ao extrair ${competicao.toUpperCase()}`, {
      url,
      error: (error as Error).message,
    });
    return [];
  }
}

/**
 * Processa uma olimpíada específica
 */
async function processarOlimpiadaCientifica(
  competicao: Competicao,
  edicoes: number[]
): Promise<number> {
  logger.info('crawler', `Iniciando processamento ${competicao.toUpperCase()}`);

  let count = 0;

  for (const edicao of edicoes) {
    try {
      const medalhistas = await extrairMedalhistas(competicao, edicao);

      for (const medalhista of medalhistas) {
        try {
          if (!medalhista.cnpj) {
            continue;
          }

          const escola = await db.query.escolas.findFirst({
            where: eq(escolas.cnpj, medalhista.cnpj),
          });

          if (!escola) {
            continue;
          }

          const pontos = calcularPontosOlimpiada(medalhista.nivel);
          const alunoHash = anonimizar(medalhista.aluno, medalhista.escola, medalhista.edicao);

          await db.insert(olimpiadas).values({
            escola_id: escola.id,
            competicao,
            nivel: medalhista.nivel,
            pontos: pontos.toString(),
            edicao: medalhista.edicao,
            aluno_anonimizado: alunoHash,
          });

          count++;
        } catch (error) {
          logger.error('crawler', `Erro ao processar medalhista ${competicao.toUpperCase()}`, {
            error: (error as Error).message,
          });
        }
      }
    } catch (error) {
      logger.error('crawler', `Erro ao processar edição ${competicao.toUpperCase()}`, {
        edicao,
        error: (error as Error).message,
      });
    }
  }

  logger.info('crawler', `Processamento ${competicao.toUpperCase()} concluído`, { total: count });

  return count;
}

/**
 * Processa OBF (Olimpíada Brasileira de Física)
 */
export async function processarObf(): Promise<number> {
  const anoAtual = new Date().getFullYear();
  const edicoes = [anoAtual - 1, anoAtual - 2];
  return processarOlimpiadaCientifica('obf', edicoes);
}

/**
 * Processa OBQ (Olimpíada Brasileira de Química)
 */
export async function processarObq(): Promise<number> {
  const anoAtual = new Date().getFullYear();
  const edicoes = [anoAtual - 1, anoAtual - 2];
  return processarOlimpiadaCientifica('obq', edicoes);
}

/**
 * Processa OBA (Olimpíada Brasileira de Astronomia)
 */
export async function processarOba(): Promise<number> {
  const anoAtual = new Date().getFullYear();
  const edicoes = [anoAtual - 1, anoAtual - 2];
  return processarOlimpiadaCientifica('oba', edicoes);
}
