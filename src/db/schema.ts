import { pgTable, uuid, text, decimal, integer, timestamp, pgEnum, char, check } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const tipoEscolaEnum = pgEnum('tipo_escola', ['publica', 'privada', 'federal', 'tecnica']);
export const fonteNotaEnum = pgEnum('fonte_nota', ['enem', 'ideb', 'aprovacao_univ']);
export const competicaoEnum = pgEnum('competicao', ['obmep', 'obf', 'obq', 'oba', 'canguru', 'omerj', 'mandacaru']);
export const nivelMedalhaEnum = pgEnum('nivel_medalha', ['ouro', 'prata', 'bronze', 'mencao']);
export const concursoMilitarEnum = pgEnum('concurso_militar', ['espcex', 'afa', 'efomm', 'en', 'ita', 'ime']);
export const metodologiaEnum = pgEnum('metodologia', ['tradicional', 'montessori', 'waldorf', 'construtivista', 'sociointeracionista', 'freiriana', 'internacional']);
export const plataformaAvaliacaoEnum = pgEnum('plataforma_avaliacao', ['reclame_aqui', 'google', 'facebook', 'trustpilot', 'escola_no_ranking']);
export const categoriaAvaliacaoEnum = pgEnum('categoria_avaliacao', ['infraestrutura', 'ensino', 'atendimento', 'comunicacao', 'seguranca', 'alimentacao', 'atividades_extracurriculares', 'custo_beneficio']);
export const tipoReclamacaoEnum = pgEnum('tipo_reclamacao', ['mensalidade', 'professores', 'infraestrutura', 'comunicacao', 'atendimento', 'ensino', 'transporte', 'alimentacao', 'seguranca', 'outros']);

// Tabela: escolas
export const escolas = pgTable('escolas', {
  id: uuid('id').primaryKey().defaultRandom(),
  cnpj: text('cnpj').unique().notNull(),
  nome: text('nome').notNull(),
  tipo: tipoEscolaEnum('tipo').notNull(),
  uf: char('uf', { length: 2 }).notNull(),
  municipio: text('municipio').notNull(),
  bairro: text('bairro'),
  endereco_completo: text('endereco_completo'),
  cep: text('cep'),
  lat: decimal('lat', { precision: 10, scale: 8 }),
  lng: decimal('lng', { precision: 11, scale: 8 }),
  mensalidade_anual: decimal('mensalidade_anual', { precision: 10, scale: 2 }),
  mensalidade_ano_ref: integer('mensalidade_ano_ref'),
  rede_ensino: text('rede_ensino'),
  total_professores: integer('total_professores'),
  total_alunos: integer('total_alunos'),
  total_salas: integer('total_salas'),
  niveis_ensino: text('niveis_ensino').array(),
  turnos: text('turnos').array(),
  ensino_integral: text('ensino_integral'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  mensalidadePositiva: check('mensalidade_positiva', `${table.mensalidade_anual} >= 0`),
}));

// Tabela: notas
export const notas = pgTable('notas', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull(),
  fonte: fonteNotaEnum('fonte').notNull(),
  valor_normalizado: decimal('valor_normalizado', { precision: 4, scale: 2 }).notNull(),
  valor_original: decimal('valor_original', { precision: 10, scale: 2 }).notNull(),
  escala_original: text('escala_original').notNull(),
  ano_referencia: integer('ano_referencia').notNull(),
  coletado_em: timestamp('coletado_em').defaultNow().notNull(),
}, (table) => ({
  valorNormalizadoRange: check('valor_normalizado_range', `${table.valor_normalizado} >= 0 AND ${table.valor_normalizado} <= 10`),
  valorOriginalPositivo: check('valor_original_positivo', `${table.valor_original} >= 0`),
}));

// Tabela: olimpiadas
export const olimpiadas = pgTable('olimpiadas', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull(),
  competicao: competicaoEnum('competicao').notNull(),
  nivel: nivelMedalhaEnum('nivel').notNull(),
  pontos: decimal('pontos', { precision: 3, scale: 1 }).notNull(),
  edicao: integer('edicao').notNull(),
  aluno_anonimizado: text('aluno_anonimizado').notNull(),
  coletado_em: timestamp('coletado_em').defaultNow().notNull(),
}, (table) => ({
  pontosPositivos: check('pontos_positivos', `${table.pontos} >= 0`),
}));

