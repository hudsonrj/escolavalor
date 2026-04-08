#!/usr/bin/env bun

/**
 * Script completo de seed com todas as informações detalhadas
 */

import { db } from '../db/client';
import { escolas, notas, olimpiadas, scores, aprovacoesUniversitarias, enemDetalhes, concursosMilitares, informacoesEscola, avaliacoesExternas, reclamacoes } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { calcularScore, salvarScore } from '../score/calculator';

const ESCOLAS_RJ = [
  // Barra da Tijuca
  {
    cnpj: '33.369.988/0001-43',
    nome: 'Colégio Santo Agostinho - Barra',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 6565',
    bairro: 'Barra da Tijuca',
    cep: '22793-081',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Jesuíta de Educação',
    mensalidade_anual: 42000,
    lat: '-23.0064',
    lng: '-43.3544',
  },
  {
    cnpj: '42.705.993/0001-03',
    nome: 'Colégio Alfacem',
    tipo: 'privada' as const,
    endereco: 'Av. Ayrton Senna, 2150',
    bairro: 'Barra da Tijuca',
    cep: '22775-002',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Alfacem',
    mensalidade_anual: 34000,
    lat: '-22.9923',
    lng: '-43.3577',
  },
  {
    cnpj: '40.240.299/0001-15',
    nome: 'Colégio pH Barra',
    tipo: 'privada' as const,
    endereco: 'Av. Armando Lombardi, 1000',
    bairro: 'Barra da Tijuca',
    cep: '22640-000',
    municipio: 'Rio de Janeiro',
    rede: 'Rede pH',
    mensalidade_anual: 48000,
    lat: '-23.0128',
    lng: '-43.3142',
  },
  {
    cnpj: '42.590.831/0009-40',
    nome: 'Colégio CEL',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 2480',
    bairro: 'Barra da Tijuca',
    cep: '22640-102',
    municipio: 'Rio de Janeiro',
    rede: 'Centro Educacional da Lagoa',
    mensalidade_anual: 36000,
    lat: '-23.0015',
    lng: '-43.3467',
  },
  {
    cnpj: '01.677.175/0001-28',
    nome: 'Colégio Franco-Brasileiro',
    tipo: 'privada' as const,
    endereco: 'Av. Lúcio Costa, 5000',
    bairro: 'Barra da Tijuca',
    cep: '22630-010',
    municipio: 'Rio de Janeiro',
    rede: 'Franco-Brasileiro',
    mensalidade_anual: 52000,
    lat: '-23.0171',
    lng: '-43.3102',
  },
  {
    cnpj: '33.737.654/0001-34',
    nome: 'Colégio Pensi Barra',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 3500',
    bairro: 'Barra da Tijuca',
    cep: '22640-102',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Pensi',
    mensalidade_anual: 38000,
    lat: '-23.0089',
    lng: '-43.3401',
  },
  {
    cnpj: '42.575.113/0001-10',
    nome: 'Escola Parque da Barra',
    tipo: 'privada' as const,
    endereco: 'Av. Armando Lombardi, 232',
    bairro: 'Barra da Tijuca',
    cep: '22640-000',
    municipio: 'Rio de Janeiro',
    rede: 'Escola Parque',
    mensalidade_anual: 44000,
    lat: '-23.0089',
    lng: '-43.3156',
  },
  {
    cnpj: '01.677.175/0002-09',
    nome: 'Colégio Teresiano',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 2901',
    bairro: 'Recreio',
    cep: '22790-700',
    municipio: 'Rio de Janeiro',
    rede: 'Teresiano',
    mensalidade_anual: 35000,
    lat: '-23.0051',
    lng: '-43.3439',
  },
  {
    cnpj: '33.336.525/0001-70',
    nome: 'Colégio Bahiense',
    tipo: 'privada' as const,
    endereco: 'Av. Ayrton Senna, 2001',
    bairro: 'Barra da Tijuca',
    cep: '22775-003',
    municipio: 'Rio de Janeiro',
    rede: 'Bahiense',
    mensalidade_anual: 30000,
    lat: '-22.9912',
    lng: '-43.3589',
  },
  {
    cnpj: '42.590.831/0011-48',
    nome: 'Colégio QI',
    tipo: 'privada' as const,
    endereco: 'Av. das Américas, 5500',
    bairro: 'Barra da Tijuca',
    cep: '22640-102',
    municipio: 'Rio de Janeiro',
    rede: 'QI',
    mensalidade_anual: 40000,
    lat: '-23.0098',
    lng: '-43.3512',
  },
  // Zona Sul
  {
    cnpj: '33.743.303/0001-13',
    nome: 'Colégio Santo Inácio',
    tipo: 'privada' as const,
    endereco: 'Rua São Clemente, 226',
    bairro: 'Botafogo',
    cep: '22260-000',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Jesuíta de Educação',
    mensalidade_anual: 45000,
    lat: '-22.9489',
    lng: '-43.1828',
  },
  {
    cnpj: '31.556.501/0001-62',
    nome: 'Colégio São Vicente de Paulo',
    tipo: 'privada' as const,
    endereco: 'Rua Cosme Velho, 135',
    bairro: 'Cosme Velho',
    cep: '22241-090',
    municipio: 'Rio de Janeiro',
    rede: 'São Vicente de Paulo',
    mensalidade_anual: 38000,
    lat: '-22.9402',
    lng: '-43.1952',
  },
  {
    cnpj: '33.648.613/0001-93',
    nome: 'Colégio Andrews',
    tipo: 'privada' as const,
    endereco: 'Rua Visconde de Pirajá, 550',
    bairro: 'Ipanema',
    cep: '22410-002',
    municipio: 'Rio de Janeiro',
    rede: 'Andrews',
    mensalidade_anual: 52000,
    lat: '-22.9850',
    lng: '-43.1975',
  },
  {
    cnpj: '30.318.213/0001-73',
    nome: 'Colégio PH Copacabana',
    tipo: 'privada' as const,
    endereco: 'Av. Nossa Senhora de Copacabana, 680',
    bairro: 'Copacabana',
    cep: '22050-000',
    municipio: 'Rio de Janeiro',
    rede: 'Rede pH',
    mensalidade_anual: 46000,
    lat: '-22.9711',
    lng: '-43.1823',
  },
  {
    cnpj: '33.832.447/0001-06',
    nome: 'Escola Parque',
    tipo: 'privada' as const,
    endereco: 'Rua Marquês de São Vicente, 1',
    bairro: 'Gávea',
    cep: '22451-040',
    municipio: 'Rio de Janeiro',
    rede: 'Escola Parque',
    mensalidade_anual: 50000,
    lat: '-22.9796',
    lng: '-43.2296',
  },
  {
    cnpj: '33.017.844/0001-02',
    nome: 'Colégio São Bento',
    tipo: 'privada' as const,
    endereco: 'Rua Dom Gerardo, 40',
    bairro: 'Centro',
    cep: '20090-030',
    municipio: 'Rio de Janeiro',
    rede: 'São Bento',
    mensalidade_anual: 28000,
    lat: '-22.8941',
    lng: '-43.1776',
  },
  // Zona Norte
  {
    cnpj: '42.486.025/0001-58',
    nome: 'Colégio Mopi',
    tipo: 'privada' as const,
    endereco: 'Rua Conde de Bonfim, 947',
    bairro: 'Tijuca',
    cep: '20530-001',
    municipio: 'Rio de Janeiro',
    rede: 'Mopi',
    mensalidade_anual: 32000,
    lat: '-22.9198',
    lng: '-43.2380',
  },
  {
    cnpj: '33.629.950/0001-16',
    nome: 'Colégio e Curso Intellectus',
    tipo: 'privada' as const,
    endereco: 'Rua Barão de Mesquita, 581',
    bairro: 'Tijuca',
    cep: '20540-001',
    municipio: 'Rio de Janeiro',
    rede: 'Intellectus',
    mensalidade_anual: 30000,
    lat: '-22.9265',
    lng: '-43.2402',
  },
  {
    cnpj: '42.684.361/0001-04',
    nome: 'Colégio São Paulo',
    tipo: 'privada' as const,
    endereco: 'Rua Teodoro da Silva, 280',
    bairro: 'Vila Isabel',
    cep: '20560-000',
    municipio: 'Rio de Janeiro',
    rede: 'São Paulo',
    mensalidade_anual: 29000,
    lat: '-22.9156',
    lng: '-43.2445',
  },
  // Federais
  {
    cnpj: '34.076.233/0001-88',
    nome: 'Colégio Pedro II - Centro',
    tipo: 'federal' as const,
    endereco: 'Praça Marechal Floriano, s/n',
    bairro: 'Centro',
    cep: '20020-080',
    municipio: 'Rio de Janeiro',
    rede: 'Colégio Pedro II',
    mensalidade_anual: null,
    lat: '-22.9132',
    lng: '-43.1775',
  },
  {
    cnpj: '33.458.275/0001-61',
    nome: 'Colégio Pedro II - Tijuca',
    tipo: 'federal' as const,
    endereco: 'Rua Mariz e Barros, 273',
    bairro: 'Tijuca',
    cep: '20270-003',
    municipio: 'Rio de Janeiro',
    rede: 'Colégio Pedro II',
    mensalidade_anual: null,
    lat: '-22.9268',
    lng: '-43.2338',
  },
  {
    cnpj: '33.458.275/0002-42',
    nome: 'Colégio Pedro II - São Cristóvão',
    tipo: 'federal' as const,
    endereco: 'Rua São Francisco Xavier, s/n',
    bairro: 'São Cristóvão',
    cep: '20943-000',
    municipio: 'Rio de Janeiro',
    rede: 'Colégio Pedro II',
    mensalidade_anual: null,
    lat: '-22.9042',
    lng: '-43.2292',
  },
  {
    cnpj: '33.458.275/0003-23',
    nome: 'Colégio Pedro II - Humaitá',
    tipo: 'federal' as const,
    endereco: 'Rua Humaitá, 80',
    bairro: 'Humaitá',
    cep: '22261-040',
    municipio: 'Rio de Janeiro',
    rede: 'Colégio Pedro II',
    mensalidade_anual: null,
    lat: '-22.9562',
    lng: '-43.1896',
  },
  {
    cnpj: '33.458.275/0004-04',
    nome: 'Colégio Pedro II - Engenho Novo',
    tipo: 'federal' as const,
    endereco: 'Rua Barão do Bom Retiro, 726',
    bairro: 'Engenho Novo',
    cep: '20710-002',
    municipio: 'Rio de Janeiro',
    rede: 'Colégio Pedro II',
    mensalidade_anual: null,
    lat: '-22.9027',
    lng: '-43.2723',
  },
  {
    cnpj: '31.977.462/0001-83',
    nome: 'Colégio Militar do Rio de Janeiro',
    tipo: 'federal' as const,
    endereco: 'Rua São Francisco Xavier, 267',
    bairro: 'Tijuca',
    cep: '20550-010',
    municipio: 'Rio de Janeiro',
    rede: 'Sistema Colégio Militar do Brasil',
    mensalidade_anual: null,
    lat: '-22.9197',
    lng: '-43.2348',
  },
  {
    cnpj: '05.883.739/0001-11',
    nome: 'CEFET-RJ',
    tipo: 'federal' as const,
    endereco: 'Av. Maracanã, 229',
    bairro: 'Maracanã',
    cep: '20271-110',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Federal CEFET',
    mensalidade_anual: null,
    lat: '-22.9121',
    lng: '-43.2302',
  },
  // Públicas Estaduais
  {
    cnpj: '33.530.486/0001-99',
    nome: 'CIEP 117 Elis Regina',
    tipo: 'publica' as const,
    endereco: 'Av. Embaixador Abelardo Bueno, 1000',
    bairro: 'Barra da Tijuca',
    cep: '22775-040',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Estadual RJ',
    mensalidade_anual: null,
    lat: '-22.9871',
    lng: '-43.3645',
  },
  {
    cnpj: '33.740.098/0001-76',
    nome: 'CAp UERJ',
    tipo: 'publica' as const,
    endereco: 'Rua São Francisco Xavier, 524',
    bairro: 'Maracanã',
    cep: '20550-900',
    municipio: 'Rio de Janeiro',
    rede: 'UERJ',
    mensalidade_anual: null,
    lat: '-22.9115',
    lng: '-43.2363',
  },
  {
    cnpj: '31.451.168/0001-98',
    nome: 'Colégio Estadual André Maurois',
    tipo: 'publica' as const,
    endereco: 'Rua Desembargador Isidro, 41',
    bairro: 'Tijuca',
    cep: '20521-160',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Estadual RJ',
    mensalidade_anual: null,
    lat: '-22.9286',
    lng: '-43.2354',
  },
  {
    cnpj: '42.833.883/0001-06',
    nome: 'Colégio Estadual Visconde de Cairu',
    tipo: 'publica' as const,
    endereco: 'Rua Hadock Lobo, 433',
    bairro: 'Tijuca',
    cep: '20260-131',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Estadual RJ',
    mensalidade_anual: null,
    lat: '-22.9297',
    lng: '-43.2391',
  },
  {
    cnpj: '31.538.204/0001-77',
    nome: 'Colégio Estadual Amaro Cavalcanti',
    tipo: 'publica' as const,
    endereco: 'Rua do Catete, 276',
    bairro: 'Catete',
    cep: '22220-001',
    municipio: 'Rio de Janeiro',
    rede: 'Rede Estadual RJ',
    mensalidade_anual: null,
    lat: '-22.9269',
    lng: '-43.1779',
  },
];

