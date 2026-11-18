# Backlog priorizado e controle de escopo

## P0 — indispensável

- [ ] Grid/raycast/placement confiáveis.
- [ ] Domain e simulação puros.
- [ ] Transporte source/conveyor e prevenção de duplicações.
- [ ] Processor CUT/PRESS; 2 ticks shift, 3 ticks processo.
- [ ] Diverter com regras por produto e outputs com reject.
- [ ] HUD, diagnostics, Start/Pause/Edit/Reset e victory.
- [ ] Uma vertical slice jogável e build estático.

## P1 — desejado após G08

- [ ] 3 fases, instruções curtas e solução referência.
- [ ] Resultado, métricas e estrelas calibradas.
- [ ] Feedback de modo, fluxo e erros com formas e texto.
- [ ] Sandbox mínimo reutilizando editor/engine.
- [ ] Preferências e progresso local resilientes.
- [ ] UX responsiva e testes E2E.
- [ ] Publicar e enviar itch.io com evidências.

## P2 — somente após G13

- [ ] Velocidade 2× opcional.
- [ ] Persistência versionada do layout Sandbox.
- [ ] Fases 04 e 05.
- [ ] Undo/redo.
- [ ] Export/import layout.

## Pós-jam

- [ ] Editor de regras com operadores lógicos e temporizadores.
- [ ] Receitas múltiplas e transformação em cadeia.
- [ ] Inventário, upgrades, custos de energia.
- [ ] Sinais de controle remoto e sensores separados.
- [ ] Editor de níveis e publicação de desafios.
- [ ] Pesquisa de port para Angular somente mediante ADR, sem reescrita gratuita.

Checkboxes são exclusivamente **planejamento**. Só marcar com relatório e teste associado.

## Evidência de implementação

- Fase 06: Processor, receitas, troca de modo e retenção de saída implementados; lint, typecheck, 48 testes e build passaram. G06 permanece PARTIAL sem validação visual e fluxo completo de saída.
- Fase 07: Diverter A/B, Outputs, rejeições e progresso de goals implementados; evidência de lint/typecheck/test/build e gate será consolidada em `docs/reports/REPORT-PHASE-07-routing.md`. G07 não deve ser inferido como PASS sem inspeção visual.
- Fase 08: L03 de referência entrega 3 CUT_PLATE em A e 3 PRESSED_BLOCK em B em fixture determinística; fluxo E2E e painel de replay foram escritos. G08 permanece PARTIAL porque o ambiente bloqueia inicialização do worker/browser (`spawn EPERM` / acesso negado), sem evidência de execução real no navegador.

- Phase 09: L01-L03 data, reference layouts, progression/unlock, contextual tutorials, result replay/next and measured reference scoring are implemented. `level-reference.test.ts` and `level-progression.test.ts` pass in the full unit suite; G09 remains PARTIAL because Playwright cannot spawn its worker (`spawn EPERM`) and visual UI evidence is unavailable.
- Phase 10: shared Sandbox mode, configurable source sequence, unlimited inventory, clear/load example, no-goal per-Output counting, and best-effort versioned progress/preferences are implemented. Versioned layout persistence remains deferred; see `REPORT-PHASE-10-sandbox.md` for test and E2E status.
- Phase 11: keyboard focus safeguards, restrained live announcements, accessible zoom controls and responsive/keyboard E2E cases are implemented. G11 remains PARTIAL; Playwright worker `spawn EPERM` prevented target screenshots and browser inspection. See `REPORT-PHASE-11-ux.md`.
- Phase 12: procedural machine details, snapshot interpolation, event-driven machine motion, shadows and opt-in Web Audio are implemented. G12 remains PARTIAL because E2E/browser visuals, performance profiling and leak inspection could not run (`spawn EPERM`); see `REPORT-PHASE-12-visual-audio.md`.
- Phase 13: CI now installs Chromium and schedules E2E; reference fixture command prints measured outcomes, and the local `dist/` preview served HTML/JS with HTTP 200. G13 remains PARTIAL because local Playwright workers fail (`spawn EPERM`) and remote CI has not run; see `REPORT-PHASE-13-qa-hardening.md`.
- Phase 14: no balance changes without human evidence. Both planned sessions are NOT_RUN (no participants/browser session); fixture times stay technical measurements. G14 PARTIAL; see `REPORT-PHASE-14-playtest.md` and `MANUAL-PLAYTEST.md`.
- Phase 15: release checklist, README controls/AI disclosure, official rules audit, manifest refresh, license audit and isolated lockfile install prepared. G15 PARTIAL: root `npm ci` hit a locked Rolldown binary, browser/screenshots/iframe unavailable, no public upload; see `REPORT-PHASE-15-release-candidate.md`.
- Phase 16: final local lint/typecheck/unit tests/build/reference fixtures pass; E2E remains blocked before test startup (`spawn EPERM`). G16 BLOCKED: no Git commit/remote, public itch page/build, real screenshots, or jam submission confirmation. See `REPORT-PHASE-16-release.md`; finish external publication and validation before calling the release complete.
