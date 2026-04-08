/**
 * Script para gerar MASSIVAMENTE escolas brasileiras
 * Expande de ~100 para 1000+ escolas
 */

import { db } from '../db/client';
import { escolas } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

// Prefixos comuns de escolas no Brasil
const PREFIXOS = [
  'Colégio', 'Escola', 'Instituto', 'Centro Educacional', 'Colégio Estadual',
  'Escola Municipal', 'EMEF', 'EMEI', 'EEEF', 'Centro de Ensino',
  'Colégio Técnico', 'Escola Técnica', 'Instituto Federal'
];

// Nomes de santos e personalidades (comum em escolas)
const NOMES_SANTOS = [
  'Santo Agostinho', 'São José', 'São Francisco', 'Santa Teresinha',
  'Dom Bosco', 'Santa Catarina', 'São João', 'Nossa Senhora',
  'Santo Antônio', 'São Paulo', 'Santa Maria', 'São Pedro',
  'São Lucas', 'Santa Rita', 'São Miguel', 'Santa Luzia'
];

const NOMES_PERSONALIDADES = [
  'Machado de Assis', 'Villa-Lobos', 'Cecília Meireles', 'Carlos Drummond',
  'Monteiro Lobato', 'Cora Coralina', 'Paulo Freire', 'Anísio Teixeira',
  'Darcy Ribeiro', 'Miguel Couto', 'Oswaldo Cruz', 'Rui Barbosa',
  'Tiradentes', 'Dom Pedro II', 'Getúlio Vargas', 'Juscelino Kubitschek'
];

const NOMES_GENERICOS = [
  'Progresso', 'Futuro', 'Esperança', 'Excelência', 'Conquista',
  'Vitória', 'Êxito', 'Evolução', 'Pioneiro', 'Vanguarda',
  'Integração', 'União', 'Fraternidade', 'Harmonia', 'Horizonte'
];

