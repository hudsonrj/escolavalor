/**
 * Script para popular RAIO-X COMPLETO das escolas
 * Inclui: ENEM detalhado (5 anos), aprovações universitárias por curso,
 * olimpíadas, corpo docente, infraestrutura, metodologia, etc.
 */

import { db } from '../db/client';
import { escolas, notas, olimpiadas, aprovacoesUniversitarias, enemDetalhes, avaliacoesExternas } from '../db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { calcularScore } from '../score/calculator';

// Distribuições realistas por tipo
const DIST = {
  privada: {
    enem: { min: 550, max: 850, media: 680 },
    matematica: { min: 500, max: 900, media: 650 },
    linguagens: { min: 550, max: 850, media: 700 },
    humanas: { min: 550, max: 850, media: 690 },
    natureza: { min: 540, max: 870, media: 670 },
    redacao: { min: 600, max: 980, media: 750 },
    ideb: { min: 5.5, max: 9.5, media: 7.2 },
    aprovacao: { min: 55, max: 95, media: 75 },
    olimpiadas: { min: 0, max: 15, media: 4 },
  },
  publica: {
    enem: { min: 450, max: 700, media: 550 },
    matematica: { min: 400, max: 750, media: 520 },
    linguagens: { min: 450, max: 720, media: 570 },
    humanas: { min: 450, max: 700, media: 560 },
    natureza: { min: 430, max: 690, media: 540 },
    redacao: { min: 450, max: 850, media: 580 },
    ideb: { min: 4.0, max: 8.0, media: 6.0 },
    aprovacao: { min: 20, max: 70, media: 45 },
    olimpiadas: { min: 0, max: 8, media: 2 },
  },
  federal: {
    enem: { min: 650, max: 900, media: 780 },
    matematica: { min: 650, max: 950, media: 800 },
    linguagens: { min: 650, max: 900, media: 790 },
    humanas: { min: 660, max: 910, media: 795 },
    natureza: { min: 640, max: 920, media: 785 },
    redacao: { min: 750, max: 1000, media: 880 },
    ideb: { min: 7.0, max: 10.0, media: 8.5 },
    aprovacao: { min: 75, max: 98, media: 88 },
    olimpiadas: { min: 3, max: 25, media: 12 },
  },
};

const COMPETICOES = [
  'obmep', 'obf', 'obq', 'oba', 'canguru', 'omerj', 'mandacaru'
];

const NIVEIS: Array<'ouro' | 'prata' | 'bronze' | 'mencao'> = ['ouro', 'prata', 'bronze', 'mencao'];

const UNIVERSIDADES_TOP = [
  { nome: 'USP', peso: 10 },
  { nome: 'UNICAMP', peso: 9 },
  { nome: 'UFRJ', peso: 8 },
  { nome: 'UFMG', peso: 7 },
  { nome: 'UFRGS', peso: 7 },
  { nome: 'UnB', peso: 6 },
  { nome: 'UFPR', peso: 6 },
  { nome: 'UFSCar', peso: 6 },
  { nome: 'UERJ', peso: 5 },
  { nome: 'UFF', peso: 5 },
  { nome: 'UFSC', peso: 5 },
  { nome: 'UFC', peso: 4 },
  { nome: 'UFPE', peso: 4 },
  { nome: 'UFBA', peso: 4 },
  { nome: 'PUC-Rio', peso: 5 },
  { nome: 'PUC-SP', peso: 4 },
  { nome: 'Mackenzie', peso: 3 },
  { nome: 'FGV', peso: 5 },
  { nome: 'Insper', peso: 4 },
  { nome: 'ESPM', peso: 3 },
];

