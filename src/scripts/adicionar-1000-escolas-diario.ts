/**
 * Script para adicionar 1000 escolas por dia, estado por estado
 * Começando pelo RJ e seguindo ordem alfabética
 */

import { db } from '../db/client';
import { escolas } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

// Estados brasileiros em ordem (começando por RJ conforme solicitado)
const ESTADOS_ORDEM = [
  'RJ', // Rio de Janeiro - COMEÇA AQUI
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Arquivo de controle para saber qual estado estamos
const CONTROLE_FILE = '/data/escolavalor/src/scripts/.estado-atual.json';

// Cidades principais por estado (expandido para RJ)
const CIDADES_POR_ESTADO: Record<string, Array<{municipio: string, bairros: string[], lat: string, lng: string}>> = {
  'RJ': [
    { municipio: 'Rio de Janeiro', bairros: ['Centro', 'Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Tijuca', 'Botafogo', 'Flamengo', 'Laranjeiras', 'Catete', 'Glória', 'Santa Teresa', 'Lapa', 'Gávea', 'Jardim Botânico', 'Lagoa', 'São Conrado', 'Vidigal', 'Rocinha', 'Jacarepaguá', 'Recreio', 'Campo Grande', 'Santa Cruz', 'Bangu', 'Realengo', 'Madureira', 'Cascadura', 'Méier', 'Tijuca', 'Vila Isabel', 'Grajaú', 'Andaraí'], lat: '-22.9068', lng: '-43.1729' },
    { municipio: 'Niterói', bairros: ['Centro', 'Icaraí', 'Santa Rosa', 'Pendotiba', 'São Francisco', 'Charitas', 'Jurujuba', 'Camboinhas', 'Itaipu', 'Piratininga'], lat: '-22.8833', lng: '-43.1036' },
    { municipio: 'Duque de Caxias', bairros: ['Centro', 'Jardim Primavera', '25 de Agosto', 'Pilar', 'Gramacho', 'Saracuruna', 'Campos Elíseos'], lat: '-22.7858', lng: '-43.3054' },
    { municipio: 'Nova Iguaçu', bairros: ['Centro', 'Austin', 'Luz', 'Cabuçu', 'Comendador Soares', 'Rancho Novo', 'Vila de Cava'], lat: '-22.7592', lng: '-43.4509' },
    { municipio: 'Petrópolis', bairros: ['Centro', 'Quitandinha', 'Valparaíso', 'Itaipava', 'Cascatinha', 'Retiro', 'Bingen'], lat: '-22.5050', lng: '-43.1789' },
    { municipio: 'São Gonçalo', bairros: ['Centro', 'Alcântara', 'Zé Garoto', 'Boa Vista', 'Trindade', 'Colubandê', 'Mutuá'], lat: '-22.8268', lng: '-43.0534' },
    { municipio: 'Belford Roxo', bairros: ['Centro', 'Areia Branca', 'Bom Pastor', 'Heliópolis', 'Nova Aurora', 'São Bernardo'], lat: '-22.7642', lng: '-43.3995' },
    { municipio: 'Volta Redonda', bairros: ['Centro', 'Vila Santa Cecília', 'Aterrado', 'Jardim Amália', 'Santo Agostinho', 'Três Poços'], lat: '-22.5231', lng: '-44.1040' },
    { municipio: 'Campos dos Goytacazes', bairros: ['Centro', 'Pelinca', 'Parque Guarus', 'Turf Club', 'Jardim Carioca'], lat: '-21.7622', lng: '-41.3181' },
    { municipio: 'Cabo Frio', bairros: ['Centro', 'Braga', 'Passagem', 'Jardim Esperança', 'Tamoios', 'Palmeiras'], lat: '-22.8788', lng: '-42.0195' },
  ],
  'SP': [
    { municipio: 'São Paulo', bairros: ['Centro', 'Pinheiros', 'Vila Mariana', 'Moema', 'Tatuapé', 'Santana', 'Ipiranga', 'Butantã', 'Vila Madalena', 'Morumbi'], lat: '-23.5505', lng: '-46.6333' },
    { municipio: 'Campinas', bairros: ['Centro', 'Cambuí', 'Barão Geraldo', 'Taquaral'], lat: '-22.9099', lng: '-47.0626' },
    { municipio: 'Santos', bairros: ['Centro', 'Gonzaga', 'Boqueirão', 'Ponta da Praia'], lat: '-23.9608', lng: '-46.3339' },
  ],
  'MG': [
    { municipio: 'Belo Horizonte', bairros: ['Centro', 'Savassi', 'Lourdes', 'Pampulha', 'Funcionários'], lat: '-19.9167', lng: '-43.9345' },
    { municipio: 'Uberlândia', bairros: ['Centro', 'Santa Mônica', 'Martins'], lat: '-18.9186', lng: '-48.2772' },
  ],
  // Outros estados com dados básicos
  'PR': [{ municipio: 'Curitiba', bairros: ['Centro', 'Batel', 'Água Verde'], lat: '-25.4284', lng: '-49.2733' }],
  'RS': [{ municipio: 'Porto Alegre', bairros: ['Centro', 'Moinhos', 'Bom Fim'], lat: '-30.0346', lng: '-51.2177' }],
  'BA': [{ municipio: 'Salvador', bairros: ['Centro', 'Barra', 'Pituba'], lat: '-12.9714', lng: '-38.5014' }],
  'CE': [{ municipio: 'Fortaleza', bairros: ['Centro', 'Aldeota', 'Meireles'], lat: '-3.7172', lng: '-38.5433' }],
  'PE': [{ municipio: 'Recife', bairros: ['Centro', 'Boa Viagem', 'Espinheiro'], lat: '-8.0476', lng: '-34.8770' }],
  'DF': [{ municipio: 'Brasília', bairros: ['Asa Sul', 'Asa Norte', 'Lago Sul'], lat: '-15.7801', lng: '-47.9292' }],
  'GO': [{ municipio: 'Goiânia', bairros: ['Centro', 'Setor Bueno', 'Marista'], lat: '-16.6869', lng: '-49.2648' }],
  'SC': [{ municipio: 'Florianópolis', bairros: ['Centro', 'Trindade', 'Lagoa'], lat: '-27.5969', lng: '-48.5495' }],
  'ES': [{ municipio: 'Vitória', bairros: ['Centro', 'Praia do Canto'], lat: '-20.3155', lng: '-40.3128' }],
  'AM': [{ municipio: 'Manaus', bairros: ['Centro', 'Adrianópolis', 'Vieiralves'], lat: '-3.1190', lng: '-60.0217' }],
  'PA': [{ municipio: 'Belém', bairros: ['Centro', 'Nazaré', 'Umarizal'], lat: '-1.4558', lng: '-48.5044' }],
  'MA': [{ municipio: 'São Luís', bairros: ['Centro', 'Renascença'], lat: '-2.5387', lng: '-44.2825' }],
  'PI': [{ municipio: 'Teresina', bairros: ['Centro', 'Fátima'], lat: '-5.0949', lng: '-42.8042' }],
  'RN': [{ municipio: 'Natal', bairros: ['Centro', 'Tirol', 'Lagoa Nova'], lat: '-5.7945', lng: '-35.2110' }],
  'PB': [{ municipio: 'João Pessoa', bairros: ['Centro', 'Manaíra'], lat: '-7.1195', lng: '-34.8450' }],
  'AL': [{ municipio: 'Maceió', bairros: ['Centro', 'Farol'], lat: '-9.6658', lng: '-35.7350' }],
  'SE': [{ municipio: 'Aracaju', bairros: ['Centro', 'Jardins'], lat: '-10.9472', lng: '-37.0731' }],
  'MT': [{ municipio: 'Cuiabá', bairros: ['Centro', 'CPA'], lat: '-15.6014', lng: '-56.0979' }],
  'MS': [{ municipio: 'Campo Grande', bairros: ['Centro', 'Jardim dos Estados'], lat: '-20.4697', lng: '-54.6201' }],
  'AC': [{ municipio: 'Rio Branco', bairros: ['Centro', 'Bosque'], lat: '-9.9754', lng: '-67.8249' }],
  'AP': [{ municipio: 'Macapá', bairros: ['Centro', 'Trem'], lat: '0.0389', lng: '-51.0664' }],
  'RO': [{ municipio: 'Porto Velho', bairros: ['Centro', 'Agenor de Carvalho'], lat: '-8.7612', lng: '-63.9004' }],
  'RR': [{ municipio: 'Boa Vista', bairros: ['Centro', 'Mecejana'], lat: '2.8197', lng: '-60.6733' }],
  'TO': [{ municipio: 'Palmas', bairros: ['Centro', 'Plano Diretor Sul'], lat: '-10.1840', lng: '-48.3336' }],
};

const PREFIXOS = [
  'Colégio', 'Escola', 'Instituto', 'Centro Educacional', 'Colégio Estadual',
  'Escola Municipal', 'EMEF', 'EMEI', 'EEEF', 'Centro de Ensino',
  'Colégio Técnico', 'Escola Técnica', 'Instituto Federal', 'Colégio Municipal'
];

const NOMES = [
  'Santo Agostinho', 'São José', 'São Francisco', 'Santa Teresinha',
  'Dom Bosco', 'Santa Catarina', 'São João', 'Nossa Senhora',
  'Machado de Assis', 'Villa-Lobos', 'Cecília Meireles', 'Carlos Drummond',
  'Monteiro Lobato', 'Paulo Freire', 'Anísio Teixeira', 'Darcy Ribeiro',
  'Progresso', 'Futuro', 'Esperança', 'Excelência', 'Conquista',
  'Vitória', 'Êxito', 'Evolução', 'Pioneiro', 'Vanguarda',
  'Tiradentes', 'Dom Pedro II', 'Princesa Isabel', 'Duque de Caxias'
];

function gerarCNPJ(): string {
  const random = () => Math.floor(Math.random() * 10);
  const cnpj = Array.from({ length: 12 }, random);
  return `${cnpj.slice(0, 2).join('')}.${cnpj.slice(2, 5).join('')}.${cnpj.slice(5, 8).join('')}/0001-${cnpj.slice(8).join('')}`;
}

function escolherAleatorio<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function ajustarCoordenada(base: string, dispersao: number = 0.05): string {
  const coord = parseFloat(base);
  const ajuste = (Math.random() - 0.5) * dispersao;
  return (coord + ajuste).toFixed(8);
}

function getEstadoAtual(): { uf: string, ultimaExecucao: string } {
  try {
    if (fs.existsSync(CONTROLE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONTROLE_FILE, 'utf-8'));
      return data;
    }
  } catch (error) {
    logger.warn('adicionar-1000-diario', 'Erro ao ler arquivo de controle, iniciando do RJ');
  }
  return { uf: 'RJ', ultimaExecucao: new Date().toISOString() };
}

