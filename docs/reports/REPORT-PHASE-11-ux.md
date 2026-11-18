# REPORT-PHASE-11 — UX and accessibility

> Data/hora: 2026-11-18 13:44 BRT  
> Status: PARTIAL  
> Gate: G11 — PARTIAL  
> Commit: não criado; branch `main` sem commits e arquivos do projeto não rastreados no worktree  
> Requisitos: RF-016, RNF-007, RNF-008, SPEC-005

## 1. Baseline verificada

- Foram lidos `AGENTS.md`, regras em `.agents/`, o prompt da Fase 11, GDD, visão, requisitos, arquitetura e ADRs, SPEC-005, plano de testes, rastreabilidade, roadmap e relatório da Fase 10.
- G10 estava PARTIAL por bloqueio do Playwright. Conforme instrução do usuário para continuar as etapas mesmo sem browser/testes E2E, a Fase 11 prosseguiu mantendo o bloqueio explícito.
- O projeto já declara `three@^0.187.0` como dependência e `vite@^8.3.8` como devDependency. `npm ls vite three --depth=0` resolve `vite@8.3.8` e `three@0.187.0`; `npm run dev -- --version` imprime `vite/8.3.8`.
- A UI já possuía Canvas, editor, HUD, regras e resultados, mas as métricas de tick e mensagens rápidas estavam como regiões live e os atalhos globais não protegiam o foco em botões/elementos editáveis.

## 2. Plano executado

- Adicionado filtro compartilhado de atalhos globais para ignorar controles focados, composição IME, modificadores e repetição; Escape cancela uma ferramenta ativa e Space inicia/pausa/retoma a simulação quando o foco não está em um controle interativo.
- Separado o feedback de prévia de colocação da região `aria-live` de ações do editor. As métricas rápidas, célula selecionada, estados do Processor e mensagem por tick deixaram de ser anunciados a cada atualização; mudanças importantes têm uma região de anúncio própria.
- Adicionados controles DOM acessíveis para reduzir, ampliar e redefinir zoom; o wheel continua associado somente ao canvas. Acrescentadas instruções de teclado e estados de foco/hover/disabled.
- Criados testes E2E para layout em 1280×720 e 1920×1080 e para shortcuts/foco.
- Arquivos adicionados: `src/game/interaction/keyboard-shortcuts.ts`, `src/game/interaction/keyboard-shortcuts.test.ts`, `e2e/responsive-ux.spec.ts`, `e2e/keyboard-ux.spec.ts`, este relatório.
- Arquivos alterados: `src/game/editor/editor-controller.ts`, `src/game/simulation/simulation-controller.ts`, `src/game/rendering/scene-manager.ts`, `src/styles/main.css`, `index.html`, `docs/specifications/SPEC-005.md`, `docs/requirements/REQUIREMENTS.md`, `docs/qa/TEST-PLAN.md`, `docs/qa/TRACEABILITY.md`, `docs/roadmap/BACKLOG.md`.

## 3. Evidências técnicas

| Comando/teste | Executado? | Resultado real | Observações |
|---|---:|---|---|
| `npm run lint` | Sim | PASS | Exit code 0 após as alterações. |
| `npm run typecheck` | Sim | PASS | Exit code 0 após as alterações. |
| `npm test` | Sim | PASS | 19 arquivos, 82 testes aprovados. |
| `npm run build` | Sim | PASS | Vite 8.3.8; bundle JS 599.49 kB minificado e aviso de chunk acima de 500 kB. |
| `npx playwright test --list` | Sim | PASS | Descobriu 6 testes em 4 arquivos, incluindo E2E-004/005. Só discovery, não execução. |
| `npm run test:e2e -- --reporter=list` | Sim | BLOQUEADO | Playwright falhou antes de iniciar testes ao criar worker: `Error: spawn EPERM`. |
| `npm ls vite three --depth=0` | Sim | PASS | `vite@8.3.8` e `three@0.187.0` resolvidos no projeto. |
| `npm run dev -- --version` | Sim | PASS | O script local encontrou o executável Vite e imprimiu `vite/8.3.8`. |
| GET `http://127.0.0.1:3000/` | Sim | PASS | HTTP 200 no smoke check local; não substitui inspeção de browser. |
| Inspeção manual / screenshots | Não | NOT_RUN | Nenhuma captura produzida; browser E2E indisponível por `spawn EPERM`. |

## 4. Critérios de aceite

| Critério | Status | Evidência |
|---|---|---|
| E2E-004 em 1280×720 e 1920×1080 | NOT_RUN | Implementado em `e2e/responsive-ux.spec.ts`; não foi executado. |
| E2E-005 navegação por teclado e foco | NOT_RUN | Implementado em `e2e/keyboard-ux.spec.ts`; proteção de atalhos tem 6 testes unitários aprovados em `keyboard-shortcuts.test.ts`. |
| Screenshots nas duas resoluções | NOT_RUN | O teste define destinos em `artifacts/ux-1280x720.png` e `artifacts/ux-1920x1080.png`; nenhum arquivo foi gerado. |
| Hover/foco/disabled e zoom acessível | Implementado, visual NOT_RUN | CSS e controles adicionados; falta inspeção em browser real. |
| G11 | PARTIAL | Ver decisão abaixo. |

## 5. Problemas, dívidas e riscos

- **F11-001 — BLOCKER para G11 — Browser E2E e evidência visual indisponíveis.** Reprodução: `npm run test:e2e -- --reporter=list`. O runner lança `spawn EPERM` antes de iniciar os workers. Consequência: E2E-004/005 e screenshots não foram validados. Ação: executar os testes e inspecionar as duas resoluções em ambiente que permita iniciar processos filhos de browser.
- **F11-002 — LOW — Bundle acima do limite de aviso.** `npm run build` passou com JS de 599.49 kB minificado e aviso do Vite. Ação: considerar divisão do bundle na fase de hardening.
- Os arquivos do projeto seguem não rastreados no branch de baseline sem commits; não houve commit nesta fase.

## 6. Mudanças documentais

- SPEC-005 agora indica implementação parcial, sem declarar verificação do gate.
- REQUIREMENTS registra o trabalho implementado e mantém RF-016/RNF-007/RNF-008 sem verificação.
- TEST-PLAN e TRACEABILITY ligam E2E-004/005 aos novos testes, mantendo os requisitos em PLANNED até execução e gate.
- BACKLOG registra evidência parcial da fase.
- Nenhuma mudança de contrato/domínio exigiu ADR ou alteração do GDD.

## 7. Decisão do gate

**G11: PARTIAL.** Lint, typecheck, 82 testes unitários, build e discovery dos E2E passaram. O comando E2E falha antes da execução com `spawn EPERM`, portanto não há prova de navegação real, layout nem screenshots. O projeto já reconhece Vite e Three.js pelas dependências e script npm verificados. Pela instrução do usuário para continuar fases apesar da validação de browser bloqueada, a Fase 12 pode ser executada mantendo G11 PARTIAL; não declarar este gate PASS.
