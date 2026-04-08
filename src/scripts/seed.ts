#!/usr/bin/env bun

/**
 * Script de seed do banco de dados com dados de exemplo
 *
 * Uso: bun src/scripts/seed.ts
 */

import { db } from '../db/client';
import { escolas, notas, olimpiadas, scores } from '../db/schema';
import { logger } from '../utils/logger';
import { calcularScore, salvarScore } from '../score/calculator';

async function seed() {
  logger.info('system', 'Iniciando seed do banco de dados');

  try {
    // Limpar dados existentes
    logger.info('system', 'Limpando dados existentes');
    await db.delete(scores);
    await db.delete(olimpiadas);
    await db.delete(notas);
    await db.delete(escolas);

    // Criar escolas de exemplo
    logger.info('system', 'Criando escolas de exemplo');

    const escolasData = [
      {
        cnpj: '00.000.000/0001-00',
        nome: 'Colégio Bandeirantes',
        tipo: 'privada' as const,
        uf: 'SP',
        municipio: 'São Paulo',
        lat: '-23.5505',
        lng: '-46.6333',
        mensalidade_anual: '48000.00',
        mensalidade_ano_ref: 2024,
      },
      {
        cnpj: '11.111.111/0001-11',
        nome: 'Colégio Vértice',
        tipo: 'privada' as const,
        uf: 'SP',
        municipio: 'São Paulo',
        lat: '-23.5489',
        lng: '-46.6388',
        mensalidade_anual: '42000.00',
        mensalidade_ano_ref: 2024,
      },
      {
        cnpj: '22.222.222/0001-22',
        nome: 'Escola Estadual Caetano de Campos',
        tipo: 'publica' as const,
        uf: 'SP',
        municipio: 'São Paulo',
        lat: '-23.5505',
        lng: '-46.6333',
        mensalidade_anual: null,
        mensalidade_ano_ref: null,
      },
      {
        cnpj: '33.333.333/0001-33',
        nome: 'Colégio Pedro II',
        tipo: 'federal' as const,
        uf: 'RJ',
        municipio: 'Rio de Janeiro',
        lat: '-22.9068',
        lng: '-43.1729',
        mensalidade_anual: null,
        mensalidade_ano_ref: null,
      },
      {
        cnpj: '44.444.444/0001-44',
        nome: 'Colégio Santa Cruz',
        tipo: 'privada' as const,
        uf: 'SP',
        municipio: 'São Paulo',
        lat: '-23.6012',
        lng: '-46.6820',
        mensalidade_anual: '54000.00',
        mensalidade_ano_ref: 2024,
      },
    ];

    const escolasCriadas = await db.insert(escolas).values(escolasData).returning();

    logger.info('system', 'Escolas criadas', { total: escolasCriadas.length });

    // Criar notas de exemplo
    logger.info('system', 'Criando notas de exemplo');

    for (const escola of escolasCriadas) {
      // ENEM
      const enemNota = escola.tipo === 'privada' ? 750 + Math.random() * 100 : 600 + Math.random() * 80;
      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'enem',
        valor_normalizado: (enemNota / 100).toFixed(2),
        valor_original: enemNota.toFixed(2),
        escala_original: '0-1000',
        ano_referencia: 2023,
      });

      // IDEB
      const idebNota = escola.tipo === 'privada' ? 6.5 + Math.random() * 1.5 : 5.0 + Math.random() * 1.5;
      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'ideb',
        valor_normalizado: idebNota.toFixed(2),
        valor_original: idebNota.toFixed(2),
        escala_original: '0-10',
        ano_referencia: 2023,
      });

      // Aprovação (apenas para algumas escolas)
      if (Math.random() > 0.3) {
        const aprovacao = escola.tipo === 'privada' ? 70 + Math.random() * 25 : 40 + Math.random() * 30;
        await db.insert(notas).values({
          escola_id: escola.id,
          fonte: 'aprovacao_univ',
          valor_normalizado: (aprovacao / 10).toFixed(2),
          valor_original: aprovacao.toFixed(2),
          escala_original: '0-100',
          ano_referencia: 2024,
        });
      }
    }

    logger.info('system', 'Notas criadas');

    // Criar olimpíadas de exemplo
    logger.info('system', 'Criando olimpíadas de exemplo');

    for (const escola of escolasCriadas) {
      const numMedalhas = escola.tipo === 'privada' ? 3 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3);

      for (let i = 0; i < numMedalhas; i++) {
        const competicoes = ['obmep', 'obf', 'obq', 'oba'] as const;
        const niveis = ['ouro', 'prata', 'bronze', 'mencao'] as const;
        const pontosPorNivel = { ouro: 3.0, prata: 2.0, bronze: 1.0, mencao: 0.5 };

        const competicao = competicoes[Math.floor(Math.random() * competicoes.length)];
        const nivel = niveis[Math.floor(Math.random() * niveis.length)];

        await db.insert(olimpiadas).values({
          escola_id: escola.id,
          competicao,
          nivel,
          pontos: pontosPorNivel[nivel].toString(),
          edicao: 2023 + Math.floor(Math.random() * 2),
          aluno_anonimizado: `hash_${escola.id}_${i}`,
        });
      }
    }

    logger.info('system', 'Olimpíadas criadas');

    // Calcular scores
    logger.info('system', 'Calculando scores');

    for (const escola of escolasCriadas) {
      const scoreResult = await calcularScore(escola.id);
      if (scoreResult) {
        await salvarScore(scoreResult);
      }
    }

    logger.info('system', 'Scores calculados');

    // Mostrar resumo
    const resumo = await db
      .select({
        id: escolas.id,
        nome: escolas.nome,
        tipo: escolas.tipo,
        mensalidade: escolas.mensalidade_anual,
        score: scores.score_composto,
        icb: scores.icb,
      })
      .from(escolas)
      .leftJoin(scores, eq(escolas.id, scores.escola_id))
      .orderBy(scores.icb);

    logger.info('system', 'Seed concluído com sucesso');

    console.log('\n📊 RESUMO DAS ESCOLAS');
    console.log('═'.repeat(80));
    console.log('');

    for (const r of resumo) {
      console.log(`🏫 ${r.nome} (${r.tipo})`);
      console.log(`   Score: ${r.score || 'N/A'}`);
      console.log(`   Mensalidade: R$ ${r.mensalidade || 'Gratuita'}`);
      console.log(`   ICB: ${r.icb || 'N/A'}`);
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    logger.error('system', 'Erro ao fazer seed', { error });
    process.exit(1);
  }
}

seed();
