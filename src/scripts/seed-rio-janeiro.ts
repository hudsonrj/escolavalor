#!/usr/bin/env bun

/**
 * Script para popular o banco com escolas do Rio de Janeiro
 */

import { db } from '../db/client';
import { escolas, notas, olimpiadas, scores, aprovacoesUniversitarias, enemDetalhes, concursosMilitares, informacoesEscola, avaliacoesExternas, reclamacoes } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { calcularScore, salvarScore } from '../score/calculator';

/**
 * Escolas do Rio de Janeiro
 * Dados reais de escolas renomadas
 */
const ESCOLAS_RIO_JANEIRO = [
  // Zona Sul
  {
    cnpj: '33.369.988/0001-43',
    nome: 'Colégio Santo Agostinho - Barra',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    endereco: 'Av. das Américas, 6565',
    cep: '22793-081',
    mensalidade_anual: 42000,
    rede: 'Rede Jesuíta de Educação',
    lat: '-23.0064',
    lng: '-43.3544',
  },
  {
    cnpj: '42.705.993/0001-03',
    nome: 'Colégio Alfacem',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: 34000,
  },
  {
    cnpj: '40.240.299/0001-15',
    nome: 'Colégio pH Barra',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: 48000,
  },
  {
    cnpj: '33.743.303/0001-13',
    nome: 'Colégio Santo Inácio',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Botafogo',
    mensalidade_anual: 45000,
  },
  {
    cnpj: '31.556.501/0001-62',
    nome: 'Colégio São Vicente de Paulo',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Cosme Velho',
    mensalidade_anual: 38000,
  },
  {
    cnpj: '33.648.613/0001-93',
    nome: 'Colégio Andrews',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Ipanema',
    mensalidade_anual: 52000,
  },
  {
    cnpj: '30.318.213/0001-73',
    nome: 'Colégio PH Copacabana',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Copacabana',
    mensalidade_anual: 46000,
  },
  {
    cnpj: '33.832.447/0001-06',
    nome: 'Escola Parque',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Gávea',
    mensalidade_anual: 50000,
  },
  {
    cnpj: '33.017.844/0001-02',
    nome: 'Colégio São Bento',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Centro',
    mensalidade_anual: 28000,
  },
  {
    cnpj: '34.076.233/0001-88',
    nome: 'Colégio Pedro II - Centro',
    tipo: 'federal' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Centro',
    mensalidade_anual: null,
  },
  // Zona Norte
  {
    cnpj: '33.458.275/0001-61',
    nome: 'Colégio Pedro II - Tijuca',
    tipo: 'federal' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Tijuca',
    mensalidade_anual: null,
  },
  {
    cnpj: '42.486.025/0001-58',
    nome: 'Colégio Mopi',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Tijuca',
    mensalidade_anual: 32000,
  },
  {
    cnpj: '33.629.950/0001-16',
    nome: 'Colégio e Curso Intellectus',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Vila Isabel',
    mensalidade_anual: 30000,
  },
  {
    cnpj: '42.684.361/0001-04',
    nome: 'Colégio São Paulo',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Vila Isabel',
    mensalidade_anual: 29000,
  },
  {
    cnpj: '31.451.168/0001-98',
    nome: 'Colégio Estadual André Maurois',
    tipo: 'publica' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Tijuca',
    mensalidade_anual: null,
  },
  {
    cnpj: '33.740.098/0001-76',
    nome: 'CAp UERJ',
    tipo: 'publica' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Maracanã',
    mensalidade_anual: null,
  },
  // Zona Oeste
  {
    cnpj: '42.590.831/0009-40',
    nome: 'Colégio CEL',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: 36000,
  },
  {
    cnpj: '01.677.175/0001-28',
    nome: 'Colégio Franco-Brasileiro',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: 52000,
  },
  {
    cnpj: '33.737.654/0001-34',
    nome: 'Colégio Pensi Barra',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: 38000,
  },
  {
    cnpj: '42.575.113/0001-10',
    nome: 'Escola Parque da Barra',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: 44000,
  },
  {
    cnpj: '33.336.525/0001-70',
    nome: 'Colégio Bahiense',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: 30000,
  },
  {
    cnpj: '42.590.831/0011-48',
    nome: 'Colégio QI',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: 40000,
  },
  {
    cnpj: '01.677.175/0002-09',
    nome: 'Colégio Teresiano',
    tipo: 'privada' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Recreio',
    mensalidade_anual: 35000,
  },
  // Escolas públicas federais e estaduais
  {
    cnpj: '33.530.486/0001-99',
    nome: 'CIEP 117 Elis Regina',
    tipo: 'publica' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Barra da Tijuca',
    mensalidade_anual: null,
  },
  {
    cnpj: '42.833.883/0001-06',
    nome: 'Colégio Estadual Visconde de Cairu',
    tipo: 'publica' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Méier',
    mensalidade_anual: null,
  },
  {
    cnpj: '31.538.204/0001-77',
    nome: 'Colégio Estadual Amaro Cavalcanti',
    tipo: 'publica' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Catete',
    mensalidade_anual: null,
  },
  {
    cnpj: '33.458.275/0002-42',
    nome: 'Colégio Pedro II - São Cristóvão',
    tipo: 'federal' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'São Cristóvão',
    mensalidade_anual: null,
  },
  {
    cnpj: '33.458.275/0003-23',
    nome: 'Colégio Pedro II - Humaitá',
    tipo: 'federal' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Humaitá',
    mensalidade_anual: null,
  },
  {
    cnpj: '33.458.275/0004-04',
    nome: 'Colégio Pedro II - Engenho Novo',
    tipo: 'federal' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Engenho Novo',
    mensalidade_anual: null,
  },
  {
    cnpj: '31.977.462/0001-83',
    nome: 'Colégio Militar do Rio de Janeiro',
    tipo: 'federal' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Tijuca',
    mensalidade_anual: null,
  },
  {
    cnpj: '05.883.739/0001-11',
    nome: 'CEFET-RJ',
    tipo: 'federal' as const,
    municipio: 'Rio de Janeiro',
    bairro: 'Maracanã',
    mensalidade_anual: null,
  },
];