const CURSOS_CONCORRIDOS = [
  { nome: 'Medicina', peso: 10, nota_corte: 800 },
  { nome: 'Engenharia', peso: 8, nota_corte: 720 },
  { nome: 'Direito', peso: 7, nota_corte: 750 },
  { nome: 'Ciências da Computação', peso: 6, nota_corte: 740 },
  { nome: 'Arquitetura', peso: 5, nota_corte: 730 },
  { nome: 'Psicologia', peso: 5, nota_corte: 710 },
  { nome: 'Odontologia', peso: 4, nota_corte: 720 },
  { nome: 'Biomedicina', peso: 4, nota_corte: 700 },
  { nome: 'Farmácia', peso: 3, nota_corte: 690 },
  { nome: 'Fisioterapia', peso: 3, nota_corte: 680 },
  { nome: 'Administração', peso: 4, nota_corte: 670 },
  { nome: 'Economia', peso: 4, nota_corte: 710 },
  { nome: 'Engenharia Civil', peso: 6, nota_corte: 730 },
  { nome: 'Engenharia Elétrica', peso: 5, nota_corte: 725 },
  { nome: 'Engenharia Mecânica', peso: 5, nota_corte: 720 },
  { nome: 'Engenharia de Produção', peso: 5, nota_corte: 715 },
  { nome: 'Veterinária', peso: 4, nota_corte: 700 },
  { nome: 'Nutrição', peso: 3, nota_corte: 670 },
  { nome: 'Enfermagem', peso: 3, nota_corte: 660 },
  { nome: 'Educação Física', peso: 2, nota_corte: 640 },
];

function gerarNormal(min: number, max: number, media: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const desvio = media * 0.2;
  let valor = media + z * desvio;
  return Math.max(min, Math.min(max, valor));
}

function escolherPonderado<T extends { peso: number }>(array: T[]): T {
  const totalPeso = array.reduce((sum, item) => sum + item.peso, 0);
  let random = Math.random() * totalPeso;

  for (const item of array) {
    random -= item.peso;
    if (random <= 0) return item;
  }

  return array[array.length - 1];
}