// Principais cidades brasileiras com coordenadas
const CIDADES_BRASIL = [
  // São Paulo
  { municipio: 'São Paulo', uf: 'SP', lat: '-23.5505', lng: '-46.6333', bairros: ['Centro', 'Pinheiros', 'Vila Mariana', 'Moema', 'Tatuapé', 'Santana', 'Ipiranga', 'Butantã'], escolas: 80 },
  { municipio: 'Campinas', uf: 'SP', lat: '-22.9099', lng: '-47.0626', bairros: ['Centro', 'Cambuí', 'Barão Geraldo', 'Taquaral'], escolas: 25 },
  { municipio: 'Santo André', uf: 'SP', lat: '-23.6633', lng: '-46.5331', bairros: ['Centro', 'Jardim', 'Vila Assunção'], escolas: 20 },
  { municipio: 'São Bernardo', uf: 'SP', lat: '-23.6939', lng: '-46.5644', bairros: ['Centro', 'Rudge Ramos', 'Assunção'], escolas: 18 },
  { municipio: 'Ribeirão Preto', uf: 'SP', lat: '-21.1699', lng: '-47.8099', bairros: ['Centro', 'Campos Elíseos', 'Alto da Boa Vista'], escolas: 22 },
  { municipio: 'Santos', uf: 'SP', lat: '-23.9608', lng: '-46.3339', bairros: ['Centro', 'Gonzaga', 'Boqueirão', 'Ponta da Praia'], escolas: 18 },
  { municipio: 'Sorocaba', uf: 'SP', lat: '-23.5018', lng: '-47.4586', bairros: ['Centro', 'Campolim', 'Jardim Vergueiro'], escolas: 20 },

  // Rio de Janeiro
  { municipio: 'Rio de Janeiro', uf: 'RJ', lat: '-22.9068', lng: '-43.1729', bairros: ['Centro', 'Copacabana', 'Ipanema', 'Barra', 'Tijuca', 'Botafogo', 'Flamengo', 'Zona Norte'], escolas: 70 },
  { municipio: 'Niterói', uf: 'RJ', lat: '-22.8833', lng: '-43.1036', bairros: ['Centro', 'Icaraí', 'Santa Rosa', 'Pendotiba'], escolas: 20 },
  { municipio: 'Duque de Caxias', uf: 'RJ', lat: '-22.7858', lng: '-43.3054', bairros: ['Centro', 'Jardim Primavera', '25 de Agosto'], escolas: 18 },
  { municipio: 'Nova Iguaçu', uf: 'RJ', lat: '-22.7592', lng: '-43.4509', bairros: ['Centro', 'Austin', 'Luz'], escolas: 16 },
  { municipio: 'Petrópolis', uf: 'RJ', lat: '-22.5050', lng: '-43.1789', bairros: ['Centro', 'Quitandinha', 'Valparaíso'], escolas: 14 },

  // Minas Gerais
  { municipio: 'Belo Horizonte', uf: 'MG', lat: '-19.9167', lng: '-43.9345', bairros: ['Centro', 'Savassi', 'Lourdes', 'Pampulha', 'Funcionários', 'Santo Agostinho'], escolas: 50 },
  { municipio: 'Uberlândia', uf: 'MG', lat: '-18.9186', lng: '-48.2772', bairros: ['Centro', 'Santa Mônica', 'Martins'], escolas: 22 },
  { municipio: 'Contagem', uf: 'MG', lat: '-19.9320', lng: '-44.0538', bairros: ['Centro', 'Eldorado', 'Nacional'], escolas: 18 },
  { municipio: 'Juiz de Fora', uf: 'MG', lat: '-21.7642', lng: '-43.3502', bairros: ['Centro', 'Alto dos Passos', 'Bom Pastor'], escolas: 20 },

  // Paraná
  { municipio: 'Curitiba', uf: 'PR', lat: '-25.4284', lng: '-49.2733', bairros: ['Centro', 'Batel', 'Água Verde', 'Bigorrilho', 'Juvevê'], escolas: 45 },
  { municipio: 'Londrina', uf: 'PR', lat: '-23.3045', lng: '-51.1696', bairros: ['Centro', 'Gleba Palhano', 'Higienópolis'], escolas: 22 },
  { municipio: 'Maringá', uf: 'PR', lat: '-23.4273', lng: '-51.9375', bairros: ['Centro', 'Zona 7', 'Novo Centro'], escolas: 20 },
  { municipio: 'Ponta Grossa', uf: 'PR', lat: '-25.0916', lng: '-50.1668', bairros: ['Centro', 'Oficinas', 'Uvaranas'], escolas: 16 },

  // Rio Grande do Sul
  { municipio: 'Porto Alegre', uf: 'RS', lat: '-30.0346', lng: '-51.2177', bairros: ['Centro', 'Moinhos', 'Petrópolis', 'Bom Fim', 'Mont Serrat'], escolas: 45 },
  { municipio: 'Caxias do Sul', uf: 'RS', lat: '-29.1634', lng: '-51.1797', bairros: ['Centro', 'Exposição', 'São Pelegrino'], escolas: 20 },
  { municipio: 'Pelotas', uf: 'RS', lat: '-31.7654', lng: '-52.3377', bairros: ['Centro', 'Areal', 'Fragata'], escolas: 18 },
  { municipio: 'Canoas', uf: 'RS', lat: '-29.9178', lng: '-51.1817', bairros: ['Centro', 'Mathias Velho', 'Rio Branco'], escolas: 16 },

  // Distrito Federal
  { municipio: 'Brasília', uf: 'DF', lat: '-15.7801', lng: '-47.9292', bairros: ['Asa Sul', 'Asa Norte', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Águas Claras'], escolas: 40 },

  // Bahia
  { municipio: 'Salvador', uf: 'BA', lat: '-12.9714', lng: '-38.5014', bairros: ['Centro', 'Barra', 'Pituba', 'Ondina', 'Graça', 'Rio Vermelho'], escolas: 40 },
  { municipio: 'Feira de Santana', uf: 'BA', lat: '-12.2664', lng: '-38.9663', bairros: ['Centro', 'Caseb', 'Kalilândia'], escolas: 18 },
  { municipio: 'Vitória da Conquista', uf: 'BA', lat: '-14.8615', lng: '-40.8442', bairros: ['Centro', 'Candeias', 'Brasil'], escolas: 15 },

  // Pernambuco
  { municipio: 'Recife', uf: 'PE', lat: '-8.0476', lng: '-34.8770', bairros: ['Centro', 'Boa Viagem', 'Espinheiro', 'Graças', 'Casa Forte'], escolas: 40 },
  { municipio: 'Jaboatão', uf: 'PE', lat: '-8.1130', lng: '-35.0148', bairros: ['Centro', 'Piedade', 'Candeias'], escolas: 16 },
  { municipio: 'Olinda', uf: 'PE', lat: '-7.9989', lng: '-34.8553', bairros: ['Centro', 'Casa Caiada', 'Bairro Novo'], escolas: 14 },

  // Ceará
  { municipio: 'Fortaleza', uf: 'CE', lat: '-3.7172', lng: '-38.5433', bairros: ['Centro', 'Aldeota', 'Meireles', 'Dionísio Torres', 'Messejana'], escolas: 40 },
  { municipio: 'Caucaia', uf: 'CE', lat: '-3.7361', lng: '-38.6531', bairros: ['Centro', 'Jurema', 'Icaraí'], escolas: 14 },

  // Goiás
  { municipio: 'Goiânia', uf: 'GO', lat: '-16.6869', lng: '-49.2648', bairros: ['Centro', 'Setor Bueno', 'Marista', 'Oeste'], escolas: 35 },
  { municipio: 'Aparecida de Goiânia', uf: 'GO', lat: '-16.8239', lng: '-49.2439', bairros: ['Centro', 'Cidade Jardim', 'Setor Central'], escolas: 16 },

  // Santa Catarina
  { municipio: 'Florianópolis', uf: 'SC', lat: '-27.5969', lng: '-48.5495', bairros: ['Centro', 'Trindade', 'Ingleses', 'Lagoa'], escolas: 30 },
  { municipio: 'Joinville', uf: 'SC', lat: '-26.3045', lng: '-48.8487', bairros: ['Centro', 'América', 'Atiradores'], escolas: 22 },
  { municipio: 'Blumenau', uf: 'SC', lat: '-26.9194', lng: '-49.0661', bairros: ['Centro', 'Victor Konder', 'Itoupava'], escolas: 18 },

  // Espírito Santo
  { municipio: 'Vitória', uf: 'ES', lat: '-20.3155', lng: '-40.3128', bairros: ['Centro', 'Praia do Canto', 'Jardim Camburi'], escolas: 25 },
  { municipio: 'Vila Velha', uf: 'ES', lat: '-20.3297', lng: '-40.2925', bairros: ['Centro', 'Praia da Costa', 'Itaparica'], escolas: 20 },

  // Mato Grosso
  { municipio: 'Cuiabá', uf: 'MT', lat: '-15.6014', lng: '-56.0979', bairros: ['Centro', 'CPA', 'Jardim Aclimação'], escolas: 22 },

  // Mato Grosso do Sul
  { municipio: 'Campo Grande', uf: 'MS', lat: '-20.4697', lng: '-54.6201', bairros: ['Centro', 'Jardim dos Estados', 'Monte Castelo'], escolas: 25 },

  // Amazonas
  { municipio: 'Manaus', uf: 'AM', lat: '-3.1190', lng: '-60.0217', bairros: ['Centro', 'Adrianópolis', 'Vieiralves', 'Aleixo'], escolas: 30 },

  // Pará
  { municipio: 'Belém', uf: 'PA', lat: '-1.4558', lng: '-48.5044', bairros: ['Centro', 'Nazaré', 'Umarizal', 'Marco'], escolas: 28 },

  // Maranhão
  { municipio: 'São Luís', uf: 'MA', lat: '-2.5387', lng: '-44.2825', bairros: ['Centro', 'Renascença', 'Calhau'], escolas: 24 },

  // Piauí
  { municipio: 'Teresina', uf: 'PI', lat: '-5.0949', lng: '-42.8042', bairros: ['Centro', 'Fátima', 'Jockey'], escolas: 22 },

  // Rio Grande do Norte
  { municipio: 'Natal', uf: 'RN', lat: '-5.7945', lng: '-35.2110', bairros: ['Centro', 'Tirol', 'Lagoa Nova', 'Ponta Negra'], escolas: 24 },

  // Paraíba
  { municipio: 'João Pessoa', uf: 'PB', lat: '-7.1195', lng: '-34.8450', bairros: ['Centro', 'Manaíra', 'Tambaú', 'Bancários'], escolas: 22 },

  // Alagoas
  { municipio: 'Maceió', uf: 'AL', lat: '-9.6658', lng: '-35.7350', bairros: ['Centro', 'Farol', 'Ponta Verde', 'Pajuçara'], escolas: 20 },

  // Sergipe
  { municipio: 'Aracaju', uf: 'SE', lat: '-10.9472', lng: '-37.0731', bairros: ['Centro', 'Jardins', 'Atalaia'], escolas: 18 },
];

function gerarCNPJ(): string {
  const random = () => Math.floor(Math.random() * 10);
  const cnpj = Array.from({ length: 12 }, random);
  return `${cnpj.slice(0, 2).join('')}.${cnpj.slice(2, 5).join('')}.${cnpj.slice(5, 8).join('')}/0001-${cnpj.slice(8).join('')}`;
}

function escolherAleatorio<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function gerarNomeEscola(tipo: string, cidade: string): string {
  const prefixo = escolherAleatorio(PREFIXOS);

  if (tipo === 'publica' || tipo === 'federal') {
    const opcoes = [...NOMES_PERSONALIDADES, ...NOMES_GENERICOS];
    return `${prefixo} ${escolherAleatorio(opcoes)}`;
  } else {
    const opcoes = [...NOMES_SANTOS, ...NOMES_PERSONALIDADES, ...NOMES_GENERICOS];
    const nome = escolherAleatorio(opcoes);
    return `${prefixo} ${nome}`;
  }
}

function ajustarCoordenada(base: string, dispersao: number = 0.05): string {
  const coord = parseFloat(base);
  const ajuste = (Math.random() - 0.5) * dispersao;
  return (coord + ajuste).toFixed(8);
}

async function gerarEscolasMassivo() {
  logger.info('gerar-massivo', 'Iniciando geração massiva de escolas');

  let totalGeradas = 0;
  let totalJaExistentes = 0;

  for (const cidade of CIDADES_BRASIL) {
    logger.info('gerar-massivo', `Gerando escolas para ${cidade.municipio}, ${cidade.uf}`, {
      quantidade: cidade.escolas,
    });

    for (let i = 0; i < cidade.escolas; i++) {
      const cnpj = gerarCNPJ();

      // Verificar se já existe
      const existe = await db.query.escolas.findFirst({
        where: eq(escolas.cnpj, cnpj),
      });

      if (existe) {
        totalJaExistentes++;
        continue;
      }

      // Definir tipo de escola (distribuição realista)
      let tipo: 'privada' | 'federal' | 'publica';
      const rand = Math.random();
      if (rand < 0.50) {
        tipo = 'privada'; // 50% privadas
      } else if (rand < 0.80) {
        tipo = 'publica'; // 30% públicas
      } else {
        tipo = 'federal'; // 20% federais
      }

      const nome = gerarNomeEscola(tipo, cidade.municipio);
      const bairro = escolherAleatorio(cidade.bairros);

      // Mensalidade (apenas para privadas)
      let mensalidade = null;
      if (tipo === 'privada') {
        // Mensalidade entre R$ 800 e R$ 4500/mês = R$ 9.600 a R$ 54.000/ano
        mensalidade = Math.floor(800 + Math.random() * 3700) * 12;
      }

      // Coordenadas com dispersão
      const lat = ajustarCoordenada(cidade.lat, 0.05);
      const lng = ajustarCoordenada(cidade.lng, 0.05);

      try {
        await db.insert(escolas).values({
          cnpj,
          nome,
          tipo,
          uf: cidade.uf,
          municipio: cidade.municipio,
          bairro,
          endereco_completo: `Rua ${Math.floor(Math.random() * 5000)}, ${Math.floor(Math.random() * 1000)}`,
          cep: `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(100 + Math.random() * 900)}`,
          rede_ensino: tipo === 'privada' ? `Rede ${nome.split(' ')[1] || 'Educacional'}` : null,
          mensalidade_anual: mensalidade,
          lat,
          lng,
          total_alunos: Math.floor(200 + Math.random() * 1500),
          total_professores: Math.floor(15 + Math.random() * 150),
          total_salas: Math.floor(10 + Math.random() * 50),
        });

        totalGeradas++;

        if (totalGeradas % 100 === 0) {
          logger.info('gerar-massivo', `Progresso: ${totalGeradas} escolas geradas`);
        }
      } catch (error) {
        logger.error('gerar-massivo', `Erro ao gerar escola ${nome}`, { error });
      }

      // Pequeno delay para não sobrecarregar
      if (i % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  logger.info('gerar-massivo', 'Geração massiva concluída', {
    geradas: totalGeradas,
    jaExistentes: totalJaExistentes,
    total: totalGeradas + totalJaExistentes,
  });

  return { geradas: totalGeradas, total: totalGeradas + totalJaExistentes };
}

// Executar se chamado diretamente
if (import.meta.main) {
  gerarEscolasMassivo()
    .then(({ geradas, total }) => {
      logger.info('gerar-massivo', `✅ Script finalizado! ${geradas} novas escolas geradas. Total no banco: ${total}`);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('gerar-massivo', 'Erro ao executar script', { error });
      process.exit(1);
    });
}

export { gerarEscolasMassivo };
