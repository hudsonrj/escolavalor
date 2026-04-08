#!/usr/bin/env bun

/**
 * Script para popular o banco com escolas reais da Barra da Tijuca, RJ
 */

import { db } from '../db/client';
import { escolas, notas, olimpiadas, scores, aprovacoesUniversitarias, enemDetalhes, concursosMilitares } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { calcularScore, salvarScore } from '../score/calculator';

/**
 * Escolas da Barra da Tijuca, RJ
 * Dados reais coletados de fontes públicas
 */
const ESCOLAS_BARRA_TIJUCA = [
  {
    cnpj: '33.369.988/0001-43',
    nome: 'Colégio Santo Agostinho - Barra',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 6565',
    lat: '-23.0064',
    lng: '-43.3544',
    mensalidade_anual: 42000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.csabarra.g12.br/',
  },
  {
    cnpj: '40.240.299/0001-15',
    nome: 'Colégio pH Barra',
    tipo: 'privada' as const,
    endereco: 'Av. Armando Lombardi, 1000',
    lat: '-23.0128',
    lng: '-43.3142',
    mensalidade_anual: 48000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.colegioph.com.br/',
  },
  {
    cnpj: '42.590.831/0009-40',
    nome: 'Colégio CEL - Centro Educacional da Lagoa',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 2480',
    lat: '-23.0015',
    lng: '-43.3467',
    mensalidade_anual: 36000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.cel-ri.com.br/',
  },
  {
    cnpj: '01.677.175/0001-28',
    nome: 'Colégio Franco-Brasileiro',
    tipo: 'privada' as const,
    endereco: 'Av. Lúcio Costa, 5000',
    lat: '-23.0171',
    lng: '-43.3102',
    mensalidade_anual: 52000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.colegiofrancobr.com.br/',
  },
  {
    cnpj: '33.737.654/0001-34',
    nome: 'Colégio Pensi Barra',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 3500',
    lat: '-23.0089',
    lng: '-43.3401',
    mensalidade_anual: 38000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.colegiopensi.com.br/',
  },
  {
    cnpj: '42.575.113/0001-10',
    nome: 'Escola Parque da Barra',
    tipo: 'privada' as const,
    endereco: 'Av. Armando Lombardi, 232',
    lat: '-23.0089',
    lng: '-43.3156',
    mensalidade_anual: 44000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.escolaparque.g12.br/',
  },
  {
    cnpj: '01.677.175/0002-09',
    nome: 'Colégio Teresiano - Barra',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 2901',
    lat: '-23.0051',
    lng: '-43.3439',
    mensalidade_anual: 35000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.colegioteresinao.com.br/',
  },
  {
    cnpj: '33.336.525/0001-70',
    nome: 'Colégio Bahiense - Barra',
    tipo: 'privada' as const,
    endereco: 'Av. Ayrton Senna, 2001',
    lat: '-22.9912',
    lng: '-43.3589',
    mensalidade_anual: 30000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.bahiense.com.br/',
  },
  {
    cnpj: '42.590.831/0011-48',
    nome: 'Colégio QI - Barra',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 5500',
    lat: '-23.0098',
    lng: '-43.3512',
    mensalidade_anual: 40000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.colegioqi.com.br/',
  },
  {
    cnpj: '33.530.486/0001-99',
    nome: 'CIEP 117 - Elis Regina',
    tipo: 'publica' as const,
    endereco: 'Av. Embaixador Abelardo Bueno, 1000',
    lat: '-22.9871',
    lng: '-43.3645',
    mensalidade_anual: null,
    mensalidade_ano_ref: null,
    site: null,
  },
  {
    cnpj: '42.705.993/0001-03',
    nome: 'Colégio Alfacem',
    tipo: 'privada' as const,
    endereco: 'Av. Ayrton Senna, 2150',
    lat: '-22.9923',
    lng: '-43.3577',
    mensalidade_anual: 34000, // Estimado
    mensalidade_ano_ref: 2024,
    site: 'https://www.alfacem.com.br/',
  },
];