const UNIVERSIDADES = [
  'UFRJ', 'USP', 'UNICAMP', 'PUC-RIO', 'UFF', 'UERJ', 'FGV',
  'UFRGS', 'UFMG', 'UnB', 'UNESP', 'UFC', 'UFPE', 'UFSC',
  'UFRGS', 'PUC-SP', 'Mackenzie', 'ESPM', 'Ibmec', 'Insper'
];

const CURSOS = [
  'Medicina', 'Engenharia', 'Direito', 'Administração', 'Economia',
  'Ciência da Computação', 'Arquitetura', 'Psicologia', 'Odontologia',
  'Relações Internacionais', 'Design', 'Comunicação Social', 'Física',
  'Matemática', 'Biologia', 'Química', 'Farmácia', 'Veterinária'
];

const ATIVIDADES_EXTRACURRICULARES = [
  'Robótica', 'Xadrez', 'Teatro', 'Música', 'Dança', 'Artes Plásticas',
  'Futebol', 'Vôlei', 'Basquete', 'Natação', 'Judô', 'Capoeira',
  'Programação', 'Astronomia', 'Jornalismo', 'Debate', 'Fotografia',
  'Culinária', 'Línguas Estrangeiras', 'Coral', 'Banda', 'Cinema'
];

const INFRAESTRUTURA = [
  'Laboratório de Ciências', 'Laboratório de Informática', 'Biblioteca',
  'Quadra Poliesportiva', 'Piscina', 'Auditório', 'Teatro',
  'Ateliê de Artes', 'Sala de Música', 'Cantina', 'Refeitório',
  'Parque Infantil', 'Área Verde', 'Enfermaria', 'Sala Multimídia'
];

