# Contribuindo para EscolaValor BR

Obrigado por considerar contribuir! 🎉

## 📋 Como Contribuir

### 1. Issues

- Reporte bugs usando o template de issue
- Sugira novas features de forma clara
- Descreva casos de uso reais

### 2. Pull Requests

#### Antes de começar

1. Leia o `CLAUDE.md` inteiro
2. Verifique se não há PR similar
3. Discuta mudanças grandes em issues primeiro

#### Processo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit seguindo conventional commits:
   - `feat:` nova funcionalidade
   - `fix:` correção de bug
   - `docs:` documentação
   - `refactor:` refatoração
   - `test:` testes
   - `chore:` manutenção

4. Adicione testes para novas funcionalidades
5. Certifique-se de que todos os testes passam
6. Faça push (`git push origin feature/minha-feature`)
7. Abra um Pull Request

### 3. Checklist do PR

- [ ] `bun test` passa sem falhas
- [ ] `bun run typecheck` sem erros
- [ ] `bun run lint` passa
- [ ] Nenhum dado pessoal de aluno
- [ ] Migrations geradas (se schema mudou)
- [ ] WEIGHTS_CHANGELOG.md atualizado (se pesos mudaram)
- [ ] README atualizado (se necessário)
- [ ] Testes adicionados para novas features

## 🎯 Áreas de Contribuição

### Alta Prioridade

- [ ] Implementar fontes de crawler específicas (OBMEP, OBF, etc)
- [ ] Completar testes de integração
- [ ] Adicionar cache Redis para queries frequentes
- [ ] WebSocket para atualizações em tempo real

### Média Prioridade

- [ ] Interface web (React 19 + Tailwind 4)
- [ ] Gráficos e visualizações (Recharts)
- [ ] Mapas de calor (Leaflet)
- [ ] Sistema de notificações

### Documentação

- [ ] Exemplos de uso da API
- [ ] Guia de deploy em produção
- [ ] Tutoriais de scraping

## 🚫 O que NÃO aceitar

- Código que armazena dados pessoais de alunos
- PRs sem testes
- Mudanças que quebram backward compatibility sem discussão
- Código que não passa no lint/typecheck

## 📝 Style Guide

### TypeScript

- Use tipos explícitos sempre que possível
- Evite `any` (use `unknown` se necessário)
- Prefira `const` e `readonly`
- Use async/await ao invés de callbacks

### Commits

```
feat: adiciona crawler de mensalidades

- Implementa scraping de sites de escolas
- Usa Playwright headless
- Retry com backoff exponencial

Refs #123
```

### Logs

Sempre use logger estruturado:

```typescript
logger.info('crawler', 'Iniciando scraping', { 
  url, 
  tentativa: 1 
});
```

## 🧪 Testes

### Unitários

```typescript
describe('Feature', () => {
  test('deve fazer X', () => {
    expect(resultado).toBe(esperado);
  });
});
```

### Integração

- Usar fixtures em `tests/fixtures/`
- Limpar banco após cada teste
- Mockar chamadas externas

## 💬 Comunicação

- Issues: perguntas e discussões
- Discussions: ideias e RFCs
- Pull Requests: mudanças concretas

## 📜 Código de Conduta

Seja respeitoso, inclusivo e construtivo.

---

**Obrigado por contribuir!** 🙏
