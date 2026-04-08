# EscolaValor BR

> API open source que rastreia escolas brasileiras e compara seu custo-benefício com base em dados públicos de desempenho acadêmico.

Inspirado no [PoteBarato](https://github.com/GXDEVS/potebarato), que compara suplementos por R$/grama — aqui a métrica central é:

```
ICB = Mensalidade Anual (R$) ÷ Score Composto de Desempenho
```

**Menor ICB = melhor custo-benefício.**

---

## 🚀 Quick Start

### Pré-requisitos

- [Bun](https://bun.sh) >= 1.1
- Docker e Docker Compose (para banco de dados)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/escolavalor-br.git
cd escolavalor-br

# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.example .env

# Subir banco de dados (PostgreSQL + Redis)
docker-compose up -d

# Gerar migrations
bun run db:generate

# Aplicar migrations
bun run db:migrate

# Iniciar servidor de desenvolvimento
bun run dev
```

O servidor estará rodando em `http://localhost:3000`.

---

## 📊 Score Composto e ICB

### Fórmula

```typescript
Score Composto = (ENEM × 0.35) + (Olimpíadas × 0.25) + (Aprovação × 0.25) + (IDEB × 0.15)
```

### Normalização

Todas as fontes são normalizadas para escala **0-10**:

| Fonte | Escala Original | Normalização |
|-------|----------------|--------------|
| ENEM | 0-1000 | ÷100 |
| IDEB | 0-10 | direto |
| Aprovação Univ. | 0-100% | ÷10 |
| Olimpíadas | pontos | escalar pelo máximo |

### ICB (Índice de Custo-Benefício)

```
ICB = Mensalidade Anual ÷ Score Composto
```

- Quanto **menor** o ICB, **melhor** o custo-benefício
- Escola com `score_composto < 0.1` → ICB não calculado
- Escola pública sem mensalidade → ICB exibido separadamente

---

## 🗄️ API Endpoints

### Autenticação

Todas as rotas (exceto `/health` e `/docs`) exigem header:

```
Authorization: Bearer <api_key>
```

### Endpoints Principais

#### GET `/health`
Status do sistema

#### GET `/escolas`
Lista escolas com filtros

**Query params:**
- `uf`: filtrar por estado (ex: `SP`)
- `tipo`: filtrar por tipo (`publica`, `privada`, `federal`, `tecnica`)
- `municipio`: filtrar por município
- `icb_min`, `icb_max`: filtrar por faixa de ICB
- `page`, `limit`: paginação

#### GET `/escolas/:id`
Detalhes de uma escola específica (inclui notas e olimpíadas)

#### GET `/ranking`
Top escolas por ICB (menor = melhor)

**Query params:**
- `uf`: filtrar por estado
- `tipo`: filtrar por tipo
- `limit`: quantidade de resultados (padrão: 50)

#### POST `/comparar`
Compara até 4 escolas lado a lado

**Body:**
```json
{
  "ids": ["uuid1", "uuid2", "uuid3", "uuid4"]
}
```

---

## 🕷️ Crawler

O crawler roda em **processo isolado** via `Bun.spawn()` para não bloquear o servidor HTTP.

### Fontes de dados

| Fonte | Frequência | Estratégia |
|-------|-----------|-----------|
| INEP ENEM | Semanal (seg 3h) | Download CSV oficial |
| IDEB | Mensal | Download CSV oficial |
| OBMEP | Semanal (qua 2h) | Scraping + JSON-LD |
| OBF/OBQ/OBA | Quinzenal | Scraping |
| Fuvest/Comvest | Mensal | Scraping |
| Mensalidades | Diário (6h) | Playwright headless |

### Pipeline

1. Ler `robots.txt` da origem
2. Expandir sitemap
3. Filtrar URLs relevantes
4. Validar via HEAD em paralelo
5. Scraping (JSON-LD primeiro → fallback CSS)
6. Validação Zod
7. Upsert no PostgreSQL

---

## 🛠️ Desenvolvimento

### Scripts disponíveis

```bash
bun run dev              # Desenvolvimento com hot reload
bun run build            # Build para produção
bun run start            # Produção

bun run db:generate      # Gerar migrations
bun run db:migrate       # Aplicar migrations
bun run db:studio        # Drizzle Studio (GUI)

bun run score:recalculate  # Recalcular todos os scores

bun test                 # Testes unitários
bun test:integration     # Testes de integração
bun run typecheck        # Type checking
bun run lint             # Biome lint
bun run lint:fix         # Fix automático
```

### Estrutura de diretórios

```
src/
├── api/
│   ├── middleware/      # auth, rate-limit
│   └── routes/          # escolas, ranking, comparar
├── crawler/
│   ├── pipeline.ts      # orquestrador
│   ├── scheduler.ts     # cron jobs
│   └── sources/         # fontes específicas (OBMEP, etc)
├── db/
│   ├── schema.ts        # Drizzle schema
│   ├── client.ts        # DB client
│   └── migrations/      # SQL migrations
├── score/
│   ├── weights.ts       # pesos do score
│   ├── normalizer.ts    # normalização
│   └── calculator.ts    # cálculo de ICB
├── utils/
│   └── logger.ts        # logger estruturado
└── index.ts             # entry point
```

---

## 📝 Regras Inegociáveis

### Privacidade e LGPD

- **NUNCA** armazenar nome real de aluno — apenas hash anonimizado
- Dados de olimpíadas: apenas escola, competição, nível e ano
- Nenhum dado pessoal de responsáveis ou alunos

### Qualidade

- Todo campo numérico tem `CHECK (valor >= 0)`
- `score_composto` tem `CHECK (valor BETWEEN 0 AND 10)`
- Upsert sempre usa `ON CONFLICT` — nunca INSERT cego
- Escola sem CNPJ válido → rejeitada

### Segurança

- Rate limiting: 100 req/min com API key, 20 req/min sem key
- Timeout de scraping: 30s por página, 4h total
- Headers de segurança (CORS, CSP, X-Frame-Options)

---

## 📚 Documentação

- **CLAUDE.md**: Prompt completo para desenvolvimento com Claude Code
- **WEIGHTS_CHANGELOG.md**: Histórico de alterações de pesos
- **API Docs**: `http://localhost:3000/docs` (Swagger UI)
- **API Reference**: `http://localhost:3000/api-reference` (Scalar)

---

## 🧪 Testes

```bash
# Testes unitários
bun test

# Testes de integração (requer docker-compose up)
bun test:integration

# Com cobertura
bun test --coverage
```

### Cobertura mínima

| Módulo | Mínimo |
|--------|--------|
| `src/score/` | 95% |
| `src/crawler/pipeline.ts` | 80% |
| `src/api/routes/` | 70% |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Checklist antes do PR

- [ ] `bun test` passa sem falhas
- [ ] `bun run typecheck` sem erros
- [ ] `bun run lint` passa
- [ ] Nenhum dado pessoal nos logs ou banco
- [ ] Migrations geradas para mudanças de schema
- [ ] WEIGHTS_CHANGELOG.md atualizado (se aplicável)

---

## 📄 Licença

MIT

---

## 🙏 Agradecimentos

Inspirado no [PoteBarato](https://github.com/GXDEVS/potebarato) by gxdev/TabNews.

---

**EscolaValor BR** — Open Source — Educação transparente e comparável.
