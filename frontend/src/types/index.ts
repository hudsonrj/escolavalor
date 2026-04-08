export interface Escola {
  id: string;
  cnpj: string;
  nome: string;
  tipo: 'publica' | 'privada' | 'federal' | 'tecnica';
  uf: string;
  municipio: string;
  bairro?: string | null;
  endereco_completo?: string | null;
  cep?: string | null;
  mensalidade_anual: string | null;
  score_composto: string | null;
  icb: string | null;
  lat?: string;
  lng?: string;
  rede_ensino?: string | null;
  total_professores?: number | null;
  total_alunos?: number | null;
  total_salas?: number | null;
  niveis_ensino?: string[] | null;
  turnos?: string[] | null;
  ensino_integral?: string | null;
}

export interface EscolaDetalhada extends Escola {
  score?: {
    score_composto: string;
    icb: string | null;
    peso_enem: string;
    peso_olimpiadas: string;
    peso_aprovacao: string;
    peso_ideb: string;
  };
  notas?: Nota[];
  olimpiadas?: Olimpiada[];
  aprovacoesUniversitarias?: AprovacaoUniversitaria[];
  enemDetalhes?: EnemDetalhes[];
  concursosMilitares?: ConcursoMilitar[];
  informacoes?: InformacoesEscola;
  avaliacoesExternas?: AvaliacaoExterna[];
  reclamacoes?: Reclamacao[];
}

export interface Nota {
  id: string;
  fonte: 'enem' | 'ideb' | 'aprovacao_univ';
  valor_normalizado: string;
  valor_original: string;
  ano_referencia: number;
}

export interface Olimpiada {
  id: string;
  competicao: 'obmep' | 'obf' | 'obq' | 'oba' | 'canguru' | 'omerj' | 'mandacaru';
  nivel: 'ouro' | 'prata' | 'bronze' | 'mencao';
  pontos: string;
  edicao: number;
}

export interface AprovacaoUniversitaria {
  id: string;
  universidade: string;
  curso: string | null;
  quantidade: number;
  ano_referencia: number;
}

export interface EnemDetalhes {
  id: string;
  nota_media: string;
  nota_maxima: string;
  nota_minima: string | null;
  matematica_media: string | null;
  linguagens_media: string | null;
  ciencias_humanas_media: string | null;
  ciencias_natureza_media: string | null;
  redacao_media: string | null;
  redacao_maxima: string | null;
  total_alunos: number;
  ano_referencia: number;
}

export interface ConcursoMilitar {
  id: string;
  concurso: 'espcex' | 'afa' | 'efomm' | 'en' | 'ita' | 'ime';
  aprovados: number;
  ano_referencia: number;
}

export interface InformacoesEscola {
  id: string;
  metodologia: 'tradicional' | 'montessori' | 'waldorf' | 'construtivista' | 'sociointeracionista' | 'freiriana' | 'internacional' | null;
  inclusao: string | null;
  atividades_extracurriculares: string[] | null;
  diferenciais: string[] | null;
  avaliacao_mec: string | null;
  nota_pais: string | null;
  total_avaliacoes_pais: number | null;
  infraestrutura: string[] | null;
  site: string | null;
  telefone: string | null;
  email: string | null;
  bilingue: string | null;
  internacional: string | null;
  certificacoes: string[] | null;
  idiomas_oferecidos: string[] | null;
  intercambios: string | null;
}

export interface AvaliacaoExterna {
  id: string;
  plataforma: 'reclame_aqui' | 'google' | 'facebook' | 'trustpilot' | 'escola_no_ranking';
  categoria: 'infraestrutura' | 'ensino' | 'atendimento' | 'comunicacao' | 'seguranca' | 'alimentacao' | 'atividades_extracurriculares' | 'custo_beneficio';
  nota_media: string;
  total_avaliacoes: number;
  mes_referencia: number;
  ano_referencia: number;
}

export interface Reclamacao {
  id: string;
  tipo: 'mensalidade' | 'professores' | 'infraestrutura' | 'comunicacao' | 'atendimento' | 'ensino' | 'transporte' | 'alimentacao' | 'seguranca' | 'outros';
  quantidade: number;
  mes_referencia: number;
  ano_referencia: number;
  plataforma_origem: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    calculado_em: string;
  };
}

export interface RankingItem extends Escola {
  posicao: number;
}

export interface FilterParams {
  uf?: string;
  tipo?: string;
  municipio?: string;
  icb_min?: number;
  icb_max?: number;
  page?: number;
  limit?: number;
}
