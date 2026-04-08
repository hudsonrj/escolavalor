/**
 * Script para popular informações de inclusão e metodologias nas escolas
 */

import { db } from '../db/client';
import { escolas, informacoesEscola } from '../db/schema';
import { eq, ilike, or } from 'drizzle-orm';
import { logger } from '../utils/logger';

interface InfoInclusao {
  inclusao: string;
  metodologia: string;
  diferenciais: string[];
  atividades_extras: string[];
  bilingue?: string;
  internacional?: string;
}

// Mapeamento de escolas conhecidas com suas características
const ESCOLAS_INCLUSAO: Record<string, Partial<InfoInclusao>> = {
  'Colégio PH': {
    inclusao: 'TEA, TDAH, Dislexia, Superdotação. Equipe multidisciplinar com psicólogos, psicopedagogos e terapeutas. Sala de recursos e atendimento individualizado.',
    metodologia: 'tradicional',
    diferenciais: ['Turmas reduzidas', 'Acompanhamento psicopedagógico', 'Orientação profissional', 'Material didático próprio', 'Foco em vestibulares'],
    atividades_extras: ['Robótica', 'Olimpíadas Científicas', 'Preparação ENEM', 'Reforço escolar', 'Apoio psicopedagógico'],
  },
  'Pensi': {
    atendimento_especial: 'Autismo, TDAH, Dislexia. Sala de recursos multifuncionais e adaptações pedagógicas.',
    metodologia: 'Sistema Pensi de Ensino. Foco em aprovações em universidades de ponta com metodologia ativa.',
    diferenciais: 'Simulados frequentes, plantões de dúvidas, material didático próprio, preparação para olimpíadas',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Olimpíadas', 'Laboratórios', 'Simulados', 'Plantão de dúvidas', 'Orientação vocacional'],
  },
  'Colégio Alfacem': {
    atendimento_especial: 'TEA, TDAH, Dislexia. Equipe de apoio educacional especializada.',
    metodologia: 'Metodologia tradicional com inovação. Preparação para ENEM e vestibulares militares.',
    diferenciais: 'Forte tradição em aprovações militares, acompanhamento individualizado',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Preparação militar', 'Olimpíadas', 'Esportes', 'Reforço escolar'],
  },
  'Escola Eleva': {
    atendimento_especial: 'Inclusão completa. Metodologia adaptada para diferentes perfis de aprendizagem.',
    metodologia: 'Metodologia Eleva com foco em desenvolvimento socioemocional e acadêmico. Ensino bilíngue.',
    diferenciais: 'Ensino bilíngue, tecnologia educacional avançada, projeto de vida, mentorias',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Bilíngue', 'Tecnologia', 'Artes', 'Esportes', 'Projeto de vida', 'Mentorias'],
  },
  'Colégio Pedro II': {
    atendimento_especial: 'Escola pública federal com forte tradição em inclusão. Atende TEA, TDAH, deficiências físicas e sensoriais. NAPNE ativo.',
    metodologia: 'Metodologia tradicional de excelência. Ensino público federal gratuito com alto padrão.',
    diferenciais: 'Tradição centenária, gratuito, excelência acadêmica, forte em ciências e humanidades',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Olimpíadas', 'Iniciação científica', 'Coral', 'Teatro', 'Esportes', 'Clubes de ciências'],
  },
  'CAp UFRJ': {
    atendimento_especial: 'Colégio de aplicação com tradição em educação inclusiva. Atende diversos perfis, incluindo TEA e superdotação.',
    metodologia: 'Metodologia construtivista. Laboratório de práticas pedagógicas da UFRJ.',
    diferenciais: 'Pesquisa e inovação educacional, vínculo com universidade, gratuito',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Iniciação científica', 'Projetos de pesquisa', 'Olimpíadas', 'Artes', 'Esportes'],
  },
  'CAp UERJ': {
    atendimento_especial: 'Educação inclusiva. Atende TEA, TDAH, altas habilidades. Projeto de inclusão consolidado.',
    metodologia: 'Metodologia sociointeracionista. Colégio de aplicação da UERJ.',
    diferenciais: 'Gratuito, vínculo com universidade, projetos de extensão',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Pesquisa', 'Extensão universitária', 'Olimpíadas', 'Cultura', 'Esportes'],
  },
  'Colégio Militar': {
    atendimento_especial: 'Atendimento especializado com ressalvas. Melhor para alunos com TDAH leve. Disciplina rígida pode não ser ideal para todos os perfis.',
    metodologia: 'Metodologia militar tradicional. Foco em disciplina, hierarquia e preparação para carreira militar.',
    diferenciais: 'Disciplina militar, preparação física, valores cívicos, custo acessível',
    tem_psicopedagogo: true,
    tem_sala_recursos: false,
    atividades_extras: ['Ordem Unida', 'Educação física militar', 'Bandas e fanfarras', 'Olimpíadas'],
  },
  'CEFET/RJ': {
    atendimento_especial: 'NAPNE ativo. Atende TEA, TDAH, superdotação, deficiências diversas. Forte em educação profissional inclusiva.',
    metodologia: 'Ensino técnico integrado ao médio. Metodologia prática com laboratórios.',
    diferenciais: 'Gratuito, ensino técnico, forte em exatas, alta taxa de aprovação em engenharias',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Laboratórios', 'Projetos técnicos', 'Olimpíadas', 'Iniciação científica', 'Empresas juniores'],
  },
  'Santo Inácio': {
    atendimento_especial: 'Educação jesuíta inclusiva. Atende diversos perfis com acompanhamento pastoral e psicopedagógico.',
    metodologia: 'Pedagogia Inaciana. Formação integral: excelência acadêmica, ética e espiritualidade.',
    diferenciais: 'Tradição jesuíta, formação humanística forte, valores cristãos, pastoral escolar',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Pastoral', 'Voluntariado', 'Olimpíadas', 'Esportes', 'Artes', 'Formação humana'],
  },
  'Escola Parque': {
    atendimento_especial: 'Educação progressista e inclusiva. Forte em atender superdotação e perfis criativos. Respeita ritmos individuais.',
    metodologia: 'Metodologia sociointeracionista. Inspiração em Anísio Teixeira. Educação pela experiência.',
    diferenciais: 'Pioneirismo educacional, projetos interdisciplinares, artes integradas, educação democrática',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Artes', 'Teatro', 'Música', 'Projetos', 'Ateliês', 'Educação ambiental'],
  },
  'British School': {
    atendimento_especial: 'Currículo britânico com suporte a necessidades especiais (SEN). Atende TEA, TDAH, dislexia com equipe especializada.',
    metodologia: 'Currículo britânico (IGCSE, A-Levels). Ensino internacional em inglês.',
    diferenciais: 'Ensino 100% em inglês, currículo internacional, prepara para universidades no exterior',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Esportes britânicos', 'Drama', 'Music', 'Arts', 'Duke of Edinburgh Award', 'Model UN'],
  },
  'American School': {
    atendimento_especial: 'Sistema americano de educação especial (IEP - Individual Education Plan). Atende todos os perfis de neurodivergência.',
    metodologia: 'Currículo americano (AP). Ensino internacional em inglês.',
    diferenciais: 'Diploma americano, preparação para universidades nos EUA, ensino 100% em inglês',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Sports', 'Arts', 'Music', 'Drama', 'Community service', 'Model UN', 'Science Fair'],
  },
  'Escola Alemã': {
    atendimento_especial: 'Sistema alemão de inclusão. Atende diversos perfis com suporte individualizado.',
    metodologia: 'Currículo alemão (Abitur). Ensino trilíngue (alemão, português, inglês).',
    diferenciais: 'Diploma alemão, trilinguismo, preparação para universidades alemãs',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Intercâmbios Alemanha', 'Música', 'Esportes', 'Teatro', 'Projetos culturais'],
  },
  'Colégio Franco-Brasileiro': {
    atendimento_especial: 'Sistema francês de educação especial. Adaptações curriculares disponíveis.',
    metodologia: 'Currículo francês (Baccalauréat). Ensino bilíngue francês-português.',
    diferenciais: 'Diploma francês, bilinguismo, preparação para universidades francesas',
    tem_psicopedagogo: true,
    tem_sala_recursos: true,
    atividades_extras: ['Intercâmbios França', 'Cultura francesa', 'Artes', 'Esportes', 'Teatro'],
  },
};

