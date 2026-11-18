# SPEC-000 — Fundação e governança

**Status:** APPROVED FOR IMPLEMENTATION (não implementado)  
**Prioridade:** P0  
**Referências:** RF-019; RNF-003, RNF-004, RNF-011  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Estabelecer estrutura do repositório, disciplina de documentação, ferramentas e versões consistentes.

## Comportamento e escopo detalhado

- Scaffold de Vite/TS e Three.js com `strict`, lint, formatter, Vitest, build e CI.
- Conventions em `AGENTS.md` e `.agents/`, ADRs versionados, relatórios por fase e changelog.
- Scripts padronizados para lint, typecheck, test, build, test:e2e, se implementado.
- `.editorconfig`, `.gitignore`, licença do projeto a escolher e README confiável.
- Preserve configurações já existentes caso o repositório não esteja vazio.

## Critérios de aceite

1. `npm ci`, lint, typecheck, unit test vazio controlado e build rodam no ambiente real após scaffold.
2. CI reproduz comandos de qualidade, sem credenciais embutidas.
3. Não há dependência de frontend framework fora da decisão ADR-0002.
4. Um relatório real documenta versões instaladas, alterações e pendências.

## Casos negativos / bordas

- Input inválido não modifica estado silenciosamente; produzir erro tipado e feedback apropriado.
- Estado não permitido não executa ação (ex.: editar durante RUNNING).
- Falha do DOM, WebGL ou armazenamento não deve alterar regras do motor.
- Qualquer divergência de contrato deve ser formalizada em ADR/teste antes de mudar o comportamento.

## Testabilidade e evidências

- Testes com IDs em `docs/qa/TEST-PLAN.md`; linkar casos reais no relatório da fase.
- Quando houver UI, comprovar com captura ou registro E2E de fluxo real.
- Quando houver engine, verificar fixtures puras sem WebGL.
- Status só muda para VERIFIED após execução e gate correspondente aprovado.

## Não incluir nesta SPEC

Funcionalidades de prioridade superior à fase atual não justificadas. Sistemas pós-jam não devem contaminar o MVP.
