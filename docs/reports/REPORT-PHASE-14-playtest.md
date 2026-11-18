# REPORT-PHASE-14 — Playtest and balance

> Data/hora: 2026-11-18 14:00 BRT  
> Status: PARTIAL  
> Gate: G14 — PARTIAL  
> Commit: não criado; branch `main` sem commits e arquivos do projeto não rastreados no worktree  
> Requisitos: RF-013, RF-014, RNF-006, SPEC-004, SPEC-005

## 1. Baseline verificada

- Foram consultados `AGENTS.md`, regras, GDD, visão, requisitos, roadmap, arquitetura, semântica, SPEC-004, QA traceability, protocolo `MANUAL-PLAYTEST.md` e relatório da Fase 13.
- G13 permanece PARTIAL: Playwright não consegue iniciar workers (`spawn EPERM`) e CI remota não foi executada. A instrução do usuário permite seguir as fases, mantendo a limitação.
- O protocolo exige dois participantes humanos e pede não ensinar soluções. Não houve participantes disponíveis nesta execução, então não foi conduzida nem simulada nenhuma sessão.
- Os fixtures técnicos seguem concluindo L01/L02/L03 em 30/65/70 ticks e 3 estrelas, mas esses números não são resultados de playtest.

## 2. Plano executado

- Revisto o protocolo de observação e registrados os dois slots como NOT_RUN, sem dados pessoais ou respostas inventadas.
- Mantidos os limiares de estrelas e os custos 2 ticks de shift/3 de processamento: sem evidência de jogador não há base para alterá-los.
- Nenhuma alteração de código ou semântica do motor foi feita. Próxima coleta deve usar um build realmente jogável em navegador com consentimento para qualquer gravação.
- Arquivos alterados: `docs/qa/MANUAL-PLAYTEST.md`, `docs/specifications/SPEC-004.md`, `docs/requirements/REQUIREMENTS.md`, `docs/roadmap/BACKLOG.md`, este relatório.

## 3. Evidências técnicas

| Comando/teste | Executado? | Resultado real | Observações |
|---|---:|---|---|
| `npm run lint` | Sim | PASS | Exit code 0. |
| `npm run typecheck` | Sim | PASS | Exit code 0. |
| `npm test` | Sim | PASS | 21 arquivos, 86 testes. |
| `npm run build` | Sim | PASS | Bundle JS 606.54 kB; aviso de chunk acima de 500 kB. |
| `npm run test:fixtures` | Sim | PASS | L01/L02/L03 em 30/65/70 ticks, sem rejeições, 3 estrelas cada. |
| `npm run test:e2e -- --workers=1 --reporter=list` | Sim | BLOQUEADO | `spawn EPERM` ao iniciar worker Playwright, antes de qualquer caso. |
| Playtest humano P1/P2 | Não | NOT_RUN | Sem participantes nesta execução. |

## 4. Critérios de aceite

| Critério | Status | Evidência |
|---|---|---|
| Duas sessões humanas observadas | NOT_RUN | P1 e P2 registrados como NOT_RUN em `MANUAL-PLAYTEST.md`. |
| Observações reais de onboarding/SHIFT | NOT_RUN | Nenhuma sessão disponível; não inventadas. |
| Ajustes de balanceamento baseados em evidência | Sem alteração | Ticks dos fixtures são medições de engine e não justificam ajuste de UX/balanceamento. |
| Regressão após ajuste de regras | N/A | Nenhuma regra de gameplay foi alterada. |
| G14 | PARTIAL | Limitação documentada; faltam sessões e browser acessível. |

## 5. Problemas, dívidas e riscos

- **F14-001 — HIGH — Sem observação humana do tutorial e descoberta de regras.** Consequência: não sabemos se jogadores entendem a mudança CUT/PRESS, o roteamento A/B e a edição sem ajuda. Ação: conduzir duas sessões pelo roteiro após disponibilidade de participantes e browser jogável.
- **F14-002 — BLOCKER para validação do fluxo no browser — E2E indisponível.** Reprodução: `npm run test:e2e -- --workers=1 --reporter=list`; termina em `spawn EPERM`. Ação: executar em ambiente que permita processos filhos e verificar onboarding/vitória visual.
- Não há correção ou balanceamento inferido sem dados de jogador.

## 6. Mudanças documentais

- `MANUAL-PLAYTEST.md` registra claramente os slots NOT_RUN e distingue fixture técnico de resultado humano.
- SPEC-004 e REQUIREMENTS anotam que onboarding/estrelas ainda não têm validação de jogador.
- BACKLOG registra G14 PARTIAL; requisitos e traceability não foram marcados VERIFIED.
- Sem alteração de GDD, ADR ou semântica de ticks.

## 7. Decisão do gate

**G14: PARTIAL.** A limitação de sessões foi documentada e não houve mudança de balanceamento, mas o critério de duas observações humanas não foi atendido e o browser permanece sem execução E2E. O usuário pediu que as etapas prossigam, portanto a Fase 15 pode seguir com G14 PARTIAL; não declarar PASS.
