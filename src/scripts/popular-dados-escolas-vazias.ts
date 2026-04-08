/**
 * Script para popular dados das escolas que estão sem notas/olimpíadas/aprovações
 * Gera dados simulados realistas baseados no tipo de escola
 */

import { db } from '../db/client';
import { escolas, notas, olimpiadas, aprovacoesUniversitarias } from '../db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { calcularScore } from '../score/calculator';

// Distribuições realistas por tipo de escola
const DISTRIBUICOES = {
  privada: {
    enem: { min: 550, max: 850, media: 680 },
    ideb: { min: 5.5, max: 9.5, media: 7.2 },
    aprovacao: { min: 55, max: 95, media: 75 },
    olimpiadas: { min: 0, max: 15, media: 4 },
  },
  publica: {
    enem: { min: 450, max: 700, media: 550 },
    ideb: { min: 4.0, max: 8.0, media: 6.0 },
    aprovacao: { min: 20, max: 70, media: 45 },
    olimpiadas: { min: 0, max: 8, media: 2 },
  },
  federal: {
    enem: { min: 650, max: 900, media: 780 },
    ideb: { min: 7.0, max: 10.0, media: 8.5 },
    aprovacao: { min: 75, max: 98, media: 88 },
    olimpiadas: { min: 3, max: 25, media: 12 },
  },
};

const COMPETICOES = ['obmep', 'obf', 'obq', 'oba', 'canguru'];
const NIVEIS: Array<'ouro' | 'prata' | 'bronze' | 'mencao'> = ['ouro', 'prata', 'bronze', 'mencao'];
const UNIVERSIDADES = [
  'UFRJ', 'USP', 'UNICAMP', 'UFF', 'UERJ', 'PUC-Rio', 'UNESP', 'UFSCar',
  'UFMG', 'UnB', 'UFPR', 'UFRGS', 'UFC', 'UFPE', 'UFBA'
];
const CURSOS = [
  'Medicina', 'Engenharia', 'Direito', 'Administração', 'Psicologia',
  'Arquitetura', 'Ciências da Computação', 'Economia', 'Biomedicina',
  'Odontologia', 'Farmácia', 'Fisioterapia', 'Nutrição'
];

function gerarValorRealista(min: number, max: number, media: number): number {
  // Distribuição normal aproximada
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Aplicar desvio padrão de ~20% da média
  const desvio = media * 0.2;
  let valor = media + z * desvio;

  // Garantir que está dentro dos limites
  valor = Math.max(min, Math.min(max, valor));

  return valor;
}