const DIFERENCIAIS_PRIVADA = [
  'Programa bilíngue',
  'Preparação para exames internacionais',
  'Intercâmbio cultural',
  'Material didático diferenciado',
  'Programa de orientação profissional',
  'Parceria com universidades',
  'Projetos de empreendedorismo',
  'Aulas de campo frequentes',
  'Programa socioemocional'
];

const DIFERENCIAIS_FEDERAL = [
  'Tradição centenária',
  'Excelência acadêmica reconhecida',
  'Professores mestres e doutores',
  'Forte preparação para vestibulares',
  'Projeto de iniciação científica',
  'Educação pública de qualidade',
  'Diversidade sociocultural',
  'Olimpíadas científicas'
];

const METODOLOGIAS = ['tradicional', 'construtivista', 'sociointeracionista', 'internacional'] as const;

const CERTIFICACOES = [
  'Cambridge English',
  'TOEFL',
  'DELF (Francês)',
  'DELE (Espanhol)',
  'Goethe-Institut (Alemão)',
  'IB (International Baccalaureate)',
  'AP (Advanced Placement)',
  'ISO 9001',
];

const IDIOMAS = [
  'Inglês',
  'Espanhol',
  'Francês',
  'Alemão',
  'Mandarim',
  'Italiano',
  'Japonês',
];

function gerarDadosDesempenho(tipo: 'publica' | 'privada' | 'federal') {
  if (tipo === 'privada') {
    return {
      enem: 720 + Math.random() * 80,
      enemMax: 880 + Math.random() * 120,
      enemMin: 650 + Math.random() * 50,
      redacaoMedia: 800 + Math.random() * 150,
      redacaoMax: 950 + Math.random() * 50,
      totalAlunos: 50 + Math.floor(Math.random() * 100),
      ideb: 6.5 + Math.random() * 1.5,
      aprovacao: 70 + Math.random() * 25,
      medalhas: 3 + Math.floor(Math.random() * 8),
      militares: Math.floor(Math.random() * 5),
    };
  } else if (tipo === 'federal') {
    return {
      enem: 750 + Math.random() * 100,
      enemMax: 900 + Math.random() * 100,
      enemMin: 680 + Math.random() * 70,
      redacaoMedia: 820 + Math.random() * 150,
      redacaoMax: 960 + Math.random() * 40,
      totalAlunos: 80 + Math.floor(Math.random() * 120),
      ideb: 7.0 + Math.random() * 1.5,
      aprovacao: 75 + Math.random() * 20,
      medalhas: 5 + Math.floor(Math.random() * 15),
      militares: 2 + Math.floor(Math.random() * 8),
    };
  } else {
    return {
      enem: 550 + Math.random() * 100,
      enemMax: 700 + Math.random() * 100,
      enemMin: 450 + Math.random() * 100,
      redacaoMedia: 600 + Math.random() * 150,
      redacaoMax: 750 + Math.random() * 100,
      totalAlunos: 100 + Math.floor(Math.random() * 200),
      ideb: 4.5 + Math.random() * 1.5,
      aprovacao: 30 + Math.random() * 30,
      medalhas: 0 + Math.floor(Math.random() * 3),
      militares: 0,
    };
  }
}

