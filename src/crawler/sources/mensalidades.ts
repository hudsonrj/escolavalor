/**
 * Crawler de mensalidades escolares
 * Scraping dos sites oficiais das escolas
 */

import { z } from 'zod';
import { db } from '../../db/client';
import { escolas } from '../../db/schema';
import { logger } from '../../utils/logger';
import { scrape } from '../pipeline';
import { eq } from 'drizzle-orm';

const MensalidadeSchema = z.object({
  valor_anual: z.number().positive(),
  ano_referencia: z.number().int(),
  fonte_url: z.string().url(),
});

type Mensalidade = z.infer<typeof MensalidadeSchema>;

/**
 * Tenta extrair mensalidade do JSON-LD
 */
function extrairMensalidadeJsonLd(jsonLdData: any[]): Mensalidade | null {
  for (const data of jsonLdData) {
    if (data['@type'] === 'EducationalOrganization' && data.offers) {
      const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;

      if (offer.price && offer.priceCurrency === 'BRL') {
        const precoMensal = parseFloat(offer.price);
        const valorAnual = precoMensal * 12;

        return {
          valor_anual: valorAnual,
          ano_referencia: new Date().getFullYear(),
          fonte_url: data.url || '',
        };
      }
    }
  }

  return null;
}

/**
 * Busca mensalidade no site de uma escola
 */
async function buscarMensalidade(escolaId: string, siteUrl: string): Promise<Mensalidade | null> {
  logger.info('crawler', 'Buscando mensalidade', { escolaId, url: siteUrl });

  try {
    const result = await scrape(siteUrl);

    if (!result.success || !result.data) {
      logger.warn('crawler', 'Falha ao fazer scraping de mensalidade', { url: siteUrl });
      return null;
    }

    // Tentar extrair do JSON-LD
    if (Array.isArray(result.data)) {
      const mensalidade = extrairMensalidadeJsonLd(result.data);
      if (mensalidade) {
        return mensalidade;
      }
    }

    // TODO: Implementar fallback com seletores CSS específicos
    // Por enquanto, retorna null se JSON-LD não funcionou

    return null;
  } catch (error) {
    logger.error('crawler', 'Erro ao buscar mensalidade', {
      url: siteUrl,
      error: (error as Error).message,
    });
    return null;
  }
}

/**
 * Processa mensalidades de todas as escolas privadas
 */
export async function processarMensalidades(): Promise<number> {
  logger.info('crawler', 'Iniciando processamento de mensalidades');

  // Buscar todas as escolas privadas sem mensalidade ou com dados antigos
  const escolasPrivadas = await db.query.escolas.findMany({
    where: eq(escolas.tipo, 'privada'),
  });

  logger.info('crawler', 'Escolas privadas encontradas', {
    total: escolasPrivadas.length,
  });

  let count = 0;

  for (const escola of escolasPrivadas) {
    try {
      // TODO: Implementar busca do site da escola
      // Por enquanto, vamos assumir que o site está em um campo não implementado
      // const siteUrl = escola.site_url;

      // Placeholder: pular por enquanto
      logger.debug('crawler', 'Escola sem URL de site', { id: escola.id });
      continue;

      // Código para quando o campo site_url for adicionado:
      /*
      if (!siteUrl) {
        continue;
      }

      const mensalidade = await buscarMensalidade(escola.id, siteUrl);

      if (mensalidade) {
        await db
          .update(escolas)
          .set({
            mensalidade_anual: mensalidade.valor_anual.toFixed(2),
            mensalidade_ano_ref: mensalidade.ano_referencia,
            updated_at: new Date(),
          })
          .where(eq(escolas.id, escola.id));

        count++;
      }
      */
    } catch (error) {
      logger.error('crawler', 'Erro ao processar mensalidade', {
        escolaId: escola.id,
        error: (error as Error).message,
      });
    }

    // Delay entre requests para não sobrecarregar
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  logger.info('crawler', 'Processamento de mensalidades concluído', { total: count });

  return count;
}