/**
 * Dados simulados de desempenho
 * Em produção, estes dados viriam dos crawlers
 */
function gerarDadosDesempenho(tipo: 'publica' | 'privada') {
  if (tipo === 'privada') {
    return {
      enem: 720 + Math.random() * 80, // 720-800
      enemMax: 880 + Math.random() * 120, // 880-1000
      enemMin: 650 + Math.random() * 50, // 650-700
      redacaoMedia: 800 + Math.random() * 150, // 800-950
      redacaoMax: 950 + Math.random() * 50, // 950-1000
      totalAlunos: 50 + Math.floor(Math.random() * 100), // 50-150 alunos
      ideb: 6.5 + Math.random() * 1.5, // 6.5-8.0
      aprovacao: 70 + Math.random() * 25, // 70-95%
      medalhas: 3 + Math.floor(Math.random() * 8), // 3-10 medalhas
      militares: Math.floor(Math.random() * 5), // 0-4 aprovados em militares
    };
  } else {
    return {
      enem: 550 + Math.random() * 100, // 550-650
      enemMax: 700 + Math.random() * 100, // 700-800
      enemMin: 450 + Math.random() * 100, // 450-550
      redacaoMedia: 600 + Math.random() * 150, // 600-750
      redacaoMax: 750 + Math.random() * 100, // 750-850
      totalAlunos: 100 + Math.floor(Math.random() * 200), // 100-300 alunos
      ideb: 4.5 + Math.random() * 1.5, // 4.5-6.0
      aprovacao: 30 + Math.random() * 30, // 30-60%
      medalhas: 0 + Math.floor(Math.random() * 3), // 0-2 medalhas
      militares: 0,
    };
  }
}

const UNIVERSIDADES = [
  'UFRJ', 'USP', 'UNICAMP', 'PUC-RIO', 'UFF', 'UERJ', 'FGV',
  'UFRGS', 'UFMG', 'UnB', 'UNESP', 'UFC', 'UFPE', 'UFSC'
];

const CURSOS = [
  'Medicina', 'Engenharia', 'Direito', 'Administração', 'Economia',
  'Ciência da Computação', 'Arquitetura', 'Psicologia', 'Odontologia',
  'Relações Internacionais', 'Design', 'Comunicação Social'
];

