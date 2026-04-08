/**
 * Crawler de dados da OBMEP (Olimpíada Brasileira de Matemática)
 * Fonte: https://www.obmep.org.br/resultados.htm
 */

import { z } from 'zod';
import { db } from '../../db/client';
import { escolas, olimpiadas } from '../../db/schema';
import { logger } from '../../utils/logger';
import { scrape, executarPipeline } from '../pipeline';
import { eq } from 'drizzle-orm';
import { calcularPontosOlimpiada } from '../../score/normalizer';
import crypto from 'crypto';

const OBMEP_BASE_URL = 'https://www.obmep.org.br';
const OBMEP_RESULTADOS_URL = `${OBMEP_BASE_URL}/resultados.htm`;

const MedalhistaSchema = z.object({
  aluno: z.string(),
  escola: z.string(),
  cnpj: z.string().optional(),
  municipio: z.string(),
  uf: z.string().length(2),
  nivel: z.enum(['ouro', 'prata', 'bronze', 'mencao']),
  edicao: z.number().int().min(2005).max(2030),
});

type Medalhista = z.infer<typeof MedalhistaSchema>;

/**
 * Gera hash anonimizado do nome do aluno
 */
function anonimizarAluno(nome: string, escola: string, edicao: number): string {
  const data = `${nome.toLowerCase().trim()}-${escola}-${edicao}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Extrai dados de medalhas da página de resultados
 */
async function extrairMedalhistas(url: string, edicao: number): Promise<Medalhista[]> {
  logger.info('crawler', 'Extraindo medalhistas OBMEP', { url, edicao });

  const result = await scrape(url);

  if (!result.success || !result.data) {
    logger.error('crawler', 'Falha ao fazer scraping OBMEP', { url });
    return [];
  }

  const medalhistas: Medalhista[] = [];

  // TODO: Implementar extração real com base na estrutura HTML do site
  // Por enquanto, retorna array vazio (placeholder)
  // A implementação real depende da estrutura específica da página

  logger.info('crawler', 'Medalhistas OBMEP extraídos', {
    url,
    edicao,
    total: medalhistas.length,
  });

  return medalhistas;
}

/**
 * Processa e salva dados da OBMEP no banco
 */
export async function processarObmep(): Promise<number> {
  logger.info('crawler', 'Iniciando processamento OBMEP');

  const edicaoAtual = new Date().getFullYear();
  const edicoes = [edicaoAtual - 1, edicaoAtual - 2]; // Últimas 2 edições

  let count = 0;

  for (const edicao of edicoes) {
    const url = `${OBMEP_BASE_URL}/resultados/${edicao}.htm`;

    try {
      const medalhistas = await extrairMedalhistas(url, edicao);

      for (const medalhista of medalhistas) {
        try {
          // Buscar escola por CNPJ
          if (!medalhista.cnpj) {
            logger.debug('crawler', 'Medalhista sem CNPJ', {
              escola: medalhista.escola,
            });
            continue;
          }

          const escola = await db.query.escolas.findFirst({
            where: eq(escolas.cnpj, medalhista.cnpj),
          });

          if (!escola) {
            logger.debug('crawler', 'Escola não encontrada', {
              cnpj: medalhista.cnpj,
            });
            continue;
          }

          // Calcular pontos pela medalha
          const pontos = calcularPontosOlimpiada(medalhista.nivel);

          // Hash anonimizado do aluno
          const alunoHash = anonimizarAluno(
            medalhista.aluno,
            medalhista.escola,
            medalhista.edicao
          );

          // Inserir olimpíada
          await db.insert(olimpiadas).values({
            escola_id: escola.id,
            competicao: 'obmep',
            nivel: medalhista.nivel,
            pontos: pontos.toString(),
            edicao: medalhista.edicao,
            aluno_anonimizado: alunoHash,
          });

          count++;
        } catch (error) {
          logger.error('crawler', 'Erro ao processar medalhista OBMEP', {
            aluno: medalhista.aluno,
            error: (error as Error).message,
          });
        }
      }

      logger.info('crawler', 'Edição OBMEP processada', { edicao, count });
    } catch (error) {
      logger.error('crawler', 'Erro ao processar edição OBMEP', {
        edicao,
        error: (error as Error).message,
      });
    }
  }

  logger.info('crawler', 'Processamento OBMEP concluído', { total: count });

  return count;
}
