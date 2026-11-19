# REPORT-CNT-21 — QA, Integração, Fixtures e E2E (Conteúdo 2.0)

- **Status:** CONCLUÍDO
- **Data:** 2026-11-18
- **Escopo:** `CNT-01`..`CNT-21`

## 1. Resumo da Verificação

- **Lint (`npm run lint`):** PASS (`eslint .` com 0 erros).
- **Typecheck (`npm run typecheck`):** PASS (`tsc --noEmit` em modo estrito após alinhamento de `advanced-systems.model.ts` para os 8 equipamentos).
- **Testes Unitários e de Integração (`npm test`):** PASS — 31 arquivos de teste / 142 testes passando, incluindo validação determinística de todas as 20 fases (`L01–L20`).
- **Fixtures de Referência (`npm run test:fixtures`):** PASS — 20/20 fases (`L01–L20`) atingem `RESULT` com `rejectedCount === 0` e `stars === 3`.
- **Build de Produção (`npm run build`):** PASS.
- **E2E Playwright (`npm run test:e2e`):** PASS — 11/11 testes reais em navegador após correção de overflow vertical no `LEVEL_SELECT` (`src/styles/main.css`) para suportar 20 cartões de fase em `1024×768` e `1280×720`.

## 2. Defeitos Encontrados e Corrigidos no QA

1. `L07` fixture emitia 4º `BLUE_BLANK` antes do 3º `AMBER_BLANK` (`rejected: 1`, `stars: 2`): ajustada sequência para alternância `['BLUE_BLANK', 'AMBER_BLANK']` (`62` ticks, `0` rejeições, `3` estrelas).
2. `advanced-systems.model.ts`: `requiredByType` continha apenas os 3 equipamentos antigos; atualizado para os 8 equipamentos com fallback `?? 0`.
3. `src/styles/main.css`: `.screen-overlay[data-screen="LEVEL_SELECT"]` centralizava verticalmente sem `overflow-y: auto`, empurrando `L01` para fora da viewport com 20 fases; corrigido com `align-items: flex-start; overflow-y: auto`.