const UNIVERSIDADES = [
  'UFRJ', 'USP', 'UNICAMP', 'PUC-RIO', 'UFF', 'UERJ', 'FGV',
  'UFRGS', 'UFMG', 'UnB', 'UNESP', 'UFC', 'UFPE', 'UFSC'
];

const CURSOS = [
  'Medicina', 'Engenharia', 'Direito', 'Administração', 'Economia',
  'Ciência da Computação', 'Arquitetura', 'Psicologia', 'Odontologia',
  'Relações Internacionais', 'Design', 'Comunicação Social'
];

const INFRAESTRUTURA = [
  'Laboratório de Ciências', 'Laboratório de Informática', 'Biblioteca',
  'Quadra Poliesportiva', 'Piscina', 'Auditório', 'Teatro'
];

async function seed() {
  logger.info('system', 'Iniciando seed completo');

  try {
    // Limpar dados
    await db.delete(scores);
    await db.delete(reclamacoes);
    await db.delete(avaliacoesExternas);
    await db.delete(informacoesEscola);
    await db.delete(concursosMilitares);
    await db.delete(enemDetalhes);
    await db.delete(aprovacoesUniversitarias);
    await db.delete(olimpiadas);
    await db.delete(notas);
    await db.delete(escolas);

    for (const escolaData of ESCOLAS_RJ) {
      const [escola] = await db.insert(escolas).values({
        cnpj: escolaData.cnpj,
        nome: escolaData.nome,
        tipo: escolaData.tipo,
        uf: 'RJ',
        municipio: escolaData.municipio,
        bairro: escolaData.bairro,
        endereco_completo: escolaData.endereco,
        cep: escolaData.cep,
        lat: escolaData.lat,
        lng: escolaData.lng,
        rede_ensino: escolaData.rede,
        mensalidade_anual: escolaData.mensalidade_anual?.toFixed(2) || null,
        mensalidade_ano_ref: escolaData.mensalidade_anual ? 2024 : null,
        total_professores: escolaData.tipo === 'federal' ? 80 + Math.floor(Math.random() * 40) : 40 + Math.floor(Math.random() * 30),
        total_alunos: escolaData.tipo === 'federal' ? 800 + Math.floor(Math.random() * 400) : 400 + Math.floor(Math.random() * 300),
        total_salas: 20 + Math.floor(Math.random() * 15),
        niveis_ensino: escolaData.tipo === 'federal'
          ? ['fundamental_ii', 'ensino_medio']
          : ['educacao_infantil', 'fundamental_i', 'fundamental_ii', 'ensino_medio'],
        turnos: escolaData.tipo === 'privada' ? ['manha', 'tarde', 'integral'] : ['manha', 'tarde'],
        ensino_integral: escolaData.tipo === 'privada' ? 'Período integral disponível com atividades extracurriculares das 7h às 18h' : null,
      }).returning();

      logger.info('system', `Escola criada: ${escola.nome}`);

      const desempenho = {
        enem: escolaData.tipo === 'federal' ? 750 + Math.random() * 100 : 720 + Math.random() * 80,
        enemMax: escolaData.tipo === 'federal' ? 900 + Math.random() * 100 : 880 + Math.random() * 120,
        totalAlunos: 50 + Math.floor(Math.random() * 100),
        ideb: escolaData.tipo === 'federal' ? 7.0 + Math.random() * 1.5 : 6.5 + Math.random() * 1.5,
        aprovacao: escolaData.tipo === 'federal' ? 75 + Math.random() * 20 : 70 + Math.random() * 25,
      };

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

      // Aprovação
      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'aprovacao_univ',
        valor_normalizado: (desempenho.aprovacao / 10).toFixed(2),
        valor_original: desempenho.aprovacao.toFixed(2),
        escala_original: '0-100',
        ano_referencia: 2024,
      });

      // ENEM Detalhes - últimos 5 anos
      for (let ano = 2020; ano <= 2024; ano++) {
        const notaMediaAno = ano === 2024 ? desempenho.enem : desempenho.enem * (0.92 + Math.random() * 0.1);
        const notaMaxAno = ano === 2024 ? desempenho.enemMax : desempenho.enemMax * (0.94 + Math.random() * 0.08);

        await db.insert(enemDetalhes).values({
          escola_id: escola.id,
          nota_media: notaMediaAno.toFixed(2),
          nota_maxima: notaMaxAno.toFixed(2),
          nota_minima: (notaMediaAno - 50).toFixed(2),
          matematica_media: (notaMediaAno * (0.95 + Math.random() * 0.1)).toFixed(2),
          linguagens_media: (notaMediaAno * (0.98 + Math.random() * 0.08)).toFixed(2),
          ciencias_humanas_media: (notaMediaAno * (0.96 + Math.random() * 0.1)).toFixed(2),
          ciencias_natureza_media: (notaMediaAno * (0.94 + Math.random() * 0.12)).toFixed(2),
          redacao_media: (800 + Math.random() * 150).toFixed(2),
          redacao_maxima: (950 + Math.random() * 50).toFixed(2),
          total_alunos: Math.floor(desempenho.totalAlunos * (0.9 + Math.random() * 0.2)),
          ano_referencia: ano,
        });
      }

      // Olimpíadas - últimos 5 anos
      const competicoes = ['obmep', 'obf', 'obq', 'oba', 'canguru', 'omerj', 'mandacaru'] as const;
      const niveis = ['ouro', 'prata', 'bronze', 'mencao'] as const;
      const pontos = { ouro: 3.0, prata: 2.0, bronze: 1.0, mencao: 0.5 };

      for (let ano = 2020; ano <= 2024; ano++) {
        const numMedalhas = escola.tipo === 'federal' ? 5 + Math.floor(Math.random() * 15) : 3 + Math.floor(Math.random() * 8);
        for (let i = 0; i < numMedalhas; i++) {
          const comp = competicoes[Math.floor(Math.random() * competicoes.length)];
          const nivel = niveis[Math.floor(Math.random() * niveis.length)];
          await db.insert(olimpiadas).values({
            escola_id: escola.id,
            competicao: comp,
            nivel,
            pontos: pontos[nivel].toString(),
            edicao: ano,
            aluno_anonimizado: `hash_${escola.id}_${ano}_${i}`,
          });
        }
      }

      // Aprovações Universitárias - últimos 5 anos
      for (let ano = 2020; ano <= 2024; ano++) {
        const numUnivs = escola.tipo === 'federal' ? 8 + Math.floor(Math.random() * 10) : 5 + Math.floor(Math.random() * 8);
        const univsSelecionadas = [...UNIVERSIDADES].sort(() => Math.random() - 0.5).slice(0, numUnivs);

        for (const universidade of univsSelecionadas) {
          const numCursos = 2 + Math.floor(Math.random() * 4);
          const cursosSelecionados = [...CURSOS].sort(() => Math.random() - 0.5).slice(0, numCursos);

          for (const curso of cursosSelecionados) {
            const qtd = escola.tipo === 'federal' ? 1 + Math.floor(Math.random() * 8) : 1 + Math.floor(Math.random() * 5);
            await db.insert(aprovacoesUniversitarias).values({
              escola_id: escola.id,
              universidade,
              curso,
              quantidade: qtd,
              ano_referencia: ano,
            });
          }
        }
      }

      // Concursos Militares
      if (Math.random() > 0.5) {
        const concursos = ['espcex', 'afa', 'ime', 'ita'] as const;
        for (const concurso of concursos) {
          if (Math.random() > 0.5) {
            await db.insert(concursosMilitares).values({
              escola_id: escola.id,
              concurso,
              aprovados: 1 + Math.floor(Math.random() * 5),
              ano_referencia: 2024,
            });
          }
        }
      }

      // Informações
      await db.insert(informacoesEscola).values({
        escola_id: escola.id,
        metodologia: escola.tipo === 'privada' ? 'sociointeracionista' : 'tradicional',
        inclusao: 'Programa completo de inclusão com equipe especializada',
        atividades_extracurriculares: ['Robótica', 'Xadrez', 'Teatro', 'Música', 'Esportes'],
        diferenciais: escola.tipo === 'privada' ? ['Programa bilíngue', 'Intercâmbio'] : ['Tradição', 'Excelência'],
        avaliacao_mec: (4.0 + Math.random()).toFixed(2),
        nota_pais: (4.0 + Math.random()).toFixed(2),
        total_avaliacoes_pais: 100 + Math.floor(Math.random() * 200),
        infraestrutura: INFRAESTRUTURA,
        bilingue: escola.tipo === 'privada' ? 'Programa bilíngue completo' : null,
        idiomas_oferecidos: ['Inglês', 'Espanhol'],
        certificacoes: escola.tipo === 'privada' ? ['Cambridge', 'TOEFL'] : null,
      });

      // Avaliações Externas - últimos 12 meses
      const plataformas = ['reclame_aqui', 'google', 'facebook'] as const;
      const categorias = ['infraestrutura', 'ensino', 'atendimento', 'comunicacao'] as const;

      for (let i = 0; i < 12; i++) {
        const mes = ((new Date().getMonth() - i + 12) % 12) + 1;
        const ano = mes > new Date().getMonth() + 1 ? 2023 : 2024;

        for (const plataforma of plataformas) {
          for (const categoria of categorias) {
            if (Math.random() > 0.4) {
              await db.insert(avaliacoesExternas).values({
                escola_id: escola.id,
                plataforma,
                categoria,
                nota_media: (3.5 + Math.random() * 1.5).toFixed(2),
                total_avaliacoes: 5 + Math.floor(Math.random() * 20),
                mes_referencia: mes,
                ano_referencia: ano,
              });
            }
          }
        }
      }

      // Reclamações - últimos 12 meses
      const tiposReclamacao = ['mensalidade', 'professores', 'infraestrutura', 'comunicacao', 'atendimento'] as const;

      for (let i = 0; i < 12; i++) {
        const mes = ((new Date().getMonth() - i + 12) % 12) + 1;
        const ano = mes > new Date().getMonth() + 1 ? 2023 : 2024;

        for (const tipo of tiposReclamacao) {
          if (Math.random() > 0.6) {
            await db.insert(reclamacoes).values({
              escola_id: escola.id,
              tipo,
              quantidade: 1 + Math.floor(Math.random() * 8),
              mes_referencia: mes,
              ano_referencia: ano,
              plataforma_origem: plataformas[Math.floor(Math.random() * plataformas.length)],
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

    logger.info('system', 'Seed completo concluído');
    process.exit(0);
  } catch (error) {
    logger.error('system', 'Erro no seed', { error });
    console.error(error);
    process.exit(1);
  }
}

seed();
