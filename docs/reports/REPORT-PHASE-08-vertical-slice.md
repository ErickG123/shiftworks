# REPORT-PHASE-08 — L03 vertical slice

> Date/time: 2026-11-18 12:57 America/Sao_Paulo (UTC−03:00)  
> Status: PARTIAL  
> Gate: G08 — PARTIAL  
> Commit: not created; branch `main` has no commits  
> Requirements: RF-004–012; RNF-001, RNF-002, RNF-005, RNF-013; SPEC-002–005

## 1. Verified baseline

- Read the Phase 07 report and Phase 08 prompt. G07 remained PARTIAL because the UI had no browser evidence; the user's instruction permits continuing with explicit limitations.
- Vite 8.3.8 is recognized by the npm script and serves `/`, `/src/main.ts`, the simulation controller, and the L03 level module on `127.0.0.1:3000` with HTTP 200.
- The project had output goal handling but no application L03 configuration, no result/replay panel, and no E2E runner. The real editor still used the generic preview level.

## 2. Work completed

- Added a physically connected L03 board: Source at `(0,3)`, Processor at `(1,3)`, three eastbound conveyors, Diverter at `(5,3)`, A at `(6,3)`, and a southbound branch to B at `(5,5)`. Its reference layout has typed recipes and route rules and targets 3 CUT_PLATE at A plus 3 PRESSED_BLOCK at B.
- Switched the live editor/runtime to L03 while preserving the generic level fixtures used by earlier tests. The L03 source interval is 10 ticks to match machine/transport throughput; the reference completes with exactly six emitted items, six deliveries, no rejects, and no items left in slots.
- Added a deterministic integration fixture that runs without user input after Start, asserts exact goals and empty storage at RESULT, and compares repeat snapshots/events. Replay from RESULT is also checked to reset tick and runtime slots.
- Added HUD goal progress, tick/delivery/reject/mode-switch metrics, a result panel, and a Replay button. Status text now reports the active L03 editor/runtime rather than the old scaffold state.
- Added Playwright dependency, test script/config, a browser-driven L03 build-and-win test, and a direct CDP runner for this restricted Windows environment.

### Files added or changed

- Added: `src/game/domain/l03-level.model.ts`, `src/game/simulation/l03-reference.test.ts`, `e2e/l03-victory.spec.ts`, `e2e/run-l03-over-cdp.mjs`, `playwright.config.ts`, `docs/reports/REPORT-PHASE-08-vertical-slice.md`.
- Changed: `src/game/editor/editor-controller.ts`, `src/game/simulation/simulation-controller.ts`, `src/status.ts`, `src/status.test.ts`, `index.html`, `src/styles/main.css`, `package.json`, `package-lock.json`, `.gitignore`, `docs/specifications/SPEC-002.md`, `docs/specifications/SPEC-004.md`, `docs/qa/TEST-PLAN.md`, `docs/qa/TRACEABILITY.md`, `docs/roadmap/BACKLOG.md`.

## 3. Technical evidence

| Command/check | Executed? | Actual result | Notes |
|---|---:|---|---|
| `npm run lint` | Yes | PASS | ESLint exit code 0. |
| `npm run typecheck` | Yes | PASS | Strict application TypeScript exit code 0. |
| `npm run test` | Yes | PASS | 13 files, 56 tests passed. Includes exact L03 delivery and deterministic replay fixture. |
| `npm run build` | Yes | PASS | Vite production build passed. JS chunk is 581.79 kB and triggers the >500 kB advisory. |
| E2E TypeScript check (`npx tsc ... playwright.config.ts e2e/l03-victory.spec.ts`) | Yes | PASS | Playwright config/spec types checked independently. |
| `npx playwright test --list` | Yes | PASS | Discovers the L03 victory test. This does not execute the test. |
| `npm run test:e2e -- --reporter=list` | Yes | BLOCKED | Playwright runner fails before test execution with `spawn EPERM` when creating its worker. |
| `npx playwright install chromium` | Yes | BLOCKED | Browser installer fails with `spawn EPERM`. |
| Direct Playwright Chrome launch / system Chrome headless | Yes | BLOCKED | Direct launch returns `browserType.launch: spawn EPERM`; shell-launched headless Chrome exits on Mojo `Acesso negado (0x5)`. |
| Vite GET `/`, `/src/main.ts`, simulation controller, L03 model | Yes | PASS | All returned HTTP 200 on port 3000. |
| Browser victory run / screenshot | No | NOT_RUN | No browser could be launched in this environment; no screenshot artifact exists. |

## 4. Acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| L03 reference layout is physically connected and solvable | PASS | `l03-reference.test.ts` runs the checked-in layout through Source, Processor, conveyors, Diverter and Outputs. |
| Three cut plates reach A and three pressed blocks reach B without input after Start | PASS in engine fixture | Goals end at `3/3` each; exactly six items emitted, zero rejected, and slots empty at RESULT. |
| Deterministic fixture and events | PASS | Two full reference runs serialize identically. |
| Replay resets runtime | PASS in domain test | Starting again from RESULT resets tick to zero and empties all slots. |
| Browser E2E builds the factory and reaches victory | NOT_RUN | Test is written and discovered, but the runner/browser is blocked by process restrictions. |
| Result screen and replay are visually usable | NOT_RUN | UI code is implemented; no browser or screenshot inspection. |
| G08 | PARTIAL | Engine acceptance passes, but the gate requires a real browser E2E and evidence, which could not run here. |

## 5. Problems, debts and risks

- **F08-001 — BLOCKER for G08 — Browser process launch is denied by this environment.** `npm run test:e2e` reproduces `spawn EPERM`; direct headless Chrome reports Mojo access denied. On an environment that permits child processes, run `npm run test:e2e` and save the resulting 1280×900 screenshot.
- **F08-002 — LOW — Bundle size advisory persists.** Build output reports 581.79 kB minified; defer code splitting to hardening.
- **F08-003 — MEDIUM — App-level UI paths remain unverified.** Mouse cell projection, recipe panels, visual status cadence, Replay, WebGL and the result layout need the browser E2E/manual pass.

## 6. Documentation updates

- Updated SPEC-002 and SPEC-004 to indicate partial implementation, added the L03 E2E mapping to the QA plan/traceability, and recorded phase evidence in the backlog.
- Requirements and ADRs were not changed. The level follows current port, tick, processor and routing contracts; source interval 10 is a data-level L03 pacing choice, not a change to engine timing.
- The E2E test is planned/discoverable but is not marked verified because it did not execute.

## 7. Gate decision

**G08: PARTIAL.** The deterministic engine fixture reaches exactly 3+3 with no rejects or leftover items, replay resets correctly, lint/typecheck/unit tests/build pass, and Vite serves the app. The browser E2E and screenshot are not verified because Playwright worker and Chrome launch fail with environment process restrictions. Continue to Phase 09 under the user's explicit instruction; rerun the E2E test in an environment that permits browser child processes before claiming G08 PASS.