function escolherAleatorio<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function popularDadosEscola(escola: any) {
  const tipo = escola.tipo as 'privada' | 'publica' | 'federal';
  const dist = DISTRIBUICOES[tipo];

  try {
    // 1. Gerar nota ENEM
    const notaEnem = gerarValorRealista(dist.enem.min, dist.enem.max, dist.enem.media);
    await db.insert(notas).values({
      escola_id: escola.id,
      fonte: 'enem',
      valor_normalizado: notaEnem / 100, // Normalizar para 0-10
      valor_original: notaEnem.toFixed(2),
      escala_original: '0-1000',
      ano_referencia: 2023,
    });

    // 2. Gerar nota IDEB
    const notaIdeb = gerarValorRealista(dist.ideb.min, dist.ideb.max, dist.ideb.media);
    await db.insert(notas).values({
      escola_id: escola.id,
      fonte: 'ideb',
      valor_normalizado: notaIdeb,
      valor_original: notaIdeb.toFixed(2),
      escala_original: '0-10',
      ano_referencia: 2023,
    });

    // 3. Gerar aprovações universitárias
    const percentualAprovacao = gerarValorRealista(dist.aprovacao.min, dist.aprovacao.max, dist.aprovacao.media);
    await db.insert(notas).values({
      escola_id: escola.id,
      fonte: 'aprovacao_univ',
      valor_normalizado: percentualAprovacao / 10, // Normalizar para 0-10
      valor_original: percentualAprovacao.toFixed(2),
      escala_original: '0-100',
      ano_referencia: 2024,
    });

    // 4. Gerar aprovações universitárias detalhadas (últimos 3 anos)
    const totalAlunosFormandos = Math.floor(escola.total_alunos * 0.15); // ~15% são formandos
    const alunosAprovados = Math.floor(totalAlunosFormandos * (percentualAprovacao / 100));

    for (let ano = 2022; ano <= 2024; ano++) {
      const aprovacoesAno = Math.floor(alunosAprovados / 3 + (Math.random() - 0.5) * 5);

      for (let i = 0; i < aprovacoesAno && i < 20; i++) {
        await db.insert(aprovacoesUniversitarias).values({
          escola_id: escola.id,
          universidade: escolherAleatorio(UNIVERSIDADES),
          curso: escolherAleatorio(CURSOS),
          quantidade: 1,
          ano_referencia: ano,
        });
      }
    }

    // 5. Gerar medalhas de olimpíadas
    const totalOlimpiadas = Math.floor(gerarValorRealista(dist.olimpiadas.min, dist.olimpiadas.max, dist.olimpiadas.media));

    for (let i = 0; i < totalOlimpiadas; i++) {
      const nivel = escolherAleatorio(NIVEIS);
      const pontos = {
        ouro: 3,
        prata: 2,
        bronze: 1,
        mencao: 0.5,
      }[nivel];

      await db.insert(olimpiadas).values({
        escola_id: escola.id,
        competicao: escolherAleatorio(COMPETICOES),
        nivel,
        pontos,
        edicao: 2024,
        aluno_anonimizado: `hash_${escola.id}_2024_${i}`,
      });
    }

    // 6. Calcular score
    await calcularScore(escola.id);

    return true;
  } catch (error) {
    logger.error('popular-dados', `Erro ao popular escola ${escola.nome}`, { error });
    return false;
  }
}

async function popularTodasEscolasVazias(limite: number = 1000) {
  logger.info('popular-dados', `Buscando escolas sem dados (limite: ${limite})`);

  // Buscar escolas que não têm notas
  const escolasSemDados = await db
    .select({
      id: escolas.id,
      nome: escolas.nome,
      tipo: escolas.tipo,
      total_alunos: escolas.total_alunos,
    })
    .from(escolas)
    .leftJoin(notas, eq(escolas.id, notas.escola_id))
    .where(isNull(notas.id))
    .limit(limite);

  logger.info('popular-dados', `Encontradas ${escolasSemDados.length} escolas sem dados`);

  let sucesso = 0;
  let falhas = 0;

  for (const escola of escolasSemDados) {
    const resultado = await popularDadosEscola(escola);

    if (resultado) {
      sucesso++;
    } else {
      falhas++;
    }

    if (sucesso % 50 === 0) {
      logger.info('popular-dados', `Progresso: ${sucesso}/${escolasSemDados.length} escolas populadas`);
    }

    // Delay a cada 25 escolas
    if (sucesso % 25 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  logger.info('popular-dados', 'População de dados concluída', {
    total: escolasSemDados.length,
    sucesso,
    falhas,
  });

  return { total: escolasSemDados.length, sucesso, falhas };
}

// Executar se chamado diretamente
if (import.meta.main) {
  const limite = parseInt(process.argv[2]) || 1000;

  popularTodasEscolasVazias(limite)
    .then(({ total, sucesso, falhas }) => {
      logger.info('popular-dados', `✅ Script finalizado!`, {
        total,
        sucesso,
        falhas,
      });
      process.exit(0);
    })
    .catch((error) => {
      logger.error('popular-dados', 'Erro ao executar script', { error });
      process.exit(1);
    });
}

export { popularTodasEscolasVazias, popularDadosEscola };
