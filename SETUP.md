# Setup do Projeto EscolaValor BR

## ✅ Estrutura Criada

Projeto inicializado com sucesso! Arquivos criados:

### Configuração
- `package.json` - Dependências e scripts
- `tsconfig.json` - Configuração TypeScript
- `biome.json` - Linter
- `drizzle.config.ts` - Configuração Drizzle ORM
- `docker-compose.yml` - PostgreSQL + Redis
- `.env.example` / `.env` - Variáveis de ambiente
- `.gitignore` - Arquivos ignorados pelo git

### Código-fonte (`src/`)
- `index.ts` - Entry point do servidor Hono
- `db/schema.ts` - Schema completo do banco de dados
- `db/client.ts` - Cliente Drizzle
- `score/weights.ts` - Pesos do Score Composto
- `score/normalizer.ts` - Normalização de valores
- `score/calculator.ts` - Cálculo de ICB
- `crawler/pipeline.ts` - Pipeline de scraping
- `crawler/scheduler.ts` - Agendador de jobs
- `utils/logger.ts` - Logger estruturado JSON
- `api/middleware/auth.ts` - Autenticação
- `api/middleware/rate-limit.ts` - Rate limiting
- `api/routes/health.ts` - Health check
- `api/routes/escolas.ts` - CRUD de escolas
- `api/routes/ranking.ts` - Ranking por ICB
- `api/routes/comparar.ts` - Comparação de escolas
- `scripts/recalculate-scores.ts` - Recálculo de scores

### Testes (`tests/`)
- `unit/normalizer.test.ts` - Testes do normalizador
- `unit/weights.test.ts` - Testes dos pesos
- `fixtures/escola_publica.json` - Fixture de escola pública
- `fixtures/escola_privada.json` - Fixture de escola privada
- `fixtures/escola_sem_dados.json` - Fixture sem dados

### Documentação
- `README.md` - Documentação principal
- `CLAUDE.md` - Prompt completo de desenvolvimento
- `WEIGHTS_CHANGELOG.md` - Histórico de pesos

---

## 🚀 Próximos Passos

### 1. Instalar Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (WSL recomendado)
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Instalar dependências

```bash
bun install
```

### 3. Subir banco de dados

```bash
docker-compose up -d
```

Aguardar até que os containers estejam saudáveis:

```bash
docker-compose ps
```

### 4. Gerar e aplicar migrations

```bash
bun run db:generate
bun run db:migrate
```

### 5. Iniciar servidor de desenvolvimento

```bash
bun run dev
```

O servidor estará em `http://localhost:3000`.

---

## 🧪 Validação

### Rodar testes

```bash
bun test
```

### Type checking

```bash
bun run typecheck
```

### Linting

```bash
bun run lint
```

---

## 📊 Endpoints Disponíveis

Após iniciar o servidor:

- **Raiz**: `http://localhost:3000/`
- **Health**: `http://localhost:3000/health`
- **Docs**: `http://localhost:3000/docs`
- **API Reference**: `http://localhost:3000/api-reference`
- **Escolas**: `http://localhost:3000/escolas`
- **Ranking**: `http://localhost:3000/ranking`
- **Comparar**: `http://localhost:3000/comparar` (POST)

---

## 🔧 Desenvolvimento

### Adicionar nova fonte de crawler

1. Criar `src/crawler/sources/<fonte>.ts`
2. Registrar em `src/crawler/scheduler.ts`
3. Adicionar enum em `src/db/schema.ts` (se necessário)
4. Gerar migration: `bun run db:generate`

### Alterar pesos do Score

1. Editar `src/score/weights.ts` ou variáveis de ambiente
2. Garantir soma = 1.0
3. Atualizar `WEIGHTS_CHANGELOG.md`
4. Recalcular: `bun run score:recalculate`

---

## 🐛 Troubleshooting

### Erro de conexão com banco

Verificar se os containers estão rodando:

```bash
docker-compose ps
docker-compose logs postgres
```

### Erro "Soma dos pesos inválida"

Verificar variáveis de ambiente no `.env`:

```
WEIGHT_ENEM=0.35
WEIGHT_OLIMPIADAS=0.25
WEIGHT_APROVACAO=0.25
WEIGHT_IDEB=0.15
```

A soma DEVE ser 1.0.

### Porta 3000 em uso

Alterar no `.env`:

```
PORT=3001
```

---

## 📚 Recursos

- **Hono Docs**: https://hono.dev
- **Drizzle ORM**: https://orm.drizzle.team
- **Playwright**: https://playwright.dev
- **Bun**: https://bun.sh

---

**Projeto pronto para desenvolvimento!** 🎉
