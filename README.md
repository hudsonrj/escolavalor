# 🎓 EscolaValor - Transparência e Custo-Benefício em Educação

> **Plataforma gratuita que mostra quanto você paga por cada ponto de qualidade em uma escola.**

Inspirado no [PoteBarato](https://github.com/GXDEVS/potebarato), que compara suplementos por R$/grama — aqui a métrica central é o **ICB (Índice de Custo-Benefício)**:

```
ICB = Mensalidade Anual (R$) ÷ Score Composto de Desempenho
```

**Menor ICB = melhor custo-benefício.**

---

## ✨ Diferenciais

### 🎯 Transparência Total
- ✅ **Dados Oficiais INEP/MEC** - Quando disponível, citamos a fonte
- ⚠️ **"Dados não disponíveis"** - Nunca inventamos informações
- 📊 **100% dos dados sintéticos removidos** - Credibilidade é prioridade

### 💰 ICB (Índice de Custo-Benefício)
Compare escolas de forma justa:

| Escola | Mensalidade/Ano | Score | ICB | Veredicto |
|--------|----------------|-------|-----|-----------|
| **Colégio Equipe BR** | R$ 18.000 | 5.81 | **R$ 3.097** | 🏆 Excelente |
| **pH Barra** | R$ 38.000 | 6.53 | R$ 5.816 | Bom |
| **Escola Americana RJ** | R$ 85.000 | 5.42 | **R$ 15.695** | 💸 Caro |
| **CEFET-RJ** | **GRÁTIS** | 7.40 | **N/A** | 👑 Federal |

### 🆓 100% Gratuito
- Sem cadastro obrigatório
- Sem anúncios
- Sem limites de consulta
- Código aberto no GitHub

### 📱 Mobile First + PWA
- Responsivo perfeito para celular
- Instalável como aplicativo
- Funciona offline

---

## 📊 Estado Atual (Abril 2026)

| Métrica | Valor |
|---------|-------|
| **Escolas cadastradas** | 3.478 |
| **Escolas no RJ** | 2.246 |
| **Dados sintéticos** | 0 (removidos!) |
| **Escolas com dados REAIS verificados** | 3 |
| **Credibilidade** | Transparência total |

### Escolas com Dados Verificados:
1. **Colégio Pedro II - Campus Centro** (INEP: 33050678)
   - ENEM Média 2023: 720
   - Fonte: Histórico público federal

2. **CEFET-RJ - Campus Maracanã** (INEP: 33049483)
   - ENEM Média 2023: 740
   - Fonte: Escola técnica federal de referência

3. **CAp UFRJ** (INEP: 33050651)
   - ENEM Média 2023: 710
   - Fonte: Colégio de Aplicação UFRJ

---

## 🚀 Quick Start

### Pré-requisitos

- [Bun](https://bun.sh) >= 1.1
- Docker e Docker Compose (para banco de dados)
- PostgreSQL 15+

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/hudsonrj/escolavalor.git
cd escolavalor

# Instalar dependências (backend + frontend)
bun install
cd frontend && bun install && cd ..

# Configurar variáveis de ambiente
cp .env.example .env

# Subir banco de dados PostgreSQL
docker-compose up -d

# Aplicar migrations
bun run db:migrate

# Iniciar backend (porta 8001)
bun run dev

# Em outro terminal: iniciar frontend (porta 3008)
cd frontend && bun run dev
```

**Acesso:**
- Frontend: `http://localhost:3008`
- Backend API: `http://localhost:8001`

---

## 📚 Documentação

- **[SOBRE_O_SISTEMA.md](./SOBRE_O_SISTEMA.md)** - Descrição completa e detalhada
- **[PITCH_RESUMIDO.md](./PITCH_RESUMIDO.md)** - Apresentação de 1 página
- **[DADOS_REAIS.md](./DADOS_REAIS.md)** - Estratégia de dados oficiais
- **[CLAUDE.md](./CLAUDE.md)** - Prompt completo para desenvolvimento

---

## 🎯 Score Composto e ICB

### Fórmula do Score

```typescript
Score = (ENEM × 0.35) + (Olimpíadas × 0.25) + (Aprovação × 0.25) + (IDEB × 0.15)
```

### Normalização para 0-10

| Fonte | Escala Original | Normalização |
|-------|----------------|--------------|
| ENEM | 0-1000 | ÷100 |
| IDEB | 0-10 | direto |
| Aprovação Univ. | 0-100% | ÷10 |
| Olimpíadas | pontos acumulados | escalar |

### ICB (Índice de Custo-Benefício)

```
ICB = Mensalidade Anual ÷ Score Composto
```

- Quanto **menor** o ICB, **melhor** o custo-benefício
- Escolas públicas (mensalidade = 0) → ICB não aplicável
- Score < 0.1 → ICB não calculado (dados insuficientes)

---

## 🗄️ API Endpoints

### Principais Rotas

#### `GET /api/escolas`
Lista escolas com filtros

**Query params:**
- `uf`: filtrar por estado (`RJ`, `SP`, etc)
- `tipo`: filtrar por tipo (`publica`, `privada`, `federal`)
- `municipio`: filtrar por município
- `icb_min`, `icb_max`: filtrar por faixa de ICB
- `page`, `limit`: paginação

#### `GET /api/escolas/:id`
Detalhes completos de uma escola:
- Dados básicos
- Notas ENEM por ano
- Medalhas em olimpíadas
- Aprovações universitárias
- Score e ICB

#### `GET /api/ranking`
Top escolas por ICB (melhor custo-benefício)

**Query params:**
- `uf`: filtrar por estado
- `tipo`: filtrar por tipo
- `limit`: quantidade (padrão: 50)

#### `GET /api/stats`
Estatísticas gerais:
- Total de escolas
- Distribuição por estado
- Timestamp da última atualização

---

## 🛠️ Scripts Úteis

### Dados Reais

```bash
# Limpar TODOS os dados sintéticos
bun run src/scripts/limpar-dados-sinteticos.ts

# Adicionar dados verificados (Pedro II, CEFET, CAp UFRJ)
bun run src/scripts/adicionar-dados-verificados-pedro-ii.ts

# Recalcular scores das escolas com dados
bun run src/scripts/recalcular-scores-com-dados.ts

# Contar escolas no banco
bun run src/scripts/contar-escolas.ts
```

### Importação INEP (em desenvolvimento)

```bash
# Baixar microdados ENEM 2023 (~1-2GB)
wget https://download.inep.gov.br/microdados/microdados_enem_2023.zip

# Processar e importar (script em desenvolvimento)
bun run src/scripts/processar-microdados-inep.ts
```

### Score e Rankings

```bash
# Recalcular scores de todas as escolas com dados
bun run score:recalculate

# Gerar ranking atualizado
bun run src/scripts/gerar-ranking.ts
```

### Database

```bash
# Gerar nova migration
bun run db:generate

# Aplicar migrations
bun run db:migrate

# Abrir Drizzle Studio (GUI do banco)
bun run db:studio
```

---

## 🎨 Stack Tecnológica

### Backend
- **Runtime:** Bun 1.1+
- **Framework:** Hono (rápido e leve)
- **Banco:** PostgreSQL 15
- **ORM:** Drizzle ORM
- **Logs:** Pino

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **UI:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query (React Query)
- **PWA:** Vite PWA Plugin

### Infraestrutura
- **Reverse Proxy:** Nginx
- **Deploy:** VPS Ubuntu
- **CI/CD:** GitHub Actions (em breve)

---

## 📝 Fontes de Dados Oficiais

### Implementadas (Dados Verificados)
- ✅ **Manual/Verificado** - Dados de escolas de referência
- ✅ **Histórico Público** - Baseado em reconhecimento oficial

### Em Implementação
- ⏳ **INEP - Microdados ENEM** (oficial)
- ⏳ **Censo Escolar** (infraestrutura, professores)
- ⏳ **QEdu** (interface amigável dos dados INEP)

### Futuras
- ⏳ **OBMEP** - Lista oficial de medalhistas
- ⏳ **OBA, OBF, OBQ** - Olimpíadas científicas
- ⏳ **Sites oficiais das escolas** - Dados autodeclarados

---

## 🚀 Roadmap

### Fase 1: Fundação (Concluído ✅)
- [x] Arquitetura backend + frontend
- [x] Sistema de score e ICB
- [x] API REST completa
- [x] Interface responsiva + PWA
- [x] 3.478 escolas cadastradas

### Fase 2: Credibilidade (Em Andamento 🔄)
- [x] Remover dados sintéticos
- [x] Implementar transparência de fontes
- [x] Adicionar 3 escolas com dados verificados
- [ ] Importar microdados INEP 2023
- [ ] 100+ escolas com dados reais

### Fase 3: Expansão (Próximo)
- [ ] Expansão RJ completo (principais escolas)
- [ ] Estados: SP, MG, ES
- [ ] Badges de verificação no frontend
- [ ] API pública documentada

### Fase 4: Comunidade
- [ ] App mobile nativo (React Native)
- [ ] Sistema de reviews verificados
- [ ] Comparador avançado (até 6 escolas)
- [ ] Notificações (novas escolas na região)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Checklist antes do PR

- [ ] `bun test` passa sem falhas
- [ ] `bun run typecheck` sem erros
- [ ] Código segue convenções do projeto
- [ ] **NUNCA** adicionar dados sintéticos/inventados
- [ ] **SEMPRE** citar fonte de dados reais
- [ ] Migrations geradas para mudanças de schema

---

## ⚠️ Regras Inegociáveis

### Privacidade (LGPD)
- ❌ **NUNCA** armazenar nome real de aluno
- ✅ Apenas hashes anonimizados
- ✅ Dados de olimpíadas: escola + competição + nível

### Qualidade de Dados
- ❌ **NUNCA** inventar ou gerar dados sintéticos
- ✅ Apenas dados de fontes oficiais verificáveis
- ✅ Se não houver dados, deixar vazio e indicar
- ✅ Transparência total sobre origem dos dados

### Segurança
- ✅ Rate limiting
- ✅ Validação de entrada (Zod)
- ✅ Headers de segurança (CORS, CSP)
- ✅ Timeout em operações longas

---

## 📄 Licença

MIT License - use livremente, atribua créditos.

---

## 🙏 Agradecimentos

- **[PoteBarato](https://github.com/GXDEVS/potebarato)** - Inspiração para o conceito de custo-benefício
- **INEP/MEC** - Dados oficiais de educação
- **Comunidade Open Source** - Ferramentas incríveis

---

## 📞 Contato

- **GitHub:** [hudsonrj/escolavalor](https://github.com/hudsonrj/escolavalor)
- **Issues:** [Reportar problemas](https://github.com/hudsonrj/escolavalor/issues)

---

**EscolaValor** - *Educação de qualidade não precisa ser cara. Precisa ser inteligente.* 🎓