function escolherAleatorio<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function popularRaioXCompleto(escola: any) {
  const tipo = escola.tipo as 'privada' | 'publica' | 'federal';
  const dist = DIST[tipo];

  try {
    logger.info('popular-raio-x', `Populando escola: ${escola.nome}`);

    // ========== 1. ENEM DETALHADO (ÚLTIMOS 5 ANOS) ==========
    for (let ano = 2019; ano <= 2023; ano++) {
      const notaMedia = gerarNormal(dist.enem.min, dist.enem.max, dist.enem.media);
      const variacao = ano === 2023 ? 1.0 : (0.85 + Math.random() * 0.3); // Último ano mais confiável

      const matematica = gerarNormal(dist.matematica.min, dist.matematica.max, dist.matematica.media) * variacao;
      const linguagens = gerarNormal(dist.linguagens.min, dist.linguagens.max, dist.linguagens.media) * variacao;
      const humanas = gerarNormal(dist.humanas.min, dist.humanas.max, dist.humanas.media) * variacao;
      const natureza = gerarNormal(dist.natureza.min, dist.natureza.max, dist.natureza.media) * variacao;
      const redacaoMedia = gerarNormal(dist.redacao.min, dist.redacao.max, dist.redacao.media) * variacao;

      const notaMaxima = notaMedia + (Math.random() * 80 + 40); // 40-120 pontos acima da média
      const notaMinima = notaMedia - (Math.random() * 60 + 30); // 30-90 pontos abaixo
      const redacaoMaxima = Math.min(1000, redacaoMedia + (Math.random() * 150 + 50));
      const redacaoMinima = Math.max(0, redacaoMedia - (Math.random() * 200 + 100));

      const participantes = Math.floor(escola.total_alunos * (0.12 + Math.random() * 0.08)); // 12-20% fazem ENEM

      await db.insert(enemDetalhes).values({
        escola_id: escola.id,
        ano_referencia: ano,
        nota_media: notaMedia.toFixed(2),
        nota_maxima: notaMaxima.toFixed(2),
        nota_minima: notaMinima.toFixed(2),
        matematica_media: matematica.toFixed(2),
        linguagens_media: linguagens.toFixed(2),
        ciencias_humanas_media: humanas.toFixed(2),
        ciencias_natureza_media: natureza.toFixed(2),
        redacao_media: redacaoMedia.toFixed(0),
        redacao_maxima: redacaoMaxima.toFixed(0),
        redacao_minima: redacaoMinima.toFixed(0),
        total_alunos: participantes,
      });
    }

    // ========== 2. NOTAS PRINCIPAIS (ÚLTIMO ANO) ==========
    const notaEnem = gerarNormal(dist.enem.min, dist.enem.max, dist.enem.media);
    await db.insert(notas).values({
      escola_id: escola.id,
      fonte: 'enem',
      valor_normalizado: notaEnem / 100,
      valor_original: notaEnem.toFixed(2),
      escala_original: '0-1000',
      ano_referencia: 2023,
    });

    const notaIdeb = gerarNormal(dist.ideb.min, dist.ideb.max, dist.ideb.media);
    await db.insert(notas).values({
      escola_id: escola.id,
      fonte: 'ideb',
      valor_normalizado: notaIdeb,
      valor_original: notaIdeb.toFixed(2),
      escala_original: '0-10',
      ano_referencia: 2023,
    });

    // ========== 3. APROVAÇÕES UNIVERSITÁRIAS DETALHADAS (5 ANOS) ==========
    const percentualAprovacao = gerarNormal(dist.aprovacao.min, dist.aprovacao.max, dist.aprovacao.media);
    await db.insert(notas).values({
      escola_id: escola.id,
      fonte: 'aprovacao_univ',
      valor_normalizado: percentualAprovacao / 10,
      valor_original: percentualAprovacao.toFixed(2),
      escala_original: '0-100',
      ano_referencia: 2024,
    });

    const formandosPorAno = Math.floor(escola.total_alunos * 0.12); // ~12% são formandos
    const aprovadosPorAno = Math.floor(formandosPorAno * (percentualAprovacao / 100));

    for (let ano = 2019; ano <= 2023; ano++) {
      const variacaoAno = 0.8 + Math.random() * 0.4; // ±20% por ano
      const aprovacoesAno = Math.floor(aprovadosPorAno * variacaoAno);

      // Distribuir aprovações por universidade e curso
      const distribuicao = new Map<string, Map<string, number>>();

      for (let i = 0; i < aprovacoesAno; i++) {
        const universidade = escolherPonderado(UNIVERSIDADES_TOP);
        const curso = escolherPonderado(CURSOS_CONCORRIDOS);

        // Verificar se a nota média da escola permite o curso
        if (notaEnem < curso.nota_corte - 50) {
          // Escola com nota baixa não aprova em cursos muito concorridos
          continue;
        }

        if (!distribuicao.has(universidade.nome)) {
          distribuicao.set(universidade.nome, new Map());
        }

        const cursosUniv = distribuicao.get(universidade.nome)!;
        cursosUniv.set(curso.nome, (cursosUniv.get(curso.nome) || 0) + 1);
      }

      // Inserir no banco
      for (const [universidade, cursos] of distribuicao) {
        for (const [curso, quantidade] of cursos) {
          await db.insert(aprovacoesUniversitarias).values({
            escola_id: escola.id,
            universidade,
            curso,
            quantidade,
            ano_referencia: ano,
          });
        }
      }
    }

    // ========== 4. OLIMPÍADAS DETALHADAS ==========
    const totalOlimpiadas = Math.floor(gerarNormal(dist.olimpiadas.min, dist.olimpiadas.max, dist.olimpiadas.media));

    // Distribuição realista de medalhas
    const distribuicaoMedalhas = {
      ouro: Math.floor(totalOlimpiadas * 0.15), // 15% ouro
      prata: Math.floor(totalOlimpiadas * 0.25), // 25% prata
      bronze: Math.floor(totalOlimpiadas * 0.35), // 35% bronze
      mencao: Math.floor(totalOlimpiadas * 0.25), // 25% menção
    };

    let medalhasInseridas = 0;
    for (const [nivel, quantidade] of Object.entries(distribuicaoMedalhas)) {
      for (let i = 0; i < quantidade; i++) {
        const competicao = escolherAleatorio(COMPETICOES);
        const pontos = { ouro: 3, prata: 2, bronze: 1, mencao: 0.5 }[nivel];

        await db.insert(olimpiadas).values({
          escola_id: escola.id,
          competicao,
          nivel: nivel as 'ouro' | 'prata' | 'bronze' | 'mencao',
          pontos,
          edicao: 2024,
          aluno_anonimizado: `hash_${escola.id}_2024_${medalhasInseridas}`,
        });

        medalhasInseridas++;
      }
    }

    // ========== 5. AVALIAÇÕES EXTERNAS ==========
    // Gerar avaliações baseadas na qualidade da escola
    const qualidade = (notaEnem / 1000) + (notaIdeb / 10) + (percentualAprovacao / 100);
    const notaAvaliacao = Math.min(5, Math.max(1, (qualidade / 3) * 5));

    const plataformas = ['reclame_aqui', 'google', 'facebook'];
    const categorias = ['infraestrutura', 'ensino', 'atendimento', 'comunicacao'];

    for (const plataforma of plataformas) {
      for (const categoria of categorias) {
        const totalAvaliacoes = Math.floor(Math.random() * 50 + 10);
        const notaCategoria = notaAvaliacao + (Math.random() - 0.5) * 1.5; // ±0.75

        await db.insert(avaliacoesExternas).values({
          escola_id: escola.id,
          plataforma,
          categoria,
          nota_media: Math.max(1, Math.min(5, notaCategoria)).toFixed(2),
          total_avaliacoes: totalAvaliacoes,
          mes_referencia: 4, // Abril (mês atual)
          ano_referencia: 2024,
        });
      }
    }

    // ========== 6. CALCULAR SCORE FINAL ==========
    await calcularScore(escola.id);

    logger.info('popular-raio-x', `✓ Escola ${escola.nome} populada com sucesso`);
    return true;

  } catch (error) {
    logger.error('popular-raio-x', `Erro ao popular escola ${escola.nome}`, { error });
    return false;
  }
}

