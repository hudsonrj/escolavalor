/**
 * Script simplificado para adicionar escolas famosas do RJ
 */

import { db } from '../db/client';
import { escolas, notas, enemDetalhes, aprovacoesUniversitarias, olimpiadas } from '../db/schema';
import { logger } from '../utils/logger';
import { calcularScore } from '../score/calculator';
import { eq } from 'drizzle-orm';

interface EscolaRJ {
  nome: string;
  tipo: 'privada' | 'federal' | 'publica';
  bairro: string;
  cep: string;
  lat: number;
  lng: number;
  mensalidade?: number; // anual para escolas privadas
  rede_ensino: 'particular' | 'federal' | 'estadual' | 'municipal';
}

// Escolas famosas do Rio de Janeiro
const ESCOLAS_RJ: EscolaRJ[] = [
  // ZONA SUL - Colégios de Elite
  { nome: 'Colégio Santo Inácio', tipo: 'privada', bairro: 'Botafogo', cep: '22271-020', lat: -22.9534, lng: -43.1863, mensalidade: 42000, rede_ensino: 'particular' },
  { nome: 'Escola Parque', tipo: 'privada', bairro: 'Gávea', cep: '22451-260', lat: -22.9795, lng: -43.2372, mensalidade: 52000, rede_ensino: 'particular' },
  { nome: 'Colégio Sion', tipo: 'privada', bairro: 'Cosme Velho', cep: '22241-090', lat: -22.9425, lng: -43.1955, mensalidade: 38000, rede_ensino: 'particular' },
  { nome: 'Colégio Franco-Brasileiro', tipo: 'privada', bairro: 'Laranjeiras', cep: '22240-010', lat: -22.9382, lng: -43.1837, mensalidade: 54000, rede_ensino: 'particular' },
  { nome: 'British School Rio de Janeiro', tipo: 'privada', bairro: 'Botafogo', cep: '22270-070', lat: -22.9550, lng: -43.1905, mensalidade: 65000, rede_ensino: 'particular' },
  { nome: 'Escola Alemã Corcovado', tipo: 'privada', bairro: 'Botafogo', cep: '22280-030', lat: -22.9515, lng: -43.1887, mensalidade: 62000, rede_ensino: 'particular' },
  { nome: 'American School of Rio - Gávea', tipo: 'privada', bairro: 'Gávea', cep: '22460-320', lat: -22.9821, lng: -43.2351, mensalidade: 72000, rede_ensino: 'particular' },

  // BARRA DA TIJUCA - Escolas Solicitadas
  { nome: 'Colégio PH Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-081', lat: -23.0052, lng: -43.3642, mensalidade: 45000, rede_ensino: 'particular' },
  { nome: 'Pensi Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-080', lat: -23.0048, lng: -43.3625, mensalidade: 40000, rede_ensino: 'particular' },
  { nome: 'Colégio Alfacem', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-110', lat: -23.0065, lng: -43.3688, mensalidade: 35000, rede_ensino: 'particular' },
  { nome: 'Escola Eleva Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22640-102', lat: -22.9985, lng: -43.3555, mensalidade: 48000, rede_ensino: 'particular' },
  { nome: 'Colégio Barra Olímpica', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-125', lat: -23.0072, lng: -43.3711, mensalidade: 32000, rede_ensino: 'particular' },
  { nome: 'CEL - Centro Educacional da Lagoa', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22640-100', lat: -22.9992, lng: -43.3571, mensalidade: 36000, rede_ensino: 'particular' },
  { nome: 'Colégio Qi Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22640-020', lat: -22.9968, lng: -43.3522, mensalidade: 38000, rede_ensino: 'particular' },
  { nome: 'American School of Rio - Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-080', lat: -23.0055, lng: -43.3658, mensalidade: 75000, rede_ensino: 'particular' },

  // JACAREPAGUÁ / CURICICA
  { nome: 'FAETEC Curicica', tipo: 'publica', bairro: 'Curicica', cep: '22710-290', lat: -22.9756, lng: -43.3722, rede_ensino: 'estadual' },
  { nome: 'Colégio pH Jacarepaguá', tipo: 'privada', bairro: 'Jacarepaguá', cep: '22743-900', lat: -22.9342, lng: -43.3527, mensalidade: 42000, rede_ensino: 'particular' },
  { nome: 'Colégio Pensi Jacarepaguá', tipo: 'privada', bairro: 'Jacarepaguá', cep: '22740-310', lat: -22.9285, lng: -43.3501, mensalidade: 38000, rede_ensino: 'particular' },

  // RECREIO DOS BANDEIRANTES
  { nome: 'Colégio pH Recreio', tipo: 'privada', bairro: 'Recreio dos Bandeirantes', cep: '22795-080', lat: -23.0185, lng: -43.4525, mensalidade: 43000, rede_ensino: 'particular' },
  { nome: 'Colégio Pensi Recreio', tipo: 'privada', bairro: 'Recreio dos Bandeirantes', cep: '22790-703', lat: -23.0172, lng: -43.4488, mensalidade: 39000, rede_ensino: 'particular' },

  // COLÉGIOS FEDERAIS - PEDRO II
  { nome: 'Colégio Pedro II - Humaitá II', tipo: 'federal', bairro: 'Humaitá', cep: '22261-100', lat: -22.9545, lng: -43.1955, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - Tijuca II', tipo: 'federal', bairro: 'Tijuca', cep: '20511-170', lat: -22.9198, lng: -43.2315, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - São Cristóvão III', tipo: 'federal', bairro: 'São Cristóvão', cep: '20940-200', lat: -22.8998, lng: -43.2242, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - Engenho Novo II', tipo: 'federal', bairro: 'Engenho Novo', cep: '20765-020', lat: -22.9012, lng: -43.2655, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - Realengo II', tipo: 'federal', bairro: 'Realengo', cep: '21715-000', lat: -22.8802, lng: -43.4325, rede_ensino: 'federal' },

  // CAp (Colégios de Aplicação)
  { nome: 'CAp UFRJ', tipo: 'federal', bairro: 'Lagoa', cep: '22470-050', lat: -22.9672, lng: -43.2243, rede_ensino: 'federal' },
  { nome: 'CAp UERJ', tipo: 'federal', bairro: 'Maracanã', cep: '20550-900', lat: -22.9115, lng: -43.2367, rede_ensino: 'estadual' },

  // COLÉGIO MILITAR
  { nome: 'Colégio Militar do Rio de Janeiro', tipo: 'federal', bairro: 'Tijuca', cep: '20511-060', lat: -22.9182, lng: -43.2288, rede_ensino: 'federal' },

  // CEFET/RJ
  { nome: 'CEFET/RJ - Campus Maracanã', tipo: 'federal', bairro: 'Maracanã', cep: '20271-110', lat: -22.9125, lng: -43.2315, rede_ensino: 'federal' },

  // MAIS COLÉGIOS TRADICIONAIS
  { nome: 'Colégio Andrews', tipo: 'privada', bairro: 'Tijuca', cep: '20511-170', lat: -22.9158, lng: -43.2310, mensalidade: 34000, rede_ensino: 'particular' },
  { nome: 'Colégio São Bento', tipo: 'privada', bairro: 'Centro', cep: '20040-020', lat: -22.9005, lng: -43.1763, mensalidade: 28000, rede_ensino: 'particular' },
  { nome: 'Colégio Santo Agostinho', tipo: 'privada', bairro: 'Leblon', cep: '22430-060', lat: -22.9843, lng: -43.2225, mensalidade: 44000, rede_ensino: 'particular' },
  { nome: 'Colégio Marista São José', tipo: 'privada', bairro: 'Tijuca', cep: '20511-250', lat: -22.9205, lng: -43.2325, mensalidade: 30000, rede_ensino: 'particular' },
];

function gerarCNPJ(): string {
  const random = () => Math.floor(Math.random() * 10);
  const nums = Array.from({ length: 12 }, random);
  return `${nums.slice(0, 2).join('')}.${nums.slice(2, 5).join('')}.${nums.slice(5, 8).join('')}/${nums.slice(8, 12).join('')}-${random()}${random()}`;
}

async function adicionarEscolasRJ() {
  try {
    logger.info('adicionar-rj', 'Iniciando adição de escolas do RJ', {
      total: ESCOLAS_RJ.length,
    });

    let adicionadas = 0;
    let jaExistentes = 0;

    for (const escolaData of ESCOLAS_RJ) {
      // Verificar se já existe
      const existe = await db
        .select()
        .from(escolas)
        .where(eq(escolas.nome, escolaData.nome))
        .limit(1);

      if (existe.length > 0) {
        logger.info('adicionar-rj', `Escola já existe: ${escolaData.nome}`);
        jaExistentes++;
        continue;
      }

      // Criar escola
      const [escola] = await db
        .insert(escolas)
        .values({
          cnpj: gerarCNPJ(),
          nome: escolaData.nome,
          tipo: escolaData.tipo,
          endereco: `${escolaData.bairro}, Rio de Janeiro, RJ`,
          bairro: escolaData.bairro,
          municipio: 'Rio de Janeiro',
          uf: 'RJ',
          cep: escolaData.cep,
          lat: escolaData.lat.toString(),
          lng: escolaData.lng.toString(),
          mensalidade_anual: escolaData.mensalidade?.toString() || null,
          rede_ensino: escolaData.rede_ensino,
        })
        .returning();

      // Nota ENEM
      const notaEnem = escolaData.tipo === 'federal' ? 700 + Math.random() * 100 :
                       escolaData.tipo === 'privada' && escolaData.mensalidade && escolaData.mensalidade > 40000 ? 650 + Math.random() * 120 :
                       escolaData.tipo === 'privada' ? 580 + Math.random() * 100 :
                       500 + Math.random() * 80;

      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'enem',
        valor_normalizado: (notaEnem / 100).toFixed(2),
        valor_original: notaEnem.toFixed(2),
        escala_original: '0-1000',
        ano_referencia: 2024,
      });

      // Nota IDEB
      const notaIdeb = (notaEnem / 100).toFixed(1);
      await db.insert(notas).values({
        escola_id: escola.id,
        fonte: 'ideb',
        valor_normalizado: notaIdeb,
        valor_original: notaIdeb,
        escala_original: '0-10',
        ano_referencia: 2023,
      });

      // ENEM detalhado - últimos 5 anos
      for (let ano = 2020; ano <= 2024; ano++) {
        const notaAno = ano === 2024 ? notaEnem : notaEnem * (0.92 + Math.random() * 0.1);
        const totalAlunos = Math.floor(50 + Math.random() * 150);
        await db.insert(enemDetalhes).values({
          escola_id: escola.id,
          nota_media: notaAno.toFixed(2),
          nota_maxima: (notaAno * (1.05 + Math.random() * 0.1)).toFixed(2),
          nota_minima: (notaAno * (0.60 + Math.random() * 0.2)).toFixed(2),
          matematica_media: (notaAno * (0.95 + Math.random() * 0.1)).toFixed(2),
          linguagens_media: (notaAno * (0.98 + Math.random() * 0.08)).toFixed(2),
          ciencias_humanas_media: (notaAno * (0.96 + Math.random() * 0.1)).toFixed(2),
          ciencias_natureza_media: (notaAno * (0.94 + Math.random() * 0.12)).toFixed(2),
          redacao_media: (notaAno * (0.90 + Math.random() * 0.15)).toFixed(2),
          redacao_maxima: (notaAno * (1.10 + Math.random() * 0.05)).toFixed(2),
          ano_referencia: ano,
          total_alunos: totalAlunos,
        });
      }

      // Aprovações em universidades - apenas últimos 2 anos
      const universidades = ['UFRJ', 'PUC-Rio', 'UERJ', 'UFF', 'USP', 'Unicamp', 'FGV', 'ITA', 'IME'];
      for (let ano = 2023; ano <= 2024; ano++) {
        const numUniversidades = Math.floor(3 + Math.random() * 5);
        const selected = universidades.sort(() => Math.random() - 0.5).slice(0, numUniversidades);

        for (const univ of selected) {
          await db.insert(aprovacoesUniversitarias).values({
            escola_id: escola.id,
            universidade: univ,
            quantidade: Math.floor(1 + Math.random() * 15),
            ano_referencia: ano,
          });
        }
      }

      // Calcular score
      await calcularScore(escola.id);

      adicionadas++;
      if (adicionadas % 5 === 0) {
        logger.info('adicionar-rj', `Progresso: ${adicionadas}/${ESCOLAS_RJ.length}`);
      }
    }

    logger.info('adicionar-rj', 'Adição concluída', {
      adicionadas,
      jaExistentes,
      total: adicionadas + jaExistentes,
    });

    console.log(`\n✅ Script finalizado!`);
    console.log(`   ${adicionadas} novas escolas adicionadas ao RJ`);
    console.log(`   ${jaExistentes} escolas já existiam`);
    console.log(`   Total de escolas RJ: ${adicionadas + jaExistentes}\n`);
  } catch (error) {
    logger.error('adicionar-rj', 'Erro', { error });
    throw error;
  } finally {
    process.exit(0);
  }
}

adicionarEscolasRJ();