// Tabela: scores
export const scores = pgTable('scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull().unique(),
  score_composto: decimal('score_composto', { precision: 4, scale: 2 }).notNull(),
  icb: decimal('icb', { precision: 10, scale: 2 }),
  peso_enem: decimal('peso_enem', { precision: 3, scale: 2 }).notNull(),
  peso_olimpiadas: decimal('peso_olimpiadas', { precision: 3, scale: 2 }).notNull(),
  peso_aprovacao: decimal('peso_aprovacao', { precision: 3, scale: 2 }).notNull(),
  peso_ideb: decimal('peso_ideb', { precision: 3, scale: 2 }).notNull(),
  calculado_em: timestamp('calculado_em').defaultNow().notNull(),
}, (table) => ({
  scoreRange: check('score_range', `${table.score_composto} >= 0 AND ${table.score_composto} <= 10`),
  icbPositivo: check('icb_positivo', `${table.icb} IS NULL OR ${table.icb} >= 0`),
}));

// Tabela: historico
export const historico = pgTable('historico', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull(),
  icb: decimal('icb', { precision: 10, scale: 2 }),
  score_composto: decimal('score_composto', { precision: 4, scale: 2 }).notNull(),
  referencia_ano: integer('referencia_ano').notNull(),
  snapshot_em: timestamp('snapshot_em').defaultNow().notNull(),
}, (table) => ({
  icbPositivo: check('icb_positivo', `${table.icb} IS NULL OR ${table.icb} >= 0`),
  scoreRange: check('score_range', `${table.score_composto} >= 0 AND ${table.score_composto} <= 10`),
}));

// Tabela: aprovacoes_universitarias
export const aprovacoesUniversitarias = pgTable('aprovacoes_universitarias', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull(),
  universidade: text('universidade').notNull(),
  curso: text('curso'),
  quantidade: integer('quantidade').notNull(),
  ano_referencia: integer('ano_referencia').notNull(),
  coletado_em: timestamp('coletado_em').defaultNow().notNull(),
}, (table) => ({
  quantidadePositiva: check('quantidade_positiva', `${table.quantidade} > 0`),
}));

// Tabela: enem_detalhes
export const enemDetalhes = pgTable('enem_detalhes', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull(),
  nota_media: decimal('nota_media', { precision: 6, scale: 2 }).notNull(),
  nota_maxima: decimal('nota_maxima', { precision: 6, scale: 2 }).notNull(),
  nota_minima: decimal('nota_minima', { precision: 6, scale: 2 }),
  matematica_media: decimal('matematica_media', { precision: 6, scale: 2 }),
  linguagens_media: decimal('linguagens_media', { precision: 6, scale: 2 }),
  ciencias_humanas_media: decimal('ciencias_humanas_media', { precision: 6, scale: 2 }),
  ciencias_natureza_media: decimal('ciencias_natureza_media', { precision: 6, scale: 2 }),
  redacao_media: decimal('redacao_media', { precision: 6, scale: 2 }),
  redacao_maxima: decimal('redacao_maxima', { precision: 6, scale: 2 }),
  total_alunos: integer('total_alunos').notNull(),
  ano_referencia: integer('ano_referencia').notNull(),
  coletado_em: timestamp('coletado_em').defaultNow().notNull(),
}, (table) => ({
  notasPositivas: check('notas_positivas', `${table.nota_media} >= 0 AND ${table.nota_maxima} >= 0`),
  totalAlunosPositivo: check('total_alunos_positivo', `${table.total_alunos} > 0`),
}));

// Tabela: concursos_militares
export const concursosMilitares = pgTable('concursos_militares', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull(),
  concurso: concursoMilitarEnum('concurso').notNull(),
  aprovados: integer('aprovados').notNull(),
  ano_referencia: integer('ano_referencia').notNull(),
  coletado_em: timestamp('coletado_em').defaultNow().notNull(),
}, (table) => ({
  aprovadosPositivos: check('aprovados_positivos', `${table.aprovados} > 0`),
}));

// Tabela: informacoes_escola
export const informacoesEscola = pgTable('informacoes_escola', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull().unique(),
  metodologia: metodologiaEnum('metodologia'),
  inclusao: text('inclusao'),
  atividades_extracurriculares: text('atividades_extracurriculares').array(),
  diferenciais: text('diferenciais').array(),
  avaliacao_mec: decimal('avaliacao_mec', { precision: 3, scale: 2 }),
  nota_pais: decimal('nota_pais', { precision: 3, scale: 2 }),
  total_avaliacoes_pais: integer('total_avaliacoes_pais'),
  infraestrutura: text('infraestrutura').array(),
  site: text('site'),
  telefone: text('telefone'),
  email: text('email'),
  bilingue: text('bilingue'),
  internacional: text('internacional'),
  certificacoes: text('certificacoes').array(),
  idiomas_oferecidos: text('idiomas_oferecidos').array(),
  intercambios: text('intercambios'),
  atualizado_em: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  avaliacaoMecRange: check('avaliacao_mec_range', `${table.avaliacao_mec} IS NULL OR (${table.avaliacao_mec} >= 0 AND ${table.avaliacao_mec} <= 5)`),
  notaPaisRange: check('nota_pais_range', `${table.nota_pais} IS NULL OR (${table.nota_pais} >= 0 AND ${table.nota_pais} <= 5)`),
}));