async function seed() {
  logger.info('system', 'Iniciando seed de escolas do Rio de Janeiro');

  try {
    logger.info('system', 'Limpando dados existentes');
    await db.delete(scores);
    await db.delete(avaliacoesExternas);
    await db.delete(informacoesEscola);
    await db.delete(concursosMilitares);
    await db.delete(enemDetalhes);
    await db.delete(aprovacoesUniversitarias);
    await db.delete(olimpiadas);
    await db.delete(notas);
    await db.delete(escolas);

    logger.info('system', 'Criando escolas do Rio de Janeiro');

    for (const escolaData of ESCOLAS_RIO_JANEIRO) {
      const [escola] = await db
        .insert(escolas)
        .values({
          cnpj: escolaData.cnpj,
          nome: escolaData.nome,
          tipo: escolaData.tipo,
          uf: 'RJ',
          municipio: escolaData.municipio,
          mensalidade_anual: escolaData.mensalidade_anual
            ? escolaData.mensalidade_anual.toFixed(2)
            : null,
          mensalidade_ano_ref: escolaData.mensalidade_anual ? 2024 : null,
        })
        .returning();

      logger.info('system', `Escola criada: ${escola.nome} (${escolaData.bairro})`);

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

      // Aprovações Universitárias - últimos 5 anos (2020-2024)
      if (escola.tipo === 'privada' || escola.tipo === 'federal') {
        for (let ano = 2020; ano <= 2024; ano++) {
          const numUniversidades = escola.tipo === 'federal' ? 8 + Math.floor(Math.random() * 10) : 5 + Math.floor(Math.random() * 8);
          const universitariasSelecionadas = [...UNIVERSIDADES]
            .sort(() => Math.random() - 0.5)
            .slice(0, numUniversidades);

          for (const universidade of universitariasSelecionadas) {
            // Para cada universidade, gerar aprovações em múltiplos cursos
            const numCursos = 2 + Math.floor(Math.random() * 4); // 2-5 cursos por universidade
            const cursosSelecionados = [...CURSOS]
              .sort(() => Math.random() - 0.5)
              .slice(0, numCursos);

            for (const curso of cursosSelecionados) {
              const quantidade = escola.tipo === 'federal'
                ? 1 + Math.floor(Math.random() * 8) // 1-8 alunos por curso/ano
                : 1 + Math.floor(Math.random() * 5); // 1-5 alunos por curso/ano

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
      }

      // Concursos Militares
      if (desempenho.militares > 0) {
        const concursosMilitaresLista = ['espcex', 'afa', 'efomm', 'en', 'ita', 'ime'] as const;
        const numConcursos = Math.min(desempenho.militares, 4);
        const concursosSelecionados = [...concursosMilitaresLista]
          .sort(() => Math.random() - 0.5)
          .slice(0, numConcursos);

        for (const concurso of concursosSelecionados) {
          const aprovados = escola.tipo === 'federal'
            ? 2 + Math.floor(Math.random() * 5)
            : 1 + Math.floor(Math.random() * 3);

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

      // Informações da escola
      const numAtividades = 5 + Math.floor(Math.random() * 10);
      const atividadesSelecionadas = [...ATIVIDADES_EXTRACURRICULARES]
        .sort(() => Math.random() - 0.5)
        .slice(0, numAtividades);

      const numInfraestrutura = 6 + Math.floor(Math.random() * 8);
      const infraSelecionada = [...INFRAESTRUTURA]
        .sort(() => Math.random() - 0.5)
        .slice(0, numInfraestrutura);

      const metodologia = METODOLOGIAS[Math.floor(Math.random() * METODOLOGIAS.length)];

      let inclusaoTexto = '';
      let diferenciais: string[] = [];
      let avaliacaoMec: number | null = null;
      let notaPais: number | null = null;
      let totalAvaliacoes: number | null = null;
      let bilingueTexto: string | null = null;
      let internacionalTexto: string | null = null;
      let certificacoesSelecionadas: string[] = [];
      let idiomasSelecionados: string[] = [];
      let intercambiosTexto: string | null = null;

      if (escola.tipo === 'privada') {
        inclusaoTexto = 'Escola com programa de inclusão para alunos com necessidades especiais. Oferece acompanhamento individualizado, salas adaptadas e equipe especializada em educação inclusiva.';
        diferenciais = [...DIFERENCIAIS_PRIVADA]
          .sort(() => Math.random() - 0.5)
          .slice(0, 4 + Math.floor(Math.random() * 3));
        avaliacaoMec = 3.5 + Math.random() * 1.5; // 3.5-5.0
        notaPais = 3.8 + Math.random() * 1.2; // 3.8-5.0
        totalAvaliacoes = 50 + Math.floor(Math.random() * 200); // 50-250

        // Programa bilíngue (60% das escolas privadas)
        if (Math.random() > 0.4) {
          bilingueTexto = 'Programa bilíngue completo com 50% da grade curricular em inglês. Professores nativos e certificação internacional ao final do ensino médio. Imersão linguística desde a educação infantil com metodologia CLIL (Content and Language Integrated Learning).';
          idiomasSelecionados.push('Inglês');

          const numCertificacoes = 1 + Math.floor(Math.random() * 3);
          certificacoesSelecionadas = [...CERTIFICACOES]
            .sort(() => Math.random() - 0.5)
            .slice(0, numCertificacoes);
        }

        // Programa internacional (30% das escolas privadas)
        if (Math.random() > 0.7) {
          internacionalTexto = 'Escola com currículo internacional certificado. Oferece preparação para IB (International Baccalaureate) ou AP (Advanced Placement). Parcerias com instituições de ensino no exterior e possibilidade de dupla certificação.';
        }

        // Idiomas adicionais
        const numIdiomasAdicionais = 1 + Math.floor(Math.random() * 3);
        const idiomasRestantes = IDIOMAS.filter(i => !idiomasSelecionados.includes(i));
        idiomasSelecionados = [...idiomasSelecionados, ...idiomasRestantes.sort(() => Math.random() - 0.5).slice(0, numIdiomasAdicionais)];

        // Intercâmbios (50% das escolas privadas)
        if (Math.random() > 0.5) {
          intercambiosTexto = 'Programa de intercâmbio cultural com parceiros nos Estados Unidos, Canadá, Inglaterra, Austrália e países da Europa. Oportunidades de estudo no exterior de curta e longa duração, com suporte completo para adaptação cultural e acadêmica.';
        }
      } else if (escola.tipo === 'federal') {
        inclusaoTexto = 'Instituição federal comprometida com a inclusão e diversidade. Políticas de acessibilidade e suporte pedagógico especializado para todos os estudantes.';
        diferenciais = [...DIFERENCIAIS_FEDERAL]
          .sort(() => Math.random() - 0.5)
          .slice(0, 4 + Math.floor(Math.random() * 3));
        avaliacaoMec = 4.0 + Math.random() * 1.0; // 4.0-5.0
        notaPais = 4.2 + Math.random() * 0.8; // 4.2-5.0
        totalAvaliacoes = 100 + Math.floor(Math.random() * 300); // 100-400

        // Idiomas nas escolas federais
        idiomasSelecionados = ['Inglês', 'Espanhol'];

        // Algumas escolas federais têm programas de intercâmbio
        if (Math.random() > 0.6) {
          intercambiosTexto = 'Programas de intercâmbio acadêmico através de parcerias com universidades federais e instituições internacionais. Oportunidades de participação em programas de ciência sem fronteiras e outras iniciativas governamentais.';
        }
      } else {
        inclusaoTexto = 'Escola pública com compromisso com a educação inclusiva. Atende alunos com necessidades especiais conforme diretrizes do MEC.';
        diferenciais = ['Educação pública de qualidade', 'Merenda escolar', 'Acesso gratuito'];
        avaliacaoMec = 2.5 + Math.random() * 1.5; // 2.5-4.0
        notaPais = 2.8 + Math.random() * 1.5; // 2.8-4.3
        totalAvaliacoes = 30 + Math.floor(Math.random() * 100); // 30-130

        // Idiomas básicos
        idiomasSelecionados = ['Inglês'];
      }

      await db.insert(informacoesEscola).values({
        escola_id: escola.id,
        metodologia,
        inclusao: inclusaoTexto,
        atividades_extracurriculares: atividadesSelecionadas,
        diferenciais,
        avaliacao_mec: avaliacaoMec ? avaliacaoMec.toFixed(2) : null,
        nota_pais: notaPais ? notaPais.toFixed(2) : null,
        total_avaliacoes_pais: totalAvaliacoes,
        infraestrutura: infraSelecionada,
        site: escolaData.mensalidade_anual ? `https://www.${escola.nome.toLowerCase().replace(/\s+/g, '')}.com.br` : null,
        telefone: `(21) ${2000 + Math.floor(Math.random() * 1000)}-${1000 + Math.floor(Math.random() * 9000)}`,
        email: `contato@${escola.nome.toLowerCase().replace(/\s+/g, '')}.com.br`,
        bilingue: bilingueTexto,
        internacional: internacionalTexto,
        certificacoes: certificacoesSelecionadas.length > 0 ? certificacoesSelecionadas : null,
        idiomas_oferecidos: idiomasSelecionados,
        intercambios: intercambiosTexto,
      });

      // Avaliações Externas
      const plataformas = ['reclame_aqui', 'google', 'facebook', 'trustpilot', 'escola_no_ranking'] as const;
      const categorias = ['infraestrutura', 'ensino', 'atendimento', 'comunicacao', 'seguranca', 'alimentacao', 'atividades_extracurriculares', 'custo_beneficio'] as const;

      // Gerar avaliações dos últimos 12 meses
      const dataAtual = new Date();
      for (let i = 0; i < 12; i++) {
        const mes = ((dataAtual.getMonth() - i + 12) % 12) + 1;
        const ano = mes > dataAtual.getMonth() + 1 ? dataAtual.getFullYear() - 1 : dataAtual.getFullYear();

        // Cada mês tem algumas categorias avaliadas em diferentes plataformas
        const numPlataformas = escola.tipo === 'privada' ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2);
        const plataformasSelecionadas = [...plataformas].sort(() => Math.random() - 0.5).slice(0, numPlataformas);

        for (const plataforma of plataformasSelecionadas) {
          const numCategorias = 2 + Math.floor(Math.random() * 4); // 2-5 categorias por plataforma/mês
          const categoriasSelecionadas = [...categorias].sort(() => Math.random() - 0.5).slice(0, numCategorias);

          for (const categoria of categoriasSelecionadas) {
            let notaBase = 3.5;
            let totalAvaliacoes = 5 + Math.floor(Math.random() * 15); // 5-20 avaliações

            if (escola.tipo === 'privada') {
              notaBase = 3.8 + Math.random() * 1.2; // 3.8-5.0
              totalAvaliacoes = 10 + Math.floor(Math.random() * 30); // 10-40
            } else if (escola.tipo === 'federal') {
              notaBase = 4.0 + Math.random() * 1.0; // 4.0-5.0
              totalAvaliacoes = 8 + Math.floor(Math.random() * 25); // 8-33
            } else {
              notaBase = 2.8 + Math.random() * 1.5; // 2.8-4.3
              totalAvaliacoes = 3 + Math.floor(Math.random() * 12); // 3-15
            }

            await db.insert(avaliacoesExternas).values({
              escola_id: escola.id,
              plataforma,
              categoria,
              nota_media: notaBase.toFixed(2),
              total_avaliacoes: totalAvaliacoes,
              mes_referencia: mes,
              ano_referencia: ano,
            });
          }
        }
      }

      // Calcular score
      const scoreResult = await calcularScore(escola.id);
      if (scoreResult) {
        await salvarScore(scoreResult);
      }
    }

    logger.info('system', 'Seed concluído com sucesso', {
      total: ESCOLAS_RIO_JANEIRO.length,
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

    console.log('\n📊 ESCOLAS DO RIO DE JANEIRO');
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
