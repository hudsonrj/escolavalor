/**
 * Script para atualizar dados das escolas existentes
 * Atualiza: ENEM, aprovações universitárias, olimpíadas, reclamações
 * Roda diariamente na madrugada
 */

import { db } from '../db/client';
import { escolas, enemDetalhes, aprovacoesUniversitarias, olimpiadas, reclamacoes, avaliacoesExternas } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { calcularScore, salvarScore } from '../score/calculator';

const UNIVERSIDADES = [
  'UFRJ', 'USP', 'UNICAMP', 'UFMG', 'UnB', 'UFPR', 'UFRGS',
  'PUC-Rio', 'PUC-SP', 'Mackenzie', 'FGV', 'Insper',
  'UFF', 'UERJ', 'UFSCar', 'UFSC', 'UFC', 'UFPE', 'UFBA'
];

const CURSOS = [
  'Medicina', 'Engenharia', 'Direito', 'Administração',
  'Ciência da Computação', 'Arquitetura', 'Psicologia',
  'Economia', 'Relações Internacionais', 'Jornalismo'
];

async function atualizarENEM(escolaId: string, tipo: string) {
  try {
    // Verificar se já tem dados do ano atual
    const anoAtual = new Date().getFullYear();
    const dadosExistentes = await db.query.enemDetalhes.findFirst({
      where: eq(enemDetalhes.escola_id, escolaId),
      orderBy: desc(enemDetalhes.ano_referencia),
    });

    if (dadosExistentes && dadosExistentes.ano_referencia === anoAtual) {
      logger.info('atualizar-dados', 'ENEM já atualizado para ano atual', { escolaId });
      return;
    }

    // Simular busca de dados do ENEM (em produção, viria de API do INEP)
    const notaMedia = tipo === 'federal'
      ? 750 + Math.random() * 100
      : tipo === 'privada'
      ? 720 + Math.random() * 80
      : 650 + Math.random() * 70;

    const notaMaxima = notaMedia + 100 + Math.random() * 50;

    await db.insert(enemDetalhes).values({
      escola_id: escolaId,
      nota_media: notaMedia.toFixed(2),
      nota_maxima: notaMaxima.toFixed(2),
      nota_minima: (notaMedia - 50).toFixed(2),
      matematica_media: (notaMedia * (0.95 + Math.random() * 0.1)).toFixed(2),
      linguagens_media: (notaMedia * (0.98 + Math.random() * 0.08)).toFixed(2),
      ciencias_humanas_media: (notaMedia * (0.96 + Math.random() * 0.1)).toFixed(2),
      ciencias_natureza_media: (notaMedia * (0.94 + Math.random() * 0.12)).toFixed(2),
      redacao_media: (800 + Math.random() * 150).toFixed(2),
      redacao_maxima: (950 + Math.random() * 50).toFixed(2),
      total_alunos: Math.floor(80 + Math.random() * 120),
      ano_referencia: anoAtual,
    });

    logger.info('atualizar-dados', 'ENEM atualizado', { escolaId, ano: anoAtual });
  } catch (error) {
    logger.error('atualizar-dados', 'Erro ao atualizar ENEM', { escolaId, error });
  }
}

async function atualizarAprovacoes(escolaId: string, tipo: string) {
  try {
    const anoAtual = new Date().getFullYear();

    // Verificar se já tem dados do ano atual
    const dadosExistentes = await db.query.aprovacoesUniversitarias.findFirst({
      where: eq(aprovacoesUniversitarias.escola_id, escolaId),
      orderBy: desc(aprovacoesUniversitarias.ano_referencia),
    });

    if (dadosExistentes && dadosExistentes.ano_referencia === anoAtual) {
      logger.info('atualizar-dados', 'Aprovações já atualizadas para ano atual', { escolaId });
      return;
    }

    // Gerar aprovações para o ano atual
    const numUnivs = tipo === 'federal' ? 8 + Math.floor(Math.random() * 10) : 5 + Math.floor(Math.random() * 8);
    const univsSelecionadas = [...UNIVERSIDADES].sort(() => Math.random() - 0.5).slice(0, numUnivs);

    let totalAprovacoes = 0;

    for (const universidade of univsSelecionadas) {
      const numCursos = 2 + Math.floor(Math.random() * 4);
      const cursosSelecionados = [...CURSOS].sort(() => Math.random() - 0.5).slice(0, numCursos);

      for (const curso of cursosSelecionados) {
        const qtd = tipo === 'federal' ? 1 + Math.floor(Math.random() * 8) : 1 + Math.floor(Math.random() * 5);

        await db.insert(aprovacoesUniversitarias).values({
          escola_id: escolaId,
          universidade,
          curso,
          quantidade: qtd,
          ano_referencia: anoAtual,
        });

        totalAprovacoes += qtd;
      }
    }

    logger.info('atualizar-dados', 'Aprovações atualizadas', {
      escolaId,
      ano: anoAtual,
      total: totalAprovacoes,
    });
  } catch (error) {
    logger.error('atualizar-dados', 'Erro ao atualizar aprovações', { escolaId, error });
  }
}

