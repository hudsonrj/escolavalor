/**
 * Script simplificado para popular informações de inclusão
 */

import { db } from '../db/client';
import { escolas, informacoesEscola } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

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

      // Determinar inclusão baseado no tipo e características
      let inclusao = '';
      let metodologia: 'tradicional' | 'construtivista' | 'montessoriana' | 'waldorf' | 'sociointeracionista' = 'tradicional';
      let diferenciais: string[] = [];
      let atividades: string[] = [];
      let bilingue: string | null = null;
      let internacional: string | null = null;

      // Escolas federais
      if (escola.tipo === 'federal') {
        inclusao = 'Atendimento a necessidades especiais através de núcleos de apoio (NAPNE). Inclusão de alunos com TEA, TDAH e outras necessidades. Sala de recursos disponível.';
        diferenciais = ['Ensino público gratuito', 'Alto padrão de qualidade', 'Tradição acadêmica'];
        atividades = ['Olimpíadas acadêmicas', 'Iniciação científica', 'Esportes', 'Projetos de extensão'];

        if (escola.nome.includes('Pedro II')) {
          inclusao = 'Escola pública federal com forte tradição em inclusão. Atende TEA, TDAH, deficiências físicas e sensoriais. NAPNE ativo. Psicopedagogos disponíveis.';
          diferenciais.push('Tradição centenária', 'Excelência acadêmica');
          atividades.push('Coral', 'Teatro', 'Clubes de ciências');
        } else if (escola.nome.includes('CAp')) {
          metodologia = 'sociointeracionista';
          inclusao = 'Colégio de aplicação com tradição em educação inclusiva. Atende diversos perfis incluindo TEA e superdotação. Pesquisa em práticas inclusivas.';
          diferenciais.push('Vínculo com universidade', 'Pesquisa educacional');
          atividades.push('Pesquisa', 'Projetos interdisciplinares');
        } else if (escola.nome.includes('Militar')) {
          inclusao = 'Atendimento especializado com ressalvas. Melhor para alunos com TDAH leve. Disciplina rígida pode não ser ideal para todos os perfis neurodivergentes.';
          diferenciais.push('Disciplina militar', 'Preparação física', 'Valores cívicos');
          atividades.push('Ordem Unida', 'Educação física militar', 'Bandas e fanfarras');
        } else if (escola.nome.includes('CEFET')) {
          inclusao = 'NAPNE ativo. Atende TEA, TDAH, superdotação, deficiências diversas. Forte em educação profissional inclusiva.';
          diferenciais.push('Ensino técnico integrado', 'Laboratórios modernos');
          atividades.push('Laboratórios', 'Projetos técnicos', 'Empresas juniores');
        }
      }
      // Escolas privadas
      else if (escola.tipo === 'privada') {
        const mensalidade = escola.mensalidade_anual ? parseFloat(escola.mensalidade_anual) : 0;

        if (escola.nome.includes('PH')) {
          inclusao = 'TEA, TDAH, Dislexia, Superdotação. Equipe multidisciplinar com psicólogos, psicopedagogos e terapeutas. Sala de recursos.';
          diferenciais = ['Turmas reduzidas', 'Acompanhamento psicopedagógico', 'Foco em vestibulares'];
          atividades = ['Robótica', 'Olimpíadas Científicas', 'Preparação ENEM'];
        } else if (escola.nome.includes('Pensi')) {
          inclusao = 'Autismo, TDAH, Dislexia. Sala de recursos multifuncionais e adaptações pedagógicas individualizadas.';
          diferenciais = ['Simulados frequentes', 'Plantões de dúvidas', 'Material didático próprio'];
          atividades = ['Olimpíadas', 'Laboratórios', 'Simulados'];
        } else if (escola.nome.includes('Alfacem')) {
          inclusao = 'TEA, TDAH, Dislexia. Equipe de apoio educacional especializada. Tradição em educação inclusiva.';
          diferenciais = ['Aprovações militares', 'Acompanhamento individualizado'];
          atividades = ['Preparação militar', 'Olimpíadas', 'Esportes'];
        } else if (escola.nome.includes('Eleva')) {
          inclusao = 'Inclusão completa. Metodologia adaptada para diferentes perfis de aprendizagem. Suporte socioemocional.';
          bilingue = 'Programa bilíngue integrado ao currículo';
          diferenciais = ['Ensino bilíngue', 'Tecnologia educacional', 'Projeto de vida'];
          atividades = ['Bilíngue', 'Tecnologia', 'Artes', 'Mentorias'];
        } else if (escola.nome.includes('British') || escola.nome.includes('American') || escola.nome.includes('Alem') || escola.nome.includes('Franco')) {
          internacional = 'Currículo internacional reconhecido';
          bilingue = 'Ensino em língua estrangeira';
          inclusao = 'Sistema internacional de educação especial. Atende TEA, TDAH, dislexia com equipe especializada e planos individualizados.';
          diferenciais = ['Diploma internacional', 'Preparação para universidades no exterior'];
          atividades = ['International Sports', 'Arts', 'Drama', 'Model UN'];
        } else if (escola.nome.includes('Santo Inácio') || escola.nome.includes('Jesuíta')) {
          inclusao = 'Educação jesuíta inclusiva. Atende diversos perfis com acompanhamento pastoral e psicopedagógico.';
          diferenciais = ['Tradição jesuíta', 'Formação humanística', 'Valores cristãos'];
          atividades = ['Pastoral', 'Voluntariado', 'Olimpíadas'];
        } else if (escola.nome.includes('Parque')) {
          metodologia = 'sociointeracionista';
          inclusao = 'Educação progressista e inclusiva. Forte em atender superdotação e perfis criativos. Respeita ritmos individuais.';
          diferenciais = ['Pioneirismo educacional', 'Projetos interdisciplinares', 'Artes integradas'];
          atividades = ['Artes', 'Teatro', 'Música', 'Projetos', 'Ateliês'];
        } else if (mensalidade > 40000) {
          inclusao = 'Acompanhamento psicopedagógico disponível. Atende diversos perfis com suporte individualizado e adaptações curriculares.';
          diferenciais = ['Infraestrutura completa', 'Corpo docente qualificado', 'Turmas reduzidas'];
          atividades = ['Olimpíadas', 'Laboratórios', 'Esportes', 'Artes'];
        } else if (mensalidade > 20000) {
          inclusao = 'Atendimento básico a necessidades especiais. Adaptações pedagógicas mediante avaliação.';
          diferenciais = ['Ensino particular de qualidade', 'Acompanhamento próximo'];
          atividades = ['Esportes', 'Reforço escolar', 'Olimpíadas'];
        } else {
          inclusao = 'Informações sobre inclusão disponíveis mediante consulta à escola.';
          diferenciais = ['Educação de qualidade'];
          atividades = ['Atividades curriculares'];
        }
      }
      // Escolas públicas estaduais/municipais
      else {
        inclusao = 'Atendimento conforme diretrizes de educação inclusiva pública. Sala de recursos quando disponível.';
        diferenciais = ['Ensino público gratuito'];
        atividades = ['Atividades curriculares', 'Esportes'];

        if (escola.nome.includes('FAETEC')) {
          inclusao = 'Ensino técnico público com suporte a necessidades especiais. Atende diversos perfis com adaptações.';
          diferenciais.push('Ensino técnico gratuito', 'Qualidade FAETEC');
          atividades.push('Cursos técnicos', 'Laboratórios');
        }
      }

      // Inserir ou atualizar
      if (infoExistente) {
        await db
          .update(informacoesEscola)
          .set({
            inclusao,
            metodologia,
            diferenciais,
            atividades_extracurriculares: atividades,
            bilingue,
            internacional,
          })
          .where(eq(informacoesEscola.id, infoExistente.id));
        atualizadas++;
      } else {
        await db.insert(informacoesEscola).values({
          escola_id: escola.id,
          inclusao,
          metodologia,
          diferenciais,
          atividades_extracurriculares: atividades,
          bilingue,
          internacional,
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
    console.error('Erro detalhado:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

popularInclusao();