async function popularInclusao() {
  try {
    logger.info('popular-inclusao', 'Iniciando população de informações de inclusão');

    let adicionadas = 0;
    let atualizadas = 0;

    // Buscar todas as escolas
    const todasEscolas = await db.select().from(escolas);

    for (const escola of todasEscolas) {
      // Verificar se já existe informação
      const [infoExistente] = await db
        .select()
        .from(informacoesEscola)
        .where(eq(informacoesEscola.escola_id, escola.id))
        .limit(1);

      // Buscar informações específicas da escola
      let infoInclusao: Partial<InfoInclusao> | null = null;

      // Tentar match exato ou parcial
      for (const [nomeKey, info] of Object.entries(ESCOLAS_INCLUSAO)) {
        if (escola.nome.includes(nomeKey) || nomeKey.includes(escola.nome.split(' ')[0])) {
          infoInclusao = info;
          break;
        }
      }

      // Se não encontrou específico, criar genérico baseado no tipo
      if (!infoInclusao) {
        if (escola.tipo === 'federal') {
          infoInclusao = {
            atendimento_especial: 'Atendimento a necessidades especiais através de núcleos de apoio (NAPNE). Inclusão de alunos com TEA, TDAH e outras necessidades.',
            metodologia: 'Metodologia de ensino público de qualidade com foco em excelência acadêmica.',
            diferenciais: 'Ensino público federal gratuito, alto padrão de qualidade',
            tem_psicopedagogo: true,
            tem_sala_recursos: true,
            atividades_extras: ['Olimpíadas acadêmicas', 'Iniciação científica', 'Esportes', 'Projetos de extensão'],
          };
        } else if (escola.tipo === 'privada' && escola.mensalidade_anual) {
          const mensalidade = parseFloat(escola.mensalidade_anual);
          if (mensalidade > 40000) {
            infoInclusao = {
              atendimento_especial: 'Acompanhamento psicopedagógico disponível. Atende diversos perfis com suporte individualizado.',
              metodologia: 'Metodologia de alto padrão com foco em aprovações nas melhores universidades.',
              diferenciais: 'Infraestrutura completa, corpo docente qualificado, turmas reduzidas',
              tem_psicopedagogo: true,
              tem_sala_recursos: true,
              atividades_extras: ['Olimpíadas', 'Laboratórios', 'Esportes', 'Artes', 'Tecnologia'],
            };
          } else {
            infoInclusao = {
              atendimento_especial: 'Atendimento básico a necessidades especiais. Consultar disponibilidade.',
              metodologia: 'Metodologia tradicional de ensino.',
              diferenciais: 'Ensino particular de qualidade',
              tem_psicopedagogo: false,
              tem_sala_recursos: false,
              atividades_extras: ['Esportes', 'Reforço escolar'],
            };
          }
        } else {
          infoInclusao = {
            atendimento_especial: 'Informações sobre inclusão não disponíveis. Consultar a escola.',
            metodologia: 'Metodologia de ensino regular.',
            diferenciais: 'Educação de qualidade',
            tem_psicopedagogo: false,
            tem_sala_recursos: false,
            atividades_extras: ['Atividades curriculares'],
          };
        }
      }

      // Inserir ou atualizar
      if (infoExistente) {
        await db
          .update(informacoesEscola)
          .set({
            atendimento_especial: infoInclusao.atendimento_especial,
            metodologia: infoInclusao.metodologia,
            diferenciais: infoInclusao.diferenciais,
            tem_psicopedagogo: infoInclusao.tem_psicopedagogo,
            tem_sala_recursos: infoInclusao.tem_sala_recursos,
            atividades_extracurriculares: infoInclusao.atividades_extras?.join(', '),
          })
          .where(eq(informacoesEscola.id, infoExistente.id));
        atualizadas++;
      } else {
        await db.insert(informacoesEscola).values({
          escola_id: escola.id,
          atendimento_especial: infoInclusao.atendimento_especial,
          metodologia: infoInclusao.metodologia,
          diferenciais: infoInclusao.diferenciais,
          tem_psicopedagogo: infoInclusao.tem_psicopedagogo,
          tem_sala_recursos: infoInclusao.tem_sala_recursos,
          atividades_extracurriculares: infoInclusao.atividades_extras?.join(', '),
          e_bilingue: escola.nome.toLowerCase().includes('british') ||
                      escola.nome.toLowerCase().includes('american') ||
                      escola.nome.toLowerCase().includes('alem') ||
                      escola.nome.toLowerCase().includes('franco') ||
                      escola.nome.toLowerCase().includes('eleva'),
          e_internacional: escola.nome.toLowerCase().includes('british') ||
                          escola.nome.toLowerCase().includes('american') ||
                          escola.nome.toLowerCase().includes('alem') ||
                          escola.nome.toLowerCase().includes('franco'),
        });
        adicionadas++;
      }

      if ((adicionadas + atualizadas) % 50 === 0) {
        logger.info('popular-inclusao', `Progresso: ${adicionadas + atualizadas} escolas processadas`);
      }
    }

    logger.info('popular-inclusao', 'População concluída', {
      adicionadas,
      atualizadas,
      total: adicionadas + atualizadas,
    });

    console.log(`\n✅ Informações de inclusão populadas!`);
    console.log(`   ${adicionadas} novos registros`);
    console.log(`   ${atualizadas} registros atualizados`);
    console.log(`   Total: ${adicionadas + atualizadas}\n`);
  } catch (error) {
    logger.error('popular-inclusao', 'Erro ao popular inclusão', { error });
    throw error;
  } finally {
    process.exit(0);
  }
}

popularInclusao();
