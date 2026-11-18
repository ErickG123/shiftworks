# REPORT-PHASE-06 — Processor modes and recipes

> Date/time: 2026-11-18 12:30 America/Sao_Paulo (UTC−03:00)  
> Status: PARTIAL  
> Gate: G06 — PARTIAL  
> Commit: not created; branch `main` has no commits  
> Requirements: RF-007, RF-008; RNF-005, RNF-013; SPEC-003

## 1. Verified baseline

- Read the Phase 05 report, Phase 06 prompt, `SPEC-003`, `SIMULATION-SEMANTICS`, test plan and traceability. G05 remains PARTIAL because no browser visual evidence exists; the user instructed continuing even if local visual/test validation is unavailable.
- Vite is installed at 8.3.8. `npm run dev -- --version` resolves the project's npm script and prints `vite/8.3.8 win32-x64 node-v24.16.0`. The existing dev server at `127.0.0.1:3000` returned HTTP 200 for `/` after the changes.
- Existing processor runtime types and layout validation were present, but the tick engine did not advance processor timers or recipes. The editor had no processor rule UI; placed processors had empty rules.
- The Vite build reports a 574.42 kB minified JS chunk and the existing advisory above 500 kB.

## 2. Work completed

- Added deterministic processor advancement: 2 ticks to shift, then 3 ticks to process; timer admission tick is not decremented. Completion transforms BLUE_BLANK to CUT_PLATE and AMBER_BLANK to PRESSED_BLOCK.
- Processor mode persists. Products become READY and can transfer through the normal reservation commit. If output has no port or destination capacity, the product remains in the processor slot and is not processed again.
- Added processor rule editing for BLUE/AMBER inputs with CUT, PRESS or no rule, up to two rules. New processors receive the standard BLUE→CUT and AMBER→PRESS recipes. Duplicate/over-limit rules are rejected by the editor; layout validation rejects invalid layouts before Start. Missing matches hold the input and produce a persistent RULE_MISSING diagnostic/event.
- Added readable processor phase, shift/process tick countdown, and blocked output status to the simulation HUD.
- Added unit coverage for 3-tick processing, 2+3 shift/process timing, mode persistence across an alternating input fixture, held products, missing rules, default/editable recipes and invalid editor configurations.

### Files added or changed

- Added: `src/game/simulation/processor.test.ts`, `docs/reports/REPORT-PHASE-06-processor.md`.
- Changed: `src/game/simulation/simulation-engine.ts`, `src/game/simulation/simulation-controller.ts`, `src/game/domain/simulation.model.ts`, `src/game/domain/editor.model.ts`, `src/game/editor/editor-reducer.ts`, `src/game/editor/editor-reducer.test.ts`, `src/game/editor/editor-controller.ts`, `index.html`, `docs/qa/TRACEABILITY.md`.

## 3. Technical evidence

| Command/check | Executed? | Actual result | Notes |
|---|---:|---|---|
| `npm run lint` | Yes | PASS | ESLint exit code 0. |
| `npm run typecheck` | Yes | PASS | Strict TypeScript exit code 0. |
| `npm run test` | Yes | PASS | 11 test files, 48 tests passed. |
| `npm run build` | Yes | PASS | Vite 8.3.8 production build passed; JS chunk 574.42 kB triggers the >500 kB advisory. |
| `npm run test:e2e` | No | NOT_RUN | No E2E script is defined. |
| `npm run dev -- --version` | Yes | PASS | npm recognizes the local Vite executable and reports 8.3.8. |
| `GET http://127.0.0.1:3000/` | Yes | PASS | Existing Vite server returned HTTP 200; this is not visual validation. |
| Manual browser/screenshot at 1280×720 | No | NOT_RUN | No browser screenshot or interaction evidence was captured. |

## 4. Acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| TC-011: BLUE in CUT mode produces CUT_PLATE after three processing ticks | PASS | `processor.test.ts`; processing admission tick is excluded from countdown. |
| TC-012: BLUE in PRESS mode shifts for two ticks and processes for three | PASS | `processor.test.ts`; event order and timer values asserted. |
| TC-013: Alternating BLUE/AMBER selects the correct persistent modes and products | PARTIAL | Runtime test re-admits the second item after simulating the previous output leaving. Full factory transport through a consumed Output is not available yet. |
| TC-014: Completed product remains held when output is unavailable | PASS | Product remains in the processor slot as READY; produced metric stays at one. |
| TC-015: Duplicate rules block invalid editor/layout configuration | PASS | Reducer and layout validator tests exercise duplicate rejection. |
| TC-016: Missing rule holds item and reports RULE_MISSING | PASS | Runtime test confirms retained input, diagnostic, and single event. |
| Shift/process status is coherent in the UI | PARTIAL | HUD projects deterministic runtime phase and countdown; visual/browser inspection was not performed. |
| G06 complete with visual evidence | NOT_RUN | No screenshot/manual browser evidence; full alternating output path is awaiting downstream Output behavior. |

## 5. Problems, debts and risks

- **F06-001 — HIGH — Processor HUD and visual synchronization are not inspected in a browser.** Reproduce by opening the game at port 3000, selecting a Processor, configuring recipes, and running the source path; inspect shift/process/blocked states at 1280×720. No screenshot evidence is currently available.
- **F06-002 — MEDIUM — Full consecutive-item transport is constrained by Output implementation.** `DESTINATION_NO_STORAGE` intentionally retains items at Output until a later phase implements consumption/rejection. Extend the integration fixture after that phase to run BLUE then AMBER through a complete path.
- **F06-003 — LOW — Bundle size warning remains.** Build output is 574.42 kB minified; consider code splitting during hardening.

## 6. Documentation updates

- Updated the RF-007/008/009 traceability row with the processor/reducer/layout test file paths. Status remains PLANNED because the complete visual gate is not demonstrated.
- `SPEC-003` and `SIMULATION-SEMANTICS` were not changed; the implementation follows the existing tick contract. No ADR or requirement change was needed.
- Backlog items remain unchecked because G06 is PARTIAL.

## 7. Gate decision

**G06: PARTIAL.** Vite is recognized, unit tests/typecheck/lint/build pass, processor mode timing and recipe outputs are covered, and blocked products remain stored. Visual behavior was not inspected; the alternating-item test isolates processor runtime and does not prove the full output-consuming factory path. The user explicitly authorized continuing phases despite incomplete validation, so continue to Phase 07 while carrying these limitations forward. Do not describe G06 as PASS.
