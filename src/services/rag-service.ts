/**
 * Serviço de RAG (Retrieval-Augmented Generation)
 * Busca informações relevantes do banco para contextualizar respostas
 */

import { db } from '../db/client';
import { escolas, scores, notas, enemDetalhes, aprovacoesUniversitarias, olimpiadas, informacoesEscola } from '../db/schema';
import { eq, sql, and, or, ilike, desc } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { generateEmbedding, cosineSimilarity } from './groq-chat';

export interface EscolaContext {
  id: string;
  nome: string;
  tipo: string;
  uf: string;
  municipio: string;
  bairro: string;
  mensalidade_anual: string | null;
  score_composto: string | null;
  icb: string | null;
  enem_media?: string;
  aprovacoes_universitarias?: number;
  olimpiadas_total?: number;
  caracteristicas?: any;
}

/**
 * Busca escolas relevantes baseado em critérios
 */
export async function buscarEscolasRelevantes(
  criterios: {
    uf?: string;
    municipio?: string;
    bairro?: string;
    mensalidade_max?: number;
    mensalidade_min?: number;
    tipo?: string;
    score_minimo?: number;
    necessidades_especiais?: string[];
    metodologia?: string;
    keyword?: string;
  },
  limit: number = 10
): Promise<EscolaContext[]> {
  try {
    logger.info('rag', 'Buscando escolas relevantes', { criterios });

    const conditions: any[] = [];

    if (criterios.uf) {
      conditions.push(eq(escolas.uf, criterios.uf));
    }

    if (criterios.municipio) {
      conditions.push(ilike(escolas.municipio, `%${criterios.municipio}%`));
    }

    if (criterios.bairro) {
      conditions.push(ilike(escolas.bairro, `%${criterios.bairro}%`));
    }

    if (criterios.tipo) {
      conditions.push(eq(escolas.tipo, criterios.tipo as any));
    }

    if (criterios.keyword) {
      conditions.push(ilike(escolas.nome, `%${criterios.keyword}%`));
    }

    if (criterios.score_minimo) {
      conditions.push(sql`${scores.score_composto} >= ${criterios.score_minimo}`);
    }

    // Se há necessidades especiais, adicionar join com informacoesEscola e filtrar
    let query;
    if (criterios.necessidades_especiais && criterios.necessidades_especiais.length > 0) {
      // Busca com filtro de inclusão
      query = db
        .select({
          id: escolas.id,
          nome: escolas.nome,
          tipo: escolas.tipo,
          uf: escolas.uf,
          municipio: escolas.municipio,
          bairro: escolas.bairro,
          mensalidade_anual: escolas.mensalidade_anual,
          score_composto: scores.score_composto,
          icb: scores.icb,
        })
        .from(escolas)
        .innerJoin(informacoesEscola, eq(escolas.id, informacoesEscola.escola_id))
        .leftJoin(scores, eq(escolas.id, scores.escola_id))
        .where(
          and(
            ...conditions,
            or(
              ilike(informacoesEscola.inclusao, '%TEA%'),
              ilike(informacoesEscola.inclusao, '%autismo%'),
              ilike(informacoesEscola.inclusao, '%TDAH%'),
              ilike(informacoesEscola.inclusao, '%dislexia%'),
              ilike(informacoesEscola.inclusao, '%superdota%'),
              ilike(informacoesEscola.inclusao, '%inclusiv%'),
              ilike(informacoesEscola.inclusao, '%especial%')
            )
          )
        )
        .orderBy(desc(scores.score_composto))
        .limit(limit);
    } else {
      // Busca geral
      query = db
        .select({
          id: escolas.id,
          nome: escolas.nome,
          tipo: escolas.tipo,
          uf: escolas.uf,
          municipio: escolas.municipio,
          bairro: escolas.bairro,
          mensalidade_anual: escolas.mensalidade_anual,
          score_composto: scores.score_composto,
          icb: scores.icb,
        })
        .from(escolas)
        .leftJoin(scores, eq(escolas.id, scores.escola_id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(scores.score_composto))
        .limit(limit);
    }

    const results = await query;

    // Enriquecer com dados adicionais
    const enriched = await Promise.all(
      results.map(async (escola) => {
        // ENEM média
        const [enemData] = await db
          .select({
            nota_media: enemDetalhes.nota_media,
          })
          .from(enemDetalhes)
          .where(eq(enemDetalhes.escola_id, escola.id))
          .orderBy(desc(enemDetalhes.ano_referencia))
          .limit(1);

        // Total de aprovações
        const [aprovacoesData] = await db
          .select({
            total: sql<number>`SUM(${aprovacoesUniversitarias.quantidade})`,
          })
          .from(aprovacoesUniversitarias)
          .where(eq(aprovacoesUniversitarias.escola_id, escola.id));

        // Total de medalhas
        const [olimpiadasData] = await db
          .select({
            total: sql<number>`SUM(${olimpiadas.pontos})`,
          })
          .from(olimpiadas)
          .where(eq(olimpiadas.escola_id, escola.id));

        // Informações adicionais
        const [infoData] = await db
          .select()
          .from(informacoesEscola)
          .where(eq(informacoesEscola.escola_id, escola.id))
          .limit(1);

        return {
          ...escola,
          enem_media: enemData?.nota_media,
          aprovacoes_universitarias: aprovacoesData?.total || 0,
          olimpiadas_total: olimpiadasData?.total || 0,
          caracteristicas: infoData || null,
        };
      })
    );

    logger.info('rag', 'Escolas encontradas', { total: enriched.length });

    return enriched;
  } catch (error) {
    logger.error('rag', 'Erro ao buscar escolas', { error });
    return [];
  }
}

/**
 * Busca escolas para necessidades especiais
 */
export async function buscarEscolasInclusivas(
  necessidade: string,
  uf?: string,
  limit: number = 50
): Promise<EscolaContext[]> {
  try {
    logger.info('rag', 'Buscando escolas inclusivas', { necessidade, uf });

    const conditions: any[] = [];

    // Adicionar condição de busca na coluna inclusao
    if (necessidade) {
      conditions.push(
        or(
          ilike(informacoesEscola.inclusao, `%${necessidade}%`),
          ilike(informacoesEscola.inclusao, `%TEA%`),
          ilike(informacoesEscola.inclusao, `%TDAH%`),
          ilike(informacoesEscola.inclusao, `%inclusiv%`),
          ilike(informacoesEscola.inclusao, `%especial%`)
        )
      );
    }

    if (uf) {
      conditions.push(eq(escolas.uf, uf));
    }

    const results = await db
      .select({
        id: escolas.id,
        nome: escolas.nome,
        tipo: escolas.tipo,
        uf: escolas.uf,
        municipio: escolas.municipio,
        bairro: escolas.bairro,
        mensalidade_anual: escolas.mensalidade_anual,
        score_composto: scores.score_composto,
        icb: scores.icb,
        caracteristicas: informacoesEscola,
      })
      .from(escolas)
      .innerJoin(informacoesEscola, eq(escolas.id, informacoesEscola.escola_id))
      .leftJoin(scores, eq(escolas.id, scores.escola_id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(scores.score_composto))
      .limit(limit);

    logger.info('rag', 'Escolas inclusivas encontradas', { total: results.length });

    return results.map((r) => ({
      ...r,
      caracteristicas: r.caracteristicas,
    }));
  } catch (error) {
    logger.error('rag', 'Erro ao buscar escolas inclusivas', { error });
    return [];
  }
}

/**
 * Extrai critérios de busca da mensagem do usuário usando LLM
 */
export async function extrairCriteriosDaMensagem(mensagem: string): Promise<any> {
  // Análise simples de palavras-chave
  const criterios: any = {};

  // Cidades - verificar primeiro para evitar conflitos
  if (mensagem.match(/rio de janeiro|barra.*(tijuca|rio)|rio\b/i) && !mensagem.match(/grande do sul/i)) {
    criterios.uf = 'RJ';
    if (mensagem.match(/rio de janeiro(?!\s+grande)/i)) {
      criterios.municipio = 'Rio de Janeiro';
    }
  }
  if (mensagem.match(/são paulo|sampa/i)) {
    criterios.uf = 'SP';
    criterios.municipio = 'São Paulo';
  }

  // UFs - só verificar se não encontrou cidade
  if (!criterios.uf) {
    const ufs = ['RJ', 'SP', 'MG', 'ES', 'PR', 'RS', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO'];
    for (const uf of ufs) {
      if (mensagem.toUpperCase().includes(uf)) {
        criterios.uf = uf;
        break;
      }
    }
  }

  // Bairros do RJ
  const bairrosRJ = ['Barra', 'Botafogo', 'Copacabana', 'Ipanema', 'Leblon', 'Tijuca', 'Recreio', 'Jacarepaguá'];
  for (const bairro of bairrosRJ) {
    if (mensagem.toLowerCase().includes(bairro.toLowerCase())) {
      criterios.bairro = bairro;
      if (!criterios.uf) criterios.uf = 'RJ';
      break;
    }
  }

  // Tipo de escola
  if (mensagem.match(/particular|privada/i)) {
    criterios.tipo = 'privada';
  } else if (mensagem.match(/federal/i)) {
    criterios.tipo = 'federal';
  } else if (mensagem.match(/pública|publica/i)) {
    criterios.tipo = 'publica';
  }

  // Mensalidade
  const mensalidadeMatch = mensagem.match(/até\s*R?\$?\s*([\d.,]+)/i) ||
                           mensagem.match(/mensalidade.*?([\d.,]+)/i);
  if (mensalidadeMatch) {
    const valor = parseFloat(mensalidadeMatch[1].replace(/[.,]/g, ''));
    if (!isNaN(valor)) {
      criterios.mensalidade_max = valor * 12; // Converter para anual
    }
  }

  // Necessidades especiais
  const necessidadesKeywords = {
    autismo: ['autismo', 'autista', 'tea', 'espectro autista'],
    tdah: ['tdah', 'déficit de atenção', 'hiperatividade'],
    superdotacao: ['superdotado', 'altas habilidades', 'dotado'],
    dislexia: ['dislexia', 'disléxico'],
    deficiencia: ['deficiência', 'especial', 'inclusão', 'inclusiva'],
  };

  criterios.necessidades_especiais = [];
  for (const [key, keywords] of Object.entries(necessidadesKeywords)) {
    if (keywords.some(kw => mensagem.toLowerCase().includes(kw))) {
      criterios.necessidades_especiais.push(key);
    }
  }

  logger.info('rag', 'Critérios extraídos', { mensagem: mensagem.substring(0, 100), criterios });

  return criterios;
}