// Tabela: avaliacoes_externas
export const avaliacoesExternas = pgTable('avaliacoes_externas', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull(),
  plataforma: plataformaAvaliacaoEnum('plataforma').notNull(),
  categoria: categoriaAvaliacaoEnum('categoria').notNull(),
  nota_media: decimal('nota_media', { precision: 3, scale: 2 }).notNull(),
  total_avaliacoes: integer('total_avaliacoes').notNull(),
  mes_referencia: integer('mes_referencia').notNull(),
  ano_referencia: integer('ano_referencia').notNull(),
  coletado_em: timestamp('coletado_em').defaultNow().notNull(),
}, (table) => ({
  notaMediaRange: check('nota_media_range', `${table.nota_media} >= 0 AND ${table.nota_media} <= 5`),
  totalAvaliacoesPositivo: check('total_avaliacoes_positivo', `${table.total_avaliacoes} > 0`),
  mesRange: check('mes_range', `${table.mes_referencia} >= 1 AND ${table.mes_referencia} <= 12`),
}));

// Tabela: reclamacoes
export const reclamacoes = pgTable('reclamacoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  escola_id: uuid('escola_id').references(() => escolas.id, { onDelete: 'cascade' }).notNull(),
  tipo: tipoReclamacaoEnum('tipo').notNull(),
  quantidade: integer('quantidade').notNull(),
  mes_referencia: integer('mes_referencia').notNull(),
  ano_referencia: integer('ano_referencia').notNull(),
  plataforma_origem: text('plataforma_origem').notNull(),
  coletado_em: timestamp('coletado_em').defaultNow().notNull(),
}, (table) => ({
  quantidadePositiva: check('quantidade_positiva', `${table.quantidade} > 0`),
  mesRange: check('mes_range', `${table.mes_referencia} >= 1 AND ${table.mes_referencia} <= 12`),
}));

// Relations
export const escolasRelations = relations(escolas, ({ many, one }) => ({
  notas: many(notas),
  olimpiadas: many(olimpiadas),
  score: one(scores),
  historico: many(historico),
  aprovacoesUniversitarias: many(aprovacoesUniversitarias),
  enemDetalhes: many(enemDetalhes),
  concursosMilitares: many(concursosMilitares),
  informacoes: one(informacoesEscola),
  avaliacoesExternas: many(avaliacoesExternas),
  reclamacoes: many(reclamacoes),
}));

export const notasRelations = relations(notas, ({ one }) => ({
  escola: one(escolas, {
    fields: [notas.escola_id],
    references: [escolas.id],
  }),
}));

export const olimpiadasRelations = relations(olimpiadas, ({ one }) => ({
  escola: one(escolas, {
    fields: [olimpiadas.escola_id],
    references: [escolas.id],
  }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  escola: one(escolas, {
    fields: [scores.escola_id],
    references: [escolas.id],
  }),
}));

export const historicoRelations = relations(historico, ({ one }) => ({
  escola: one(escolas, {
    fields: [historico.escola_id],
    references: [escolas.id],
  }),
}));

export const aprovacoesUniversitariasRelations = relations(aprovacoesUniversitarias, ({ one }) => ({
  escola: one(escolas, {
    fields: [aprovacoesUniversitarias.escola_id],
    references: [escolas.id],
  }),
}));

export const enemDetalhesRelations = relations(enemDetalhes, ({ one }) => ({
  escola: one(escolas, {
    fields: [enemDetalhes.escola_id],
    references: [escolas.id],
  }),
}));

export const concursosMilitaresRelations = relations(concursosMilitares, ({ one }) => ({
  escola: one(escolas, {
    fields: [concursosMilitares.escola_id],
    references: [escolas.id],
  }),
}));

export const informacoesEscolaRelations = relations(informacoesEscola, ({ one }) => ({
  escola: one(escolas, {
    fields: [informacoesEscola.escola_id],
    references: [escolas.id],
  }),
}));

export const avaliacoesExternasRelations = relations(avaliacoesExternas, ({ one }) => ({
  escola: one(escolas, {
    fields: [avaliacoesExternas.escola_id],
    references: [escolas.id],
  }),
}));

export const reclamacoesRelations = relations(reclamacoes, ({ one }) => ({
  escola: one(escolas, {
    fields: [reclamacoes.escola_id],
    references: [escolas.id],
  }),
}));
