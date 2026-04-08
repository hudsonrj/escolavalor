/**
 * Crawler de dados IDEB do INEP
 * Fonte: https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb
 */

import { z } from 'zod';
import { db } from '../../db/client';
import { escolas, notas } from '../../db/schema';
import { logger } from '../../utils/logger';
import { normalizar } from '../../score/normalizer';
import { eq } from 'drizzle-orm';

const IDEB_CSV_URL = 'https://download.inep.gov.br/ideb/resultado/ideb_2023_escola.csv';

const IdebEscolaSchema = z.object({
  CO_ENTIDADE: z.string(), // CNPJ
  NO_ENTIDADE: z.string(), // Nome
  SG_UF: z.string().length(2),
  NO_MUNICIPIO: z.string(),
  IDEB_ENSINO_MEDIO: z.string(), // IDEB do ensino médio
  REDE: z.enum(['Estadual', 'Federal', 'Municipal', 'Privada']),
});

type IdebEscola = z.infer<typeof IdebEscolaSchema>;

/**
 * Mapeia rede do IDEB para nosso enum
 */
function mapearRede(rede: string): 'publica' | 'privada' | 'federal' | 'tecnica' {
  switch (rede) {
    case 'Federal':
      return 'federal';
    case 'Estadual':
    case 'Municipal':
      return 'publica';
    case 'Privada':
      return 'privada';
    default:
      return 'publica';
  }
}

/**
 * Faz download e parse do CSV do IDEB
 */
export async function downloadIdebCSV(): Promise<IdebEscola[]> {
  logger.info('crawler', 'Iniciando download do CSV IDEB', { url: IDEB_CSV_URL });

  try {
    const response = await fetch(IDEB_CSV_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(';');

    logger.info('crawler', 'CSV IDEB baixado', {
      linhas: lines.length,
      headers: headers.length,
    });

    const escolas: IdebEscola[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(';');
      const row: Record<string, string> = {};

      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }

      try {
        const escola = IdebEscolaSchema.parse(row);

        // Filtrar apenas escolas com IDEB válido
        const ideb = parseFloat(escola.IDEB_ENSINO_MEDIO);
        if (!isNaN(ideb) && ideb > 0) {
          escolas.push(escola);
        }
      } catch (error) {
        logger.debug('crawler', 'Linha inválida no CSV IDEB', {
          linha: i,
          error: (error as Error).message,
        });
      }
    }

    logger.info('crawler', 'CSV IDEB parseado', { escolasValidas: escolas.length });

    return escolas;
  } catch (error) {
    logger.error('crawler', 'Erro ao baixar CSV IDEB', { error });
    throw error;
  }
}

/**
 * Processa e salva dados do IDEB no banco
 */
export async function processarIdeb(): Promise<number> {
  logger.info('crawler', 'Iniciando processamento IDEB');

  const escolasIdeb = await downloadIdebCSV();
  let count = 0;

  for (const escolaIdeb of escolasIdeb) {
    try {
      const idebValor = parseFloat(escolaIdeb.IDEB_ENSINO_MEDIO);

      // Buscar ou criar escola
      const escolaExistente = await db.query.escolas.findFirst({
        where: eq(escolas.cnpj, escolaIdeb.CO_ENTIDADE),
      });

      let escolaId: string;

      if (escolaExistente) {
        escolaId = escolaExistente.id;
      } else {
        const [novaEscola] = await db
          .insert(escolas)
          .values({
            cnpj: escolaIdeb.CO_ENTIDADE,
            nome: escolaIdeb.NO_ENTIDADE,
            tipo: mapearRede(escolaIdeb.REDE),
            uf: escolaIdeb.SG_UF,
            municipio: escolaIdeb.NO_MUNICIPIO,
          })
          .returning();

        escolaId = novaEscola.id;
      }

      // Normalizar IDEB (já está em escala 0-10)
      const valorNormalizado = normalizar({
        fonte: 'ideb',
        valor_original: idebValor,
        escala_original: '0-10',
      });

      // Inserir nota IDEB
      await db.insert(notas).values({
        escola_id: escolaId,
        fonte: 'ideb',
        valor_normalizado: valorNormalizado.toFixed(2),
        valor_original: idebValor.toFixed(2),
        escala_original: '0-10',
        ano_referencia: 2023,
      });

      count++;

      if (count % 100 === 0) {
        logger.info('crawler', 'Progresso IDEB', { processadas: count });
      }
    } catch (error) {
      logger.error('crawler', 'Erro ao processar escola IDEB', {
        cnpj: escolaIdeb.CO_ENTIDADE,
        error: (error as Error).message,
      });
    }
  }

  logger.info('crawler', 'Processamento IDEB concluído', { total: count });

  return count;
}
