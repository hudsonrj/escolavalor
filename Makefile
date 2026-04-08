.PHONY: help install dev build start test lint typecheck db-up db-down db-migrate db-studio clean

help: ## Mostra este help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Instala dependências
	bun install

dev: ## Inicia servidor de desenvolvimento
	bun run dev

build: ## Faz build para produção
	bun run build

start: ## Inicia servidor em produção
	bun run start

test: ## Roda testes
	bun test

test-watch: ## Roda testes em watch mode
	bun test --watch

lint: ## Roda linter
	bun run lint

lint-fix: ## Corrige problemas de lint automaticamente
	bun run lint:fix

typecheck: ## Verifica tipos TypeScript
	bun run typecheck

db-up: ## Sobe containers do banco de dados
	docker compose up -d
	@echo "Aguardando containers ficarem saudáveis..."
	@sleep 5
	@docker compose ps

db-down: ## Para containers do banco de dados
	docker compose down

db-migrate: ## Aplica migrations do banco
	bun run db:migrate

db-generate: ## Gera migrations do banco
	bun run db:generate

db-studio: ## Abre Drizzle Studio
	bun run db:studio

db-seed: ## Popula banco com dados de exemplo
	bun run db:seed

score-recalc: ## Recalcula todos os scores
	bun run score:recalculate

crawler: ## Executa crawler (uso: make crawler SOURCE=inep-enem)
	bun run crawler $(SOURCE)

clean: ## Limpa arquivos temporários
	rm -rf node_modules dist .cache *.log

setup: install db-up db-migrate db-seed ## Setup completo do projeto
	@echo "✅ Setup completo!"
	@echo "Execute 'make dev' para iniciar o servidor"

validate: typecheck lint test ## Valida código (typecheck + lint + test)
	@echo "✅ Validação completa!"