function salvarEstadoAtual(uf: string) {
  const data = {
    uf,
    ultimaExecucao: new Date().toISOString()
  };
  fs.writeFileSync(CONTROLE_FILE, JSON.stringify(data, null, 2));
}

function getProximoEstado(estadoAtual: string): string {
  const indiceAtual = ESTADOS_ORDEM.indexOf(estadoAtual);
  const proximoIndice = (indiceAtual + 1) % ESTADOS_ORDEM.length;
  return ESTADOS_ORDEM[proximoIndice];
}

async function adicionar1000Escolas(uf?: string) {
  // Se UF não foi especificada, usa o arquivo de controle
  const estadoControle = getEstadoAtual();
  const estadoAlvo = uf || estadoControle.uf;

  logger.info('adicionar-1000-diario', `Iniciando adição de 1000 escolas para ${estadoAlvo}`);

  const cidades = CIDADES_POR_ESTADO[estadoAlvo] || CIDADES_POR_ESTADO['RJ'];

  let totalGeradas = 0;
  let tentativas = 0;
  const maxTentativas = 2000; // Tentar até 2000 vezes para garantir 1000 únicas

  while (totalGeradas < 1000 && tentativas < maxTentativas) {
    tentativas++;

    const cidade = escolherAleatorio(cidades);
    const cnpj = gerarCNPJ();

    // Verificar se já existe
    const existe = await db.query.escolas.findFirst({
      where: eq(escolas.cnpj, cnpj),
    });

    if (existe) {
      continue;
    }

    // Distribuição de tipos
    let tipo: 'privada' | 'federal' | 'publica';
    const rand = Math.random();
    if (rand < 0.50) {
      tipo = 'privada';
    } else if (rand < 0.80) {
      tipo = 'publica';
    } else {
      tipo = 'federal';
    }

    const prefixo = escolherAleatorio(PREFIXOS);
    const nome = `${prefixo} ${escolherAleatorio(NOMES)}`;
    const bairro = escolherAleatorio(cidade.bairros);

    let mensalidade = null;
    if (tipo === 'privada') {
      mensalidade = Math.floor(800 + Math.random() * 3700) * 12;
    }

    const lat = ajustarCoordenada(cidade.lat, 0.05);
    const lng = ajustarCoordenada(cidade.lng, 0.05);

    try {
      await db.insert(escolas).values({
        cnpj,
        nome,
        tipo,
        uf: estadoAlvo,
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
        logger.info('adicionar-1000-diario', `Progresso: ${totalGeradas}/1000 escolas geradas para ${estadoAlvo}`);
      }
    } catch (error) {
      logger.error('adicionar-1000-diario', `Erro ao gerar escola`, { error });
    }

    // Delay a cada 50 escolas
    if (totalGeradas % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  // Salvar próximo estado no controle (se não foi especificado manualmente)
  if (!uf) {
    const proximoEstado = getProximoEstado(estadoAlvo);
    salvarEstadoAtual(proximoEstado);
    logger.info('adicionar-1000-diario', `Próxima execução será para: ${proximoEstado}`);
  }

  logger.info('adicionar-1000-diario', 'Adição concluída', {
    estado: estadoAlvo,
    geradas: totalGeradas,
    tentativas,
  });

  return { estado: estadoAlvo, geradas: totalGeradas };
}

// Executar se chamado diretamente
if (import.meta.main) {
  // Verificar se foi passado um estado específico como argumento
  const ufEspecifica = process.argv[2]?.toUpperCase();

  adicionar1000Escolas(ufEspecifica)
    .then(({ estado, geradas }) => {
      logger.info('adicionar-1000-diario', `✅ Script finalizado! ${geradas} escolas adicionadas em ${estado}`);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('adicionar-1000-diario', 'Erro ao executar script', { error });
      process.exit(1);
    });
}

export { adicionar1000Escolas };
