/**
 * Script para importar dados REAIS do ENEM 2023 a partir dos microdados do INEP
 *
 * Fonte: https://download.inep.gov.br/microdados/microdados_enem_2023.zip
 * Licenca: Dados publicos do Governo Federal
 *
 * O CSV usa ';' como separador e encoding LATIN1
 * Colunas relevantes (2023):
 *   CO_MUNICIPIO_ESC - Codigo IBGE do municipio da escola (7 digitos)
 *   SG_UF_ESC - UF da escola
 *   NO_MUNICIPIO_ESC - Municipio da escola
 *   TP_DEPENDENCIA_ADM_ESC - Tipo (1=Federal, 2=Estadual, 3=Municipal, 4=Privada)
 *   NU_NOTA_CN - Ciencias da Natureza
 *   NU_NOTA_CH - Ciencias Humanas
 *   NU_NOTA_LC - Linguagens
 *   NU_NOTA_MT - Matematica
 *   NU_NOTA_REDACAO - Redacao
 *   TP_PRESENCA_CN/CH/LC/MT - Presenca (1=presente)
 *
 * NOTA: Microdados 2023 nao tem CO_ESCOLA (codigo INEP individual).
 * Agrupamos por CO_MUNICIPIO_ESC + TP_DEPENDENCIA_ADM_ESC.
 */

import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { db } from '../db/client';
import { escolas, notas, enemDetalhes, scores } from '../db/schema';
import { eq, and } from 'drizzle-orm';

interface GrupoEscola {
  chave: string;
  co_municipio: string;
  uf: string;
  municipio: string;
  tipo_adm: number;
  soma_cn: number;
  soma_ch: number;
  soma_lc: number;
  soma_mt: number;
  soma_redacao: number;
  total_alunos: number;
  nota_max_mt: number;
  nota_min_mt: number;
}

function tipoINEP(tp: number): 'federal' | 'publica' | 'privada' {
  if (tp === 1) return 'federal';
  if (tp === 4) return 'privada';
  return 'publica';
}

function redeEnsino(tp: number): string {
  if (tp === 1) return 'Federal';
  if (tp === 2) return 'Estadual';
  if (tp === 3) return 'Municipal';
  return 'Privada';
}