async function executarPopulacao(limite: number = 1000) {
  logger.info('popular-raio-x', `Iniciando população de raio-x completo (limite: ${limite})`);

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

  logger.info('popular-raio-x', `Encontradas ${escolasSemDados.length} escolas sem dados`);

  let sucesso = 0;
  let falhas = 0;

  for (const escola of escolasSemDados) {
    const resultado = await popularRaioXCompleto(escola);

    if (resultado) {
      sucesso++;
    } else {
      falhas++;
    }

    if (sucesso % 25 === 0) {
      logger.info('popular-raio-x', `Progresso: ${sucesso}/${escolasSemDados.length} (${((sucesso/escolasSemDados.length)*100).toFixed(1)}%)`);
    }

    // Delay para não sobrecarregar
    if (sucesso % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  logger.info('popular-raio-x', '✅ População completa finalizada', {
    total: escolasSemDados.length,
    sucesso,
    falhas,
    taxa_sucesso: `${((sucesso/escolasSemDados.length)*100).toFixed(1)}%`,
  });

  return { total: escolasSemDados.length, sucesso, falhas };
}

// Executar
if (import.meta.main) {
  const limite = parseInt(process.argv[2]) || 1000;

  executarPopulacao(limite)
    .then(({ total, sucesso, falhas }) => {
      console.log(`\n✅ CONCLUÍDO!`);
      console.log(`   Total: ${total} escolas`);
      console.log(`   Sucesso: ${sucesso}`);
      console.log(`   Falhas: ${falhas}`);
      console.log(`   Taxa: ${((sucesso/total)*100).toFixed(1)}%\n`);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('popular-raio-x', 'Erro fatal', { error });
      process.exit(1);
    });
}

export { executarPopulacao, popularRaioXCompleto };
