# REPORT-PHASE-13 — QA hardening and audit

> Data/hora: 2026-11-18 13:57 BRT  
> Status: PARTIAL  
> Gate: G13 — PARTIAL  
> Commit: não criado; branch `main` sem commits e arquivos do projeto não rastreados no worktree  
> Requisitos: RF-019, RNF-004, RNF-006, RNF-011, SPEC-008

## 1. Baseline verificada

- Foram lidos `AGENTS.md`, regras, GDD, visão, requisitos, roadmap, arquitetura/contratos/semântica, SPEC-008, rastreabilidade e relatório da Fase 12; também foram conferidos CI, scripts, dependências, relatórios prévios e estado Git.
- G12 está PARTIAL por falta de browser E2E, screenshots, profiling e inspeção de leaks. Por instrução do usuário para avançar mesmo com validação bloqueada, a auditoria prosseguiu sem alterar o status do gate anterior.
- Os testes automatizados de domínio e simulação já cobriam grid, editor, portas, determinismo, resolução de conflitos, regras, níveis, Sandbox e projeções. A suíte E2E já continha journeys de vitória, Sandbox, responsividade, teclado e áudio.
- O workflow CI existente rodava lint, typecheck, unit tests e build, mas não instalava browser, não executava fixtures de referência ou Playwright.

## 2. Plano executado

- Extraída a execução das soluções de referência para `reference-runner.ts`, compartilhada pela suíte unitária e por um comando executável sem servidor de browser.
- Adicionado `npm run test:fixtures`, que imprime status final, ticks, peças, itens emitidos/rejeições e estrelas para cada nível.
- CI atualizado para instalar Chromium com dependências, rodar fixtures e executar Playwright após o build.
- Executado smoke test do `dist/` com Vite Preview; HTML e bundle JS retornaram HTTP 200. A porta 3001 estava ocupada; a validação usou 3002 e encerrou o servidor após o smoke.
- Auditoria dos TCs críticos 001–028 confirmou cobertura unitária distribuída pelos arquivos de grid, editor, portas, simulação, sessão, níveis, storage e renderização. As assertions foram executadas dentro da suíte Vitest.
- Arquivos adicionados: `src/game/simulation/reference-runner.ts`, `scripts/reference-fixtures.mjs`, este relatório.
- Arquivos alterados: `package.json`, `.github/workflows/ci.yml`, `src/game/simulation/level-reference.test.ts`, `docs/specifications/SPEC-008.md`, `docs/requirements/REQUIREMENTS.md`, `docs/qa/TEST-PLAN.md`, `docs/roadmap/BACKLOG.md`.

## 3. Evidências técnicas

| Comando/teste | Executado? | Resultado real | Observações |
|---|---:|---|---|
| `npm run lint` | Sim | PASS | Exit code 0 após os ajustes do script. |
| `npm run typecheck` | Sim | PASS | Exit code 0. |
| `npm test` | Sim | PASS | 21 arquivos, 86 testes aprovados. |
| `npm run test:fixtures` | Sim | PASS | L01: 30 ticks/6 peças/3 emitidos/0 rejeições/3 estrelas; L02: 65/1/6/0/3; L03: 70/6/6/0/3. Todos terminam em RESULT. |
| `npm run build` | Sim | PASS | Bundle JS 606.54 kB minificado; aviso de chunk acima de 500 kB. |
| `npm run preview -- --host 127.0.0.1 --port 3002 --strictPort` | Sim | PASS | Vite Preview iniciou; GET `/` e `/assets/index-BBVi75bM.js` retornaram 200. Processo encerrado após smoke. |
| `npx playwright test --list` | Sim | PASS | Descobriu 7 testes em 5 arquivos. Discovery não executa o browser. |
| `npm run test:e2e -- --workers=1 --reporter=list` | Sim | BLOQUEADO | `Error: spawn EPERM` criando worker, antes do início dos casos. |
| GitHub Actions CI | Não | NOT_RUN | Workflow atualizado, mas sem push/execução remota. |
| Capturas/console do browser | Não | NOT_RUN | Nenhum screenshot nem observação visual produzidos. |

## 4. Critérios de aceite

| Critério | Status | Evidência |
|---|---|---|
| TCs críticos implementados e suíte unitária verde | PASS no escopo executável | 86 testes em 21 arquivos; `npm test` exit code 0. |
| Referências reproduzíveis com ciclos | PASS | `npm run test:fixtures` termina L01/L02/L03 em 30/65/70 ticks, sem rejeições, com 3 estrelas. |
| CI inclui lint, tipos, unit, fixtures, build e E2E | Implementado; execução remota NOT_RUN | `.github/workflows/ci.yml` atualizado; não foi executado no GitHub. |
| Release build estático servível | PASS smoke estático | Preview de `dist/` retornou HTTP 200 para HTML e JS. Não prova interação real do jogo. |
| E2E-001/002/003/004/005/007 executados em Chromium | NOT_RUN | Playwright bloqueado antes do início dos casos por `spawn EPERM`. |
| G13 | PARTIAL | Ver decisão abaixo. |

## 5. Problemas, dívidas e riscos

- **F13-001 — BLOCKER para G13 — E2E não inicia neste ambiente.** Reprodução: `npm run test:e2e -- --workers=1 --reporter=list`. Playwright chama `child_process.fork` e recebe `spawn EPERM` mesmo com um worker. Consequência: fluxo visual crítico, screenshots, console e fallback browser não foram verificados. Ação: rodar no GitHub Actions ou ambiente Windows que permita criar workers/browser; revisar os traces/capturas.
- **F13-002 — HIGH — workflow CI ainda sem resultado remoto.** O arquivo foi configurado para instalar Chromium e executar E2E, mas nenhum evento de push/PR disparou o workflow. Ação: executar a pipeline após o código ser publicado em remote autorizado.
- **F13-003 — MEDIUM — bundle maior que 500 kB.** Build funciona, mas Vite registra advisory para 606.54 kB JS. Ação: observar em profiling e considerar code splitting sem adivinhar gargalo.
- Playwright discovery e smoke HTTP são evidência de configuração/servidor, não de gameplay browser.

## 6. Mudanças documentais

- SPEC-008 marca implementação parcial.
- REQUIREMENTS mantém RF-019/RNF-004/RNF-006/RNF-011 sem status VERIFIED.
- TEST-PLAN registra runner, resultados de referência, smoke estático e inclusão do Playwright no workflow.
- BACKLOG registra G13 parcial e o motivo.
- Traceability não foi promovida a VERIFIED; existência de testes e workflow não prova execução do gate.

## 7. Decisão do gate

**G13: PARTIAL.** Lint, typecheck, 86 testes unitários, build, fixture script e smoke HTTP do build estático passaram. Playwright não executou nenhum caso por `spawn EPERM`, e o workflow CI remoto ainda não rodou. Por isso a jornada E2E e a CI completa não estão comprovadas. A instrução do usuário permite seguir para a Fase 14 mantendo G13 PARTIAL; não declarar PASS.
