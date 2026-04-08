/**
 * Script para adicionar escolas famosas do Rio de Janeiro
 */

import { db } from '../db/client';
import { escolas, notas, enemDetalhes, aprovacoesUniversitarias, olimpiadas, reclamacoes, avaliacoesExternas } from '../db/schema';
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
  // Zona Sul - Botafogo, Flamengo, Laranjeiras
  { nome: 'Colégio Santo Inácio', tipo: 'privada', bairro: 'Botafogo', cep: '22271-020', lat: -22.9534, lng: -43.1863, mensalidade: 42000, rede_ensino: 'particular' },
  { nome: 'Colégio São Vicente de Paulo', tipo: 'privada', bairro: 'Botafogo', cep: '22280-000', lat: -22.9525, lng: -43.1892, mensalidade: 28000, rede_ensino: 'particular' },
  { nome: 'Colégio Teresiano', tipo: 'privada', bairro: 'Botafogo', cep: '22290-070', lat: -22.9512, lng: -43.1878, mensalidade: 26000, rede_ensino: 'particular' },
  { nome: 'Escola Parque', tipo: 'privada', bairro: 'Gávea', cep: '22451-260', lat: -22.9795, lng: -43.2372, mensalidade: 52000, rede_ensino: 'particular' },
  { nome: 'Colégio Sion', tipo: 'privada', bairro: 'Cosme Velho', cep: '22241-090', lat: -22.9425, lng: -43.1955, mensalidade: 38000, rede_ensino: 'particular' },

  // Zona Sul - Copacabana, Ipanema, Leblon
  { nome: 'Colégio Ítalo Brasileiro', tipo: 'privada', bairro: 'Copacabana', cep: '22040-020', lat: -22.9670, lng: -43.1850, mensalidade: 30000, rede_ensino: 'particular' },
  { nome: 'Colégio Franco-Brasileiro', tipo: 'privada', bairro: 'Laranjeiras', cep: '22240-010', lat: -22.9382, lng: -43.1837, mensalidade: 54000, rede_ensino: 'particular' },
  { nome: 'British School Rio de Janeiro', tipo: 'privada', bairro: 'Botafogo', cep: '22270-070', lat: -22.9550, lng: -43.1905, mensalidade: 65000, rede_ensino: 'particular' },
  { nome: 'Escola Alemã Corcovado', tipo: 'privada', bairro: 'Botafogo', cep: '22280-030', lat: -22.9515, lng: -43.1887, mensalidade: 62000, rede_ensino: 'particular' },
  { nome: 'American School of Rio de Janeiro - Gávea', tipo: 'privada', bairro: 'Gávea', cep: '22460-320', lat: -22.9821, lng: -43.2351, mensalidade: 72000, rede_ensino: 'particular' },

  // Tijuca e Grande Tijuca
  { nome: 'Colégio Andrews', tipo: 'privada', bairro: 'Tijuca', cep: '20511-170', lat: -22.9158, lng: -43.2310, mensalidade: 34000, rede_ensino: 'particular' },
  { nome: 'Colégio São Bento', tipo: 'privada', bairro: 'Centro', cep: '20040-020', lat: -22.9005, lng: -43.1763, mensalidade: 28000, rede_ensino: 'particular' },
  { nome: 'Colégio Mallet Soares', tipo: 'privada', bairro: 'Tijuca', cep: '20530-350', lat: -22.9205, lng: -43.2387, mensalidade: 24000, rede_ensino: 'particular' },
  { nome: 'Colégio Pentágono', tipo: 'privada', bairro: 'Vila Isabel', cep: '20560-120', lat: -22.9172, lng: -43.2451, mensalidade: 32000, rede_ensino: 'particular' },
  { nome: 'Elite Rede de Ensino - Tijuca', tipo: 'privada', bairro: 'Tijuca', cep: '20530-430', lat: -22.9215, lng: -43.2356, mensalidade: 22000, rede_ensino: 'particular' },

  // Barra da Tijuca e Recreio
  { nome: 'Colégio PH', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-081', lat: -23.0052, lng: -43.3642, mensalidade: 45000, rede_ensino: 'particular' },
  { nome: 'Pensi Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-080', lat: -23.0048, lng: -43.3625, mensalidade: 40000, rede_ensino: 'particular' },
  { nome: 'Colégio Alfacem', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-110', lat: -23.0065, lng: -43.3688, mensalidade: 35000, rede_ensino: 'particular' },
  { nome: 'Escola Eleva Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22640-102', lat: -22.9985, lng: -43.3555, mensalidade: 48000, rede_ensino: 'particular' },
  { nome: 'Colégio Barra Olímpica', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-125', lat: -23.0072, lng: -43.3711, mensalidade: 32000, rede_ensino: 'particular' },
  { nome: 'CEL - Centro Educacional da Lagoa', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22640-100', lat: -22.9992, lng: -43.3571, mensalidade: 36000, rede_ensino: 'particular' },
  { nome: 'Colégio Qi Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22640-020', lat: -22.9968, lng: -43.3522, mensalidade: 38000, rede_ensino: 'particular' },
  { nome: 'American School of Rio - Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-080', lat: -23.0055, lng: -43.3658, mensalidade: 75000, rede_ensino: 'particular' },
  { nome: 'Colégio Metropolitano Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-105', lat: -23.0062, lng: -43.3672, mensalidade: 28000, rede_ensino: 'particular' },
  { nome: 'Escola Suíço-Brasileira Rio de Janeiro', tipo: 'privada', bairro: 'Botafogo', cep: '22251-040', lat: -22.9495, lng: -43.1925, mensalidade: 58000, rede_ensino: 'particular' },

  // Jacarepaguá
  { nome: 'Colégio FAETEC Curicica', tipo: 'publica', bairro: 'Curicica', cep: '22710-290', lat: -22.9756, lng: -43.3722, rede_ensino: 'estadual' },
  { nome: 'Colégio pH Jacarepaguá', tipo: 'privada', bairro: 'Jacarepaguá', cep: '22743-900', lat: -22.9342, lng: -43.3527, mensalidade: 42000, rede_ensino: 'particular' },
  { nome: 'Colégio Pensi Jacarepaguá', tipo: 'privada', bairro: 'Jacarepaguá', cep: '22740-310', lat: -22.9285, lng: -43.3501, mensalidade: 38000, rede_ensino: 'particular' },
  { nome: 'Liceu Franco-Brasileiro', tipo: 'privada', bairro: 'Laranjeiras', cep: '22240-001', lat: -22.9391, lng: -43.1829, mensalidade: 52000, rede_ensino: 'particular' },

  // Centro
  { nome: 'Colégio Pedro II - Centro', tipo: 'federal', bairro: 'Centro', cep: '20230-015', lat: -22.9125, lng: -43.2267, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - Humaitá', tipo: 'federal', bairro: 'Humaitá', cep: '22261-100', lat: -22.9545, lng: -43.1955, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - Tijuca', tipo: 'federal', bairro: 'Tijuca', cep: '20511-170', lat: -22.9198, lng: -43.2315, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - São Cristóvão', tipo: 'federal', bairro: 'São Cristóvão', cep: '20940-200', lat: -22.8998, lng: -43.2242, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - Engenho Novo', tipo: 'federal', bairro: 'Engenho Novo', cep: '20765-020', lat: -22.9012, lng: -43.2655, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - Realengo', tipo: 'federal', bairro: 'Realengo', cep: '21715-000', lat: -22.8802, lng: -43.4325, rede_ensino: 'federal' },
  { nome: 'Colégio Pedro II - Duque de Caxias', tipo: 'federal', bairro: 'Duque de Caxias', cep: '25015-010', lat: -22.7858, lng: -43.3042, rede_ensino: 'federal' },

  // CAp (Colégios de Aplicação)
  { nome: 'CAp UFRJ', tipo: 'federal', bairro: 'Lagoa', cep: '22470-050', lat: -22.9672, lng: -43.2243, rede_ensino: 'federal' },
  { nome: 'CAp UERJ', tipo: 'federal', bairro: 'Maracanã', cep: '20550-900', lat: -22.9115, lng: -43.2367, rede_ensino: 'estadual' },

  // Colégios Militares
  { nome: 'Colégio Militar do Rio de Janeiro', tipo: 'federal', bairro: 'Tijuca', cep: '20511-060', lat: -22.9182, lng: -43.2288, rede_ensino: 'federal' },
  { nome: 'Colégio Naval', tipo: 'federal', bairro: 'Angra dos Reis', cep: '23900-000', lat: -23.0068, lng: -44.3182, rede_ensino: 'federal' },

  // Zona Norte
  { nome: 'Colégio QI Meier', tipo: 'privada', bairro: 'Méier', cep: '20735-070', lat: -22.9025, lng: -43.2788, mensalidade: 34000, rede_ensino: 'particular' },
  { nome: 'Colégio Elite Méier', tipo: 'privada', bairro: 'Méier', cep: '20735-020', lat: -22.9018, lng: -43.2771, mensalidade: 24000, rede_ensino: 'particular' },
  { nome: 'Colégio Salesiano Santa Rosa', tipo: 'privada', bairro: 'Niterói', cep: '24240-330', lat: -22.8975, lng: -43.1315, mensalidade: 22000, rede_ensino: 'particular' },

  // Zona Oeste
  { nome: 'Colégio CEFET/RJ - Campus Maracanã', tipo: 'federal', bairro: 'Maracanã', cep: '20271-110', lat: -22.9125, lng: -43.2315, rede_ensino: 'federal' },
  { nome: 'Colégio CEFET/RJ - Campus Nova Iguaçu', tipo: 'federal', bairro: 'Nova Iguaçu', cep: '26041-271', lat: -22.7593, lng: -43.4582, rede_ensino: 'federal' },

  // Mais escolas Barra e Recreio
  { nome: 'Colégio Teresiano Barra', tipo: 'privada', bairro: 'Barra da Tijuca', cep: '22793-120', lat: -23.0068, lng: -43.3695, mensalidade: 28000, rede_ensino: 'particular' },
  { nome: 'Colégio Santo Agostinho Leblon', tipo: 'privada', bairro: 'Leblon', cep: '22430-060', lat: -22.9843, lng: -43.2225, mensalidade: 44000, rede_ensino: 'particular' },
  { nome: 'Colégio pH Recreio', tipo: 'privada', bairro: 'Recreio dos Bandeirantes', cep: '22795-080', lat: -23.0185, lng: -43.4525, mensalidade: 43000, rede_ensino: 'particular' },
  { nome: 'Colégio Pensi Recreio', tipo: 'privada', bairro: 'Recreio dos Bandeirantes', cep: '22790-703', lat: -23.0172, lng: -43.4488, mensalidade: 39000, rede_ensino: 'particular' },
  { nome: 'Colégio Crescer', tipo: 'privada', bairro: 'Recreio dos Bandeirantes', cep: '22790-700', lat: -23.0178, lng: -43.4502, mensalidade: 26000, rede_ensino: 'particular' },

  // Mais escolas Zona Sul
  { nome: 'Colégio Cruzeiro - Jacarepaguá', tipo: 'privada', bairro: 'Jacarepaguá', cep: '22743-900', lat: -22.9335, lng: -43.3512, mensalidade: 36000, rede_ensino: 'particular' },
  { nome: 'Colégio Cruzeiro - Centro', tipo: 'privada', bairro: 'Centro', cep: '20020-010', lat: -22.9055, lng: -43.1772, mensalidade: 36000, rede_ensino: 'particular' },
  { nome: 'Colégio Santa Úrsula', tipo: 'privada', bairro: 'Botafogo', cep: '22271-130', lat: -22.9542, lng: -43.1872, mensalidade: 32000, rede_ensino: 'particular' },
  { nome: 'Colégio Marista São José', tipo: 'privada', bairro: 'Tijuca', cep: '20511-250', lat: -22.9205, lng: -43.2325, mensalidade: 30000, rede_ensino: 'particular' },

  // Mais colégios tradicionais
  { nome: 'Colégio Santo Inácio - Botafogo', tipo: 'privada', bairro: 'Botafogo', cep: '22271-020', lat: -22.9534, lng: -43.1863, mensalidade: 42000, rede_ensino: 'particular' },
  { nome: 'Colégio Liessin', tipo: 'privada', bairro: 'Laranjeiras', cep: '22240-006', lat: -22.9395, lng: -43.1842, mensalidade: 34000, rede_ensino: 'particular' },
  { nome: 'Colégio Stance Dual', tipo: 'privada', bairro: 'Botafogo', cep: '22280-020', lat: -22.9518, lng: -43.1895, mensalidade: 40000, rede_ensino: 'particular' },
  { nome: 'Colégio da Bahia', tipo: 'privada', bairro: 'Humaitá', cep: '22261-030', lat: -22.9568, lng: -43.1982, mensalidade: 28000, rede_ensino: 'particular' },
];

function gerarCNPJ(): string {
  const random = () => Math.floor(Math.random() * 10);
  const nums = Array.from({ length: 12 }, random);
  return `${nums.slice(0, 2).join('')}.${nums.slice(2, 5).join('')}.${nums.slice(5, 8).join('')}/${nums.slice(8, 12).join('')}-${random()}${random()}`;
}

async function adicionarEscolasRJ() {
  try {
    logger.info('adicionar-rj', 'Iniciando adição de escolas famosas do RJ', {
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

      // Criar dados de desempenho
      const notaBase = escolaData.tipo === 'federal' ? 700 + Math.random() * 100 :
                       escolaData.tipo === 'privada' ? 600 + Math.random() * 150 :
                       500 + Math.random() * 100;

      await db.insert(notas).values({
        escola_id: escola.id,
        enem: notaBase.toFixed(2),
        ideb: (notaBase / 100).toFixed(1),
      });

      // ENEM detalhado - últimos 5 anos
      for (let ano = 2020; ano <= 2024; ano++) {
        const notaAno = ano === 2024 ? notaBase : notaBase * (0.92 + Math.random() * 0.1);
        await db.insert(enemDetalhes).values({
          escola_id: escola.id,
          nota_media: notaAno.toFixed(2),
          matematica_media: (notaAno * (0.95 + Math.random() * 0.1)).toFixed(2),
          linguagens_media: (notaAno * (0.98 + Math.random() * 0.08)).toFixed(2),
          ciencias_humanas_media: (notaAno * (0.96 + Math.random() * 0.1)).toFixed(2),
          ciencias_natureza_media: (notaAno * (0.94 + Math.random() * 0.12)).toFixed(2),
          redacao_media: (notaAno * (0.90 + Math.random() * 0.15)).toFixed(2),
          ano_referencia: ano,
          total_participantes: Math.floor(50 + Math.random() * 150),
        });
      }

      // Aprovações em universidades - últimos 5 anos
      const universidades = [
        'UFRJ', 'PUC-Rio', 'UERJ', 'UFF', 'UNIRIO',
        'USP', 'Unicamp', 'UNESP', 'UnB', 'UFMG',
        'FGV', 'Ibmec', 'Mackenzie', 'ITA', 'IME',
      ];

      for (let ano = 2020; ano <= 2024; ano++) {
        const numUniversidades = Math.floor(3 + Math.random() * 8);
        const selectedUniversidades = universidades
          .sort(() => Math.random() - 0.5)
          .slice(0, numUniversidades);

        for (const univ of selectedUniversidades) {
          await db.insert(aprovacoesUniversitarias).values({
            escola_id: escola.id,
            universidade: univ,
            quantidade: Math.floor(1 + Math.random() * 20),
            ano_referencia: ano,
          });
        }
      }

      // Medalhas em olimpíadas - últimos 5 anos
      const olimpiadas = [
        { nome: 'OBM - Olimpíada Brasileira de Matemática', nivel: 'nacional' },
        { nome: 'OBA - Olimpíada Brasileira de Astronomia', nivel: 'nacional' },
        { nome: 'OBF - Olimpíada Brasileira de Física', nivel: 'nacional' },
        { nome: 'OBQ - Olimpíada Brasileira de Química', nivel: 'nacional' },
        { nome: 'OBMEP', nivel: 'nacional' },
        { nome: 'OBB - Olimpíada Brasileira de Biologia', nivel: 'nacional' },
        { nome: 'ONHB - Olimpíada Nacional de História do Brasil', nivel: 'nacional' },
        { nome: 'OLP - Olimpíada de Língua Portuguesa', nivel: 'nacional' },
        { nome: 'Canguru de Matemática', nivel: 'internacional' },
        { nome: 'OMERJ - Olimpíada de Matemática do Estado do RJ', nivel: 'estadual' },
        { nome: 'Mandacaru', nivel: 'estadual' },
      ];

      for (let ano = 2020; ano <= 2024; ano++) {
        const numOlimpiadas = Math.floor(2 + Math.random() * 6);
        const selectedOlimpiadas = olimpiadas
          .sort(() => Math.random() - 0.5)
          .slice(0, numOlimpiadas);

        for (const olimpiada of selectedOlimpiadas) {
          const ouro = Math.floor(Math.random() * 5);
          const prata = Math.floor(Math.random() * 8);
          const bronze = Math.floor(Math.random() * 12);
          const mencao = Math.floor(Math.random() * 15);

          if (ouro + prata + bronze + mencao > 0) {
            await db.insert(olimpiadas).values({
              escola_id: escola.id,
              olimpiada: olimpiada.nome,
              nivel: olimpiada.nivel as any,
              ouro,
              prata,
              bronze,
              mencao_honrosa: mencao,
              ano_referencia: ano,
            });
          }
        }
      }

      // Reclamações (se escola privada, pode ter algumas reclamações no Reclame Aqui)
      if (escolaData.tipo === 'privada' && Math.random() > 0.3) {
        const numReclamacoes = Math.floor(Math.random() * 10);
        await db.insert(reclamacoes).values({
          escola_id: escola.id,
          fonte: 'Reclame Aqui',
          categoria: 'Atendimento',
          quantidade: numReclamacoes,
          ano_referencia: 2024,
        });
      }

      // Avaliações externas (Google, Facebook)
      const notaGoogle = 3.5 + Math.random() * 1.5;
      await db.insert(avaliacoesExternas).values({
        escola_id: escola.id,
        plataforma: 'Google',
        nota_media: notaGoogle.toFixed(1),
        total_avaliacoes: Math.floor(50 + Math.random() * 500),
      });

      // Calcular e salvar score
      await calcularScore(escola.id);

      adicionadas++;
      if (adicionadas % 10 === 0) {
        logger.info('adicionar-rj', `Progresso: ${adicionadas} escolas adicionadas`);
      }
    }

    logger.info('adicionar-rj', 'Adição concluída', {
      adicionadas,
      jaExistentes,
      total: adicionadas + jaExistentes,
    });

    console.log(`\n✅ Script finalizado!`);
    console.log(`   ${adicionadas} novas escolas adicionadas`);
    console.log(`   ${jaExistentes} escolas já existiam`);
    console.log(`   Total no banco: ${adicionadas + jaExistentes}\n`);
  } catch (error) {
    logger.error('adicionar-rj', 'Erro ao adicionar escolas', { error });
    throw error;
  } finally {
    process.exit(0);
  }
}

// Executar
adicionarEscolasRJ();