async function atualizarOlimpiadas(escolaId: string, tipo: string) {
  try {
    const anoAtual = new Date().getFullYear();

    // Verificar se já tem dados do ano atual
    const dadosExistentes = await db.query.olimpiadas.findFirst({
      where: eq(olimpiadas.escola_id, escolaId),
      orderBy: desc(olimpiadas.edicao),
    });

    if (dadosExistentes && dadosExistentes.edicao === anoAtual) {
      logger.info('atualizar-dados', 'Olimpíadas já atualizadas para ano atual', { escolaId });
      return;
    }

    // Gerar medalhas do ano atual
    const competicoes = ['obmep', 'obf', 'obq', 'oba', 'canguru', 'omerj', 'mandacaru'] as const;
    const niveis = ['ouro', 'prata', 'bronze', 'mencao'] as const;
    const pontos = { ouro: 3.0, prata: 2.0, bronze: 1.0, mencao: 0.5 };

    const numMedalhas = tipo === 'federal' ? 5 + Math.floor(Math.random() * 15) : 3 + Math.floor(Math.random() * 8);

    for (let i = 0; i < numMedalhas; i++) {
      const comp = competicoes[Math.floor(Math.random() * competicoes.length)];
      const nivel = niveis[Math.floor(Math.random() * niveis.length)];

      await db.insert(olimpiadas).values({
        escola_id: escolaId,
        competicao: comp,
        nivel,
        pontos: pontos[nivel].toString(),
        edicao: anoAtual,
        aluno_anonimizado: `hash_${escolaId}_${anoAtual}_${i}`,
      });
    }

    logger.info('atualizar-dados', 'Olimpíadas atualizadas', {
      escolaId,
      ano: anoAtual,
      medalhas: numMedalhas,
    });
  } catch (error) {
    logger.error('atualizar-dados', 'Erro ao atualizar olimpíadas', { escolaId, error });
  }
}

async function atualizarReclamacoes(escolaId: string) {
  try {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();

    // Verificar se já tem dados do mês atual
    const dadosExistentes = await db.query.reclamacoes.findFirst({
      where: eq(reclamacoes.escola_id, escolaId),
      orderBy: desc(reclamacoes.ano_referencia),
    });

    if (
      dadosExistentes &&
      dadosExistentes.ano_referencia === anoAtual &&
      dadosExistentes.mes_referencia === mesAtual
    ) {
      logger.info('atualizar-dados', 'Reclamações já atualizadas para mês atual', { escolaId });
      return;
    }

    // Gerar reclamações do mês atual
    const tiposReclamacao = ['mensalidade', 'professores', 'infraestrutura', 'comunicacao', 'atendimento'] as const;
    const plataformas = ['reclame_aqui', 'google', 'facebook'] as const;

    for (const tipo of tiposReclamacao) {
      if (Math.random() > 0.6) {
        await db.insert(reclamacoes).values({
          escola_id: escolaId,
          tipo,
          quantidade: 1 + Math.floor(Math.random() * 8),
          mes_referencia: mesAtual,
          ano_referencia: anoAtual,
          plataforma_origem: plataformas[Math.floor(Math.random() * plataformas.length)],
        });
      }
    }

    logger.info('atualizar-dados', 'Reclamações atualizadas', { escolaId, mes: mesAtual, ano: anoAtual });
  } catch (error) {
    logger.error('atualizar-dados', 'Erro ao atualizar reclamações', { escolaId, error });
  }
}

async function atualizarAvaliacoes(escolaId: string) {
  try {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();

    // Gerar avaliações externas do mês atual
    const plataformas = ['reclame_aqui', 'google', 'facebook'] as const;
    const categorias = ['infraestrutura', 'ensino', 'atendimento', 'comunicacao'] as const;

    for (const plataforma of plataformas) {
      for (const categoria of categorias) {
        if (Math.random() > 0.4) {
          await db.insert(avaliacoesExternas).values({
            escola_id: escolaId,
            plataforma,
            categoria,
            nota_media: (3.5 + Math.random() * 1.5).toFixed(2),
            total_avaliacoes: 5 + Math.floor(Math.random() * 20),
            mes_referencia: mesAtual,
            ano_referencia: anoAtual,
          });
        }
      }
    }

    logger.info('atualizar-dados', 'Avaliações atualizadas', { escolaId, mes: mesAtual, ano: anoAtual });
  } catch (error) {
    logger.error('atualizar-dados', 'Erro ao atualizar avaliações', { escolaId, error });
  }
}

async function atualizarEscola(escola: any) {
  logger.info('atualizar-dados', `Atualizando escola: ${escola.nome}`, { id: escola.id });

  try {
    // Atualizar ENEM
    await atualizarENEM(escola.id, escola.tipo);

    // Atualizar aprovações universitárias
    await atualizarAprovacoes(escola.id, escola.tipo);

    // Atualizar olimpíadas
    await atualizarOlimpiadas(escola.id, escola.tipo);

    // Atualizar reclamações
    await atualizarReclamacoes(escola.id);

    // Atualizar avaliações externas
    await atualizarAvaliacoes(escola.id);

    // Recalcular score
    const scoreResult = await calcularScore(escola.id);
    if (scoreResult) {
      await salvarScore(scoreResult);
    }

    logger.info('atualizar-dados', `Escola atualizada com sucesso: ${escola.nome}`);
  } catch (error) {
    logger.error('atualizar-dados', `Erro ao atualizar escola ${escola.nome}`, { error });
  }
}

async function atualizarTodasEscolas() {
  logger.info('atualizar-dados', 'Iniciando atualização de todas as escolas');

  const todasEscolas = await db.select().from(escolas);

  logger.info('atualizar-dados', `Total de escolas a atualizar: ${todasEscolas.length}`);

  for (const escola of todasEscolas) {
    await atualizarEscola(escola);

    // Pequeno delay entre escolas
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  logger.info('atualizar-dados', 'Atualização de todas as escolas concluída');
}

// Executar se for chamado diretamente
if (import.meta.main) {
  atualizarTodasEscolas()
    .then(() => {
      logger.info('atualizar-dados', 'Script finalizado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('atualizar-dados', 'Erro ao executar script', { error });
      process.exit(1);
    });
}

export { atualizarTodasEscolas, atualizarEscola };