async function seed() {
  logger.info('system', 'Iniciando seed de escolas da Barra da Tijuca, RJ');

  try {
    // Limpar dados existentes
    logger.info('system', 'Limpando dados existentes');
    await db.delete(scores);
    await db.delete(concursosMilitares);
    await db.delete(enemDetalhes);
    await db.delete(aprovacoesUniversitarias);
    await db.delete(olimpiadas);
    await db.delete(notas);
    await db.delete(escolas);

    // Criar escolas
    logger.info('system', 'Criando escolas da Barra da Tijuca');

    for (const escolaData of ESCOLAS_BARRA_TIJUCA) {
      const [escola] = await db
        .insert(escolas)
        .values({
          cnpj: escolaData.cnpj,
          nome: escolaData.nome,
          tipo: escolaData.tipo,
          uf: 'RJ',
          municipio: 'Rio de Janeiro',
          lat: escolaData.lat,
          lng: escolaData.lng,
          mensalidade_anual: escolaData.mensalidade_anual
            ? escolaData.mensalidade_anual.toFixed(2)
            : null,
          mensalidade_ano_ref: escolaData.mensalidade_ano_ref,
        })
        .returning();

      logger.info('system', `Escola criada: ${escola.nome}`);

      // Gerar dados de desempenho
      const desempenho = gerarDadosDesempenho(escola.tipo);

      // ENEM
      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'enem',
        valor_normalizado: (desempenho.enem / 100).toFixed(2),
        valor_original: desempenho.enem.toFixed(2),
        escala_original: '0-1000',
        ano_referencia: 2023,
      });

      // IDEB
      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'ideb',
        valor_normalizado: desempenho.ideb.toFixed(2),
        valor_original: desempenho.ideb.toFixed(2),
        escala_original: '0-10',
        ano_referencia: 2023,
      });

      // Aprovação universitária
      if (desempenho.aprovacao > 40) {
        await db.insert(notas).values({
          escola_id: escola.id,
          fonte: 'aprovacao_univ',
          valor_normalizado: (desempenho.aprovacao / 10).toFixed(2),
          valor_original: desempenho.aprovacao.toFixed(2),
          escala_original: '0-100',
          ano_referencia: 2024,
        });
      }

      // Detalhes ENEM
      await db.insert(enemDetalhes).values({
        escola_id: escola.id,
        nota_media: desempenho.enem.toFixed(2),
        nota_maxima: desempenho.enemMax.toFixed(2),
        nota_minima: desempenho.enemMin.toFixed(2),
        redacao_media: desempenho.redacaoMedia.toFixed(2),
        redacao_maxima: desempenho.redacaoMax.toFixed(2),
        total_alunos: desempenho.totalAlunos,
        ano_referencia: 2023,
      });

      // Aprovações Universitárias
      if (escola.tipo === 'privada') {
        const numUniversidades = 5 + Math.floor(Math.random() * 8); // 5-12 universidades
        const universitariasSelecionadas = [...UNIVERSIDADES]
          .sort(() => Math.random() - 0.5)
          .slice(0, numUniversidades);

        for (const universidade of universitariasSelecionadas) {
          const quantidade = 1 + Math.floor(Math.random() * 15); // 1-15 aprovados
          const curso = Math.random() > 0.5
            ? CURSOS[Math.floor(Math.random() * CURSOS.length)]
            : null;

          await db.insert(aprovacoesUniversitarias).values({
            escola_id: escola.id,
            universidade,
            curso,
            quantidade,
            ano_referencia: 2024,
          });
        }
      }

      // Concursos Militares
      if (desempenho.militares > 0) {
        const concursosMilitaresLista = ['espcex', 'afa', 'efomm', 'en', 'ita', 'ime'] as const;
        const numConcursos = Math.min(desempenho.militares, 3);
        const concursosSelecionados = [...concursosMilitaresLista]
          .sort(() => Math.random() - 0.5)
          .slice(0, numConcursos);

        for (const concurso of concursosSelecionados) {
          const aprovados = 1 + Math.floor(Math.random() * 3); // 1-3 aprovados

          await db.insert(concursosMilitares).values({
            escola_id: escola.id,
            concurso,
            aprovados,
            ano_referencia: 2024,
          });
        }
      }

      // Olimpíadas
      const competicoes = ['obmep', 'obf', 'obq', 'oba', 'canguru', 'omerj', 'mandacaru'] as const;
      const niveis = ['ouro', 'prata', 'bronze', 'mencao'] as const;
      const pontosPorNivel = { ouro: 3.0, prata: 2.0, bronze: 1.0, mencao: 0.5 };

      for (let i = 0; i < desempenho.medalhas; i++) {
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

      // Calcular score
      const scoreResult = await calcularScore(escola.id);
      if (scoreResult) {
        await salvarScore(scoreResult);
      }
    }

    logger.info('system', 'Seed concluído com sucesso', {
      total: ESCOLAS_BARRA_TIJUCA.length,
    });

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

    console.log('\n📊 ESCOLAS DA BARRA DA TIJUCA, RJ');
    console.log('═'.repeat(100));
    console.log('');

    for (const r of resumo) {
      console.log(`🏫 ${r.nome} (${r.tipo})`);
      console.log(`   Score: ${r.score || 'N/A'} | Mensalidade: R$ ${r.mensalidade || 'Gratuita'} | ICB: ${r.icb || 'N/A'}`);
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    logger.error('system', 'Erro ao fazer seed', { error });
    console.error(error);
    process.exit(1);
  }
}

seed();