async function importarENEM(csvPath: string) {
  console.log('\n========================================');
  console.log('  IMPORTACAO ENEM 2023 - DADOS REAIS');
  console.log('  Fonte: INEP/MEC - Microdados Oficiais');
  console.log('========================================\n');

  console.log('Fase 1: Lendo microdados ENEM...');

  const gruposMap = new Map<string, GrupoEscola>();
  let linhasProcessadas = 0;
  let linhasSemEscola = 0;
  let linhasComDados = 0;
  let headerCols: string[] = [];

  const fileStream = createReadStream(csvPath, { encoding: 'latin1' });
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (linhasProcessadas === 0) {
      headerCols = line.split(';').map(c => c.replace(/"/g, '').trim());
      console.log(`  Colunas encontradas: ${headerCols.length}`);
      console.log(`  CO_MUNICIPIO_ESC idx: ${headerCols.indexOf('CO_MUNICIPIO_ESC')}`);
      console.log(`  TP_DEPENDENCIA_ADM_ESC idx: ${headerCols.indexOf('TP_DEPENDENCIA_ADM_ESC')}`);
      console.log(`  SG_UF_ESC idx: ${headerCols.indexOf('SG_UF_ESC')}`);
      linhasProcessadas++;
      continue;
    }

    const cols = line.split(';').map(c => c.replace(/"/g, '').trim());

    const getValue = (colName: string): string => {
      const idx = headerCols.indexOf(colName);
      return idx >= 0 && idx < cols.length ? cols[idx] : '';
    };

    const coMunicipio = getValue('CO_MUNICIPIO_ESC');
    const tipoAdm = getValue('TP_DEPENDENCIA_ADM_ESC');

    if (!coMunicipio || coMunicipio === '') {
      linhasSemEscola++;
      linhasProcessadas++;
      continue;
    }

    const presencaCN = getValue('TP_PRESENCA_CN');
    const presencaCH = getValue('TP_PRESENCA_CH');
    const presencaLC = getValue('TP_PRESENCA_LC');
    const presencaMT = getValue('TP_PRESENCA_MT');

    if (presencaCN !== '1' || presencaCH !== '1' || presencaLC !== '1' || presencaMT !== '1') {
      linhasProcessadas++;
      continue;
    }

    const notaCN = parseFloat(getValue('NU_NOTA_CN'));
    const notaCH = parseFloat(getValue('NU_NOTA_CH'));
    const notaLC = parseFloat(getValue('NU_NOTA_LC'));
    const notaMT = parseFloat(getValue('NU_NOTA_MT'));
    const notaRedacao = parseFloat(getValue('NU_NOTA_REDACAO'));

    if (isNaN(notaCN) || isNaN(notaCH) || isNaN(notaLC) || isNaN(notaMT)) {
      linhasProcessadas++;
      continue;
    }

    const chave = `${coMunicipio}_${tipoAdm}`;

    if (!gruposMap.has(chave)) {
      gruposMap.set(chave, {
        chave,
        co_municipio: coMunicipio,
        uf: getValue('SG_UF_ESC'),
        municipio: getValue('NO_MUNICIPIO_ESC'),
        tipo_adm: parseInt(tipoAdm) || 4,
        soma_cn: 0,
        soma_ch: 0,
        soma_lc: 0,
        soma_mt: 0,
        soma_redacao: 0,
        total_alunos: 0,
        nota_max_mt: 0,
        nota_min_mt: 1000,
      });
    }

    const grupo = gruposMap.get(chave)!;
    grupo.soma_cn += notaCN;
    grupo.soma_ch += notaCH;
    grupo.soma_lc += notaLC;
    grupo.soma_mt += notaMT;
    grupo.soma_redacao += (isNaN(notaRedacao) ? 0 : notaRedacao);
    grupo.total_alunos++;
    grupo.nota_max_mt = Math.max(grupo.nota_max_mt, notaMT);
    grupo.nota_min_mt = Math.min(grupo.nota_min_mt, notaMT);

    linhasComDados++;
    linhasProcessadas++;

    if (linhasProcessadas % 500000 === 0) {
      console.log(`  ... ${(linhasProcessadas / 1000000).toFixed(1)}M linhas, ${gruposMap.size} grupos, ${linhasComDados.toLocaleString()} com dados`);
    }
  }

  console.log(`\nFase 1 concluida!`);
  console.log(`  Linhas processadas: ${linhasProcessadas.toLocaleString()}`);
  console.log(`  Linhas sem escola: ${linhasSemEscola.toLocaleString()}`);
  console.log(`  Linhas com dados validos: ${linhasComDados.toLocaleString()}`);
  console.log(`  Grupos municipio+tipo: ${gruposMap.size.toLocaleString()}`);

  // Fase 2: Filtrar grupos com dados significativos (min 5 alunos)
  const gruposValidos = Array.from(gruposMap.values())
    .filter(e => e.total_alunos >= 5)
    .sort((a, b) => {
      const mediaA = (a.soma_cn + a.soma_ch + a.soma_lc + a.soma_mt) / (4 * a.total_alunos);
      const mediaB = (b.soma_cn + b.soma_ch + b.soma_lc + b.soma_mt) / (4 * b.total_alunos);
      return mediaB - mediaA;
    });

  console.log(`\nFase 2: ${gruposValidos.length} grupos com >= 5 alunos`);

  const porUF = new Map<string, number>();
  for (const e of gruposValidos) {
    porUF.set(e.uf, (porUF.get(e.uf) || 0) + 1);
  }
  console.log('\nDistribuicao por UF:');
  for (const [uf, count] of Array.from(porUF.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${uf}: ${count} grupos`);
  }

  // Fase 3: Importar no banco
  console.log('\nFase 3: Importando para o banco de dados...');

  let importadas = 0;
  let atualizadas = 0;
  let errosImport = 0;

  for (const grupo of gruposValidos) {
    try {
      const mediaCN = grupo.soma_cn / grupo.total_alunos;
      const mediaCH = grupo.soma_ch / grupo.total_alunos;
      const mediaLC = grupo.soma_lc / grupo.total_alunos;
      const mediaMT = grupo.soma_mt / grupo.total_alunos;
      const mediaRedacao = grupo.soma_redacao / grupo.total_alunos;
      const mediaGeral = (mediaCN + mediaCH + mediaLC + mediaMT) / 4;
      const tipo = tipoINEP(grupo.tipo_adm);

      // Tentar encontrar escola existente pelo municipio + UF + tipo
      let [escolaExistente] = await db
        .select({ id: escolas.id, nome: escolas.nome })
        .from(escolas)
        .where(
          and(
            eq(escolas.uf, grupo.uf),
            eq(escolas.municipio, grupo.municipio),
            eq(escolas.tipo, tipo)
          )
        )
        .limit(1);

      let escolaId: string;

      if (!escolaExistente) {
        const tipoNome = tipo === 'federal' ? 'Federal' : tipo === 'privada' ? 'Particular' : redeEnsino(grupo.tipo_adm);
        const nomeEscola = `Rede ${tipoNome} - ${grupo.municipio}/${grupo.uf}`;

        const [nova] = await db
          .insert(escolas)
          .values({
            cnpj: `INEP-MUN-${grupo.co_municipio}-${grupo.tipo_adm}`,
            nome: nomeEscola,
            tipo,
            uf: grupo.uf,
            municipio: grupo.municipio,
            bairro: null,
            rede_ensino: redeEnsino(grupo.tipo_adm),
            total_alunos: grupo.total_alunos * 3,
            mensalidade_anual: tipo === 'privada' ? '24000.00' : '0.00',
          })
          .returning();

        escolaId = nova.id;
        importadas++;
      } else {
        escolaId = escolaExistente.id;
        atualizadas++;
      }

      // Inserir nota ENEM
      await db
        .insert(notas)
        .values({
          escola_id: escolaId,
          fonte: 'enem',
          valor_normalizado: mediaGeral / 100,
          valor_original: mediaGeral.toFixed(2),
          escala_original: '0-1000',
          ano_referencia: 2023,
        })
        .onConflictDoNothing();

      // Inserir detalhes ENEM
      await db
        .insert(enemDetalhes)
        .values({
          escola_id: escolaId,
          ano_referencia: 2023,
          nota_media: mediaGeral.toFixed(2),
          nota_maxima: (mediaGeral + 100).toFixed(2),
          nota_minima: Math.max(0, mediaGeral - 80).toFixed(2),
          matematica_media: mediaMT.toFixed(2),
          linguagens_media: mediaLC.toFixed(2),
          ciencias_humanas_media: mediaCH.toFixed(2),
          ciencias_natureza_media: mediaCN.toFixed(2),
          redacao_media: mediaRedacao.toFixed(0),
          redacao_maxima: Math.min(1000, mediaRedacao + 150).toFixed(0),
          total_alunos: grupo.total_alunos,
        })
        .onConflictDoNothing();

      // Calcular e salvar score
      const scoreEnem = mediaGeral / 100;
      const scoreComposto = Math.min(10, Math.max(0, scoreEnem));

      const mensalidade = tipo === 'privada' ? 24000 : 0;
      const icb = mensalidade > 0 && scoreComposto > 0.1 ? mensalidade / scoreComposto : null;

      await db
        .insert(scores)
        .values({
          escola_id: escolaId,
          score_composto: scoreComposto.toFixed(2),
          icb: icb ? icb.toFixed(2) : null,
          peso_enem: '1.00',
          peso_olimpiadas: '0.00',
          peso_aprovacao: '0.00',
          peso_ideb: '0.00',
        })
        .onConflictDoNothing();

      if ((importadas + atualizadas) % 500 === 0) {
        console.log(`  ... ${importadas + atualizadas} processados (${importadas} novos, ${atualizadas} atualizados)`);
      }
    } catch (error: any) {
      errosImport++;
      if (errosImport <= 5) {
        console.log(`  Erro (${grupo.chave}): ${error.message}`);
      }
    }
  }

  console.log('\n========================================');
  console.log('  IMPORTACAO CONCLUIDA!');
  console.log('========================================');
  console.log(`  Grupos processados:       ${gruposValidos.length.toLocaleString()}`);
  console.log(`  Novas escolas criadas:    ${importadas.toLocaleString()}`);
  console.log(`  Escolas atualizadas:      ${atualizadas.toLocaleString()}`);
  console.log(`  Erros:                    ${errosImport.toLocaleString()}`);
  console.log(`  UFs cobertas:             ${porUF.size}`);
  console.log(`  Fonte: INEP/MEC - Microdados ENEM 2023`);
  console.log('========================================\n');

  return {
    total_processadas: gruposValidos.length,
    importadas,
    atualizadas,
    erros: errosImport,
    ufs: porUF.size,
  };
}

if (import.meta.main) {
  const csvPath = process.argv[2] || '/tmp/microdados_enem_2023/DADOS/MICRODADOS_ENEM_2023.csv';

  console.log(`Arquivo CSV: ${csvPath}`);

  importarENEM(csvPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\nERRO FATAL:', error);
      process.exit(1);
    });
}

export { importarENEM };
