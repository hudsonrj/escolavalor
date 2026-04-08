/**
 * Crawler de dados ENEM do INEP
 * Fonte: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem
 */

import { z } from 'zod';
import { db } from '../../db/client';
import { escolas, notas } from '../../db/schema';
import { logger } from '../../utils/logger';
import { normalizar } from '../../score/normalizer';
import { eq } from 'drizzle-orm';

const INEP_ENEM_CSV_URL = 'https://download.inep.gov.br/microdados/enem_por_escola_2023.csv';

const EnemEscolaSchema = z.object({
  CO_ENTIDADE: z.string(), // CNPJ
  NO_ENTIDADE: z.string(), // Nome da escola
  SG_UF_ESC: z.string().length(2), // UF
  NO_MUNICIPIO_ESC: z.string(), // Município
  TP_DEPENDENCIA: z.enum(['1', '2', '3', '4']), // 1=Federal, 2=Estadual, 3=Municipal, 4=Privada
  NU_MEDIA_MT: z.string(), // Média Matemática
  NU_MEDIA_CN: z.string(), // Média Ciências da Natureza
  NU_MEDIA_CH: z.string(), // Média Ciências Humanas
  NU_MEDIA_LP: z.string(), // Média Linguagens
  NU_MEDIA_RED: z.string(), // Média Redação
});

type EnemEscola = z.infer<typeof EnemEscolaSchema>;

/**
 * Mapeia tipo de dependência do INEP para nosso enum
 */
function mapearTipoDependencia(tp: string): 'publica' | 'privada' | 'federal' | 'tecnica' {
  switch (tp) {
    case '1':
      return 'federal';
    case '2':
    case '3':
      return 'publica';
    case '4':
      return 'privada';
    default:
      return 'publica';
  }
}

/**
 * Calcula média geral do ENEM (média das 5 áreas)
 */
function calcularMediaEnem(escola: EnemEscola): number {
  const medias = [
    parseFloat(escola.NU_MEDIA_MT),
    parseFloat(escola.NU_MEDIA_CN),
    parseFloat(escola.NU_MEDIA_CH),
    parseFloat(escola.NU_MEDIA_LP),
    parseFloat(escola.NU_MEDIA_RED),
  ].filter((m) => !isNaN(m) && m > 0);

  if (medias.length === 0) {
    return 0;
  }

  return medias.reduce((sum, m) => sum + m, 0) / medias.length;
}

/**
 * Faz download e parse do CSV do ENEM
 */
export async function downloadEnemCSV(): Promise<EnemEscola[]> {
  logger.info('crawler', 'Iniciando download do CSV ENEM', { url: INEP_ENEM_CSV_URL });

  try {
    const response = await fetch(INEP_ENEM_CSV_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(';');

    logger.info('crawler', 'CSV ENEM baixado', {
      linhas: lines.length,
      headers: headers.length,
    });

    const escolas: EnemEscola[] = [];

    // Parse CSV (começar da linha 1, pulando header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(';');
      const row: Record<string, string> = {};

      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }

      try {
        const escola = EnemEscolaSchema.parse(row);
        escolas.push(escola);
      } catch (error) {
        logger.debug('crawler', 'Linha inválida no CSV ENEM', {
          linha: i,
          error: (error as Error).message,
        });
      }
    }

    logger.info('crawler', 'CSV ENEM parseado', { escolasValidas: escolas.length });

    return escolas;
  } catch (error) {
    logger.error('crawler', 'Erro ao baixar CSV ENEM', { error });
    throw error;
  }
}

/**
 * Processa e salva dados do ENEM no banco
 */
export async function processarEnem(): Promise<number> {
  logger.info('crawler', 'Iniciando processamento ENEM');

  const escolasEnem = await downloadEnemCSV();
  let count = 0;

  for (const escolaEnem of escolasEnem) {
    try {
      const mediaGeral = calcularMediaEnem(escolaEnem);

      if (mediaGeral === 0) {
        logger.debug('crawler', 'Escola sem média válida', {
          cnpj: escolaEnem.CO_ENTIDADE,
        });
        continue;
      }

      // Upsert escola
      const [escola] = await db
        .insert(escolas)
        .values({
          cnpj: escolaEnem.CO_ENTIDADE,
          nome: escolaEnem.NO_ENTIDADE,
          tipo: mapearTipoDependencia(escolaEnem.TP_DEPENDENCIA),
          uf: escolaEnem.SG_UF_ESC,
          municipio: escolaEnem.NO_MUNICIPIO_ESC,
        })
        .onConflictDoUpdate({
          target: escolas.cnpj,
          set: {
            nome: escolaEnem.NO_ENTIDADE,
            updated_at: new Date(),
          },
        })
        .returning();

      // Normalizar nota ENEM (0-1000 → 0-10)
      const valorNormalizado = normalizar({
        fonte: 'enem',
        valor_original: mediaGeral,
        escala_original: '0-1000',
      });

      // Inserir nota ENEM
      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'enem',
        valor_normalizado: valorNormalizado.toFixed(2),
        valor_original: mediaGeral.toFixed(2),
        escala_original: '0-1000',
        ano_referencia: 2023,
      });

      count++;

      if (count % 100 === 0) {
        logger.info('crawler', 'Progresso ENEM', { processadas: count });
      }
    } catch (error) {
      logger.error('crawler', 'Erro ao processar escola ENEM', {
        cnpj: escolaEnem.CO_ENTIDADE,
        error: (error as Error).message,
      });
    }
  }

  logger.info('crawler', 'Processamento ENEM concluído', { total: count });

  return count;
}
