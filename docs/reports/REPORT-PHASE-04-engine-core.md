# REPORT-PHASE-04 — Simulation state and core tick

> Date/time: 2026-11-18 12:00 America/Sao_Paulo (UTC−03:00)  
> Status: PARTIAL  
> Gate: G04 — PARTIAL  
> Commit: not created; branch `main` has no commits  
> Requirements: RF-004, RF-011; RNF-001, RNF-002, RNF-003, RNF-005; SPEC-002

## 1. Verified baseline

- Read `REPORT-PHASE-03-editor.md`; G03 remained `PARTIAL` because there was no browser screenshot or manual interaction inspection. The user's instruction authorizes continuing implementation despite incomplete gates.
- The user requested Three.js be installed. `package.json` already declared `three@^0.187.0`; `npm install` installed Three.js and generated the missing lockfile. `npm ci --cache .npm-cache` then installed the lockfile cleanly (198 packages).
- Vite 8.3.8 is started using the standard npm script on `127.0.0.1:3000`; `GET /` and `GET /src/main.ts` return HTTP 200. This confirms serving/transformation, not visual WebGL behavior.
- `npm ci`'s `prepare` hook printed `git command not found` but the install completed with exit code 0. npm also reported 11 high severity advisories; `npm audit` has not been run.
- G01 remains `PARTIAL` in the previous report because CI remote execution and visual fallback inspection remain unverified. G02/G03 also remain partial. No gate is promoted based only on implementation.

## 2. Work completed

- Added discriminated `SimulationState`, `SimulationLayout`, `ItemInstance`, slot, processor/source/diverter runtime, goal progress, metrics, event payload and step result models. Layout snapshots clone and freeze component data, positions, rules, obstacles and goals separately from mutable-by-transition runtime snapshots.
- Added a setup validator for dimensions, component IDs/placement, obstacle overlap, source configuration, rule limits/duplicates and goal/output compatibility. `createSimulationState` rejects invalid definitions with `SimulationSetupError` and typed causes.
- Added pure session transitions for Start, Pause, Resume, Edit and Reset. Start/replay and Edit/Reset create fresh runtime counters and slots while preserving the immutable layout. Invalid transitions return typed errors.
- Added the first pure `step(state)` kernel: one call advances exactly one tick only in `RUNNING`; it reads no wall clock, FPS, DOM, Three.js or timers. Transport and machine behavior are intentionally delivered in the following engine phases.
- Added a per-tick `EventSequencer` with zero-based stable sequence numbers and a pure transfer reservation helper sorted by destination, source, item sequence and stable IDs. A destination can be accepted once per snapshot.
- Added test cases TC-036–040 and linked them in traceability. Tests cover replay, session modes, event ordering, reservations, invalid layout rejection and nested layout immutability.

### Files added or changed

- Added: `src/game/domain/simulation.model.ts`, `session.model.ts`, `layout-validator.ts`, `layout-validator.test.ts`, `src/game/simulation/simulation-engine.ts`, `simulation-engine.test.ts`, `event-sequencer.ts`, `transfer-resolver.ts`, `transfer-resolver.test.ts`, `docs/reports/REPORT-PHASE-04-engine-core.md`, `package-lock.json`.
- Changed: `src/game/domain/component.model.ts`, `default-level.model.ts`, `ports.model.ts`, `ports.model.test.ts`, `src/game/editor/editor-reducer.ts`, `vite.config.ts`, `docs/qa/TEST-PLAN.md`, `docs/qa/TRACEABILITY.md`, `docs/reports/REPORT-PHASE-01-foundation.md`, `docs/reports/REPORT-PHASE-03-editor.md`.

## 3. Technical evidence

| Command/check | Executed? | Actual result | Notes |
|---|---:|---|---|
| `npm ci --cache .npm-cache --fetch-timeout=20000 --fetch-retries=0` | Yes | PASS | Installed 198 packages from the generated lockfile. `prepare` printed a Git detection warning but returned exit code 0. npm reported 11 high severity advisories. |
| `npm run lint` | Yes | PASS | ESLint completed with exit code 0. |
| `npm run typecheck` | Yes | PASS | Strict TypeScript compilation completed with exit code 0. |
| `npm run test` | Yes | PASS | 9 files, 35 tests passed. Vitest uses the threads pool; default fork workers are denied by this environment (`spawn EPERM`). |
| `npm run build` | Yes | PASS | TypeScript and Vite production build passed. Bundle is ~554 kB minified and triggers Vite's >500 kB chunk advisory. |
| `rg` for Three/DOM/wall-clock/timer/render-loop APIs under `src/game/domain` and `src/game/simulation` | Yes | PASS | No forbidden imports or API references found in domain/simulation. |
| `npm run dev -- --host 127.0.0.1 --port 3000` | Yes | PASS | Vite 8.3.8 started using the standard `.bin` command. Server remains running. |
| `GET /` and `GET /src/main.ts` on port 3000 | Yes | PASS | Both returned HTTP 200. No browser screenshot or WebGL inspection was performed. |
| `npm run test:e2e` | No | NOT_RUN | No E2E script exists in the manifest. |

## 4. Acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| Same seeded state produces the same snapshots/events over N ticks | PARTIAL | TC-036 ran within the passing suite; current kernel only advances ticks and therefore does not yet produce transport/machine events. |
| Session transitions and pause/reset behavior are explicit | PASS | TC-037 and invalid-transition tests passed; Edit/Reset preserve layout and clear runtime. |
| Domain/simulation have no DOM, Three.js, timers or frame-clock dependency | PASS | Static `rg` returned no matches; imports remain type/model modules only. |
| Event sequencing and destination reservation are stable | PASS | TC-038/039 passed with fixed sequence and order-independent reservation winner. |
| Layout/goals/rules are validated before a session begins | PASS | TC-040 passed for overlap, duplicate rules, incompatible goals and setup rejection. |

## 5. Problems, debts and risks

- **F04-001 — HIGH — Tick pipeline is not yet integrated.** `step` currently advances the logical tick and enforces session mode; timer advancement, snapshot proposals, commit, admission, source emission, goals and gameplay events are implemented in later phases. Complete and test this order in Phases 05–07.
- **F04-002 — MEDIUM — Test worker pool differs from Vitest default.** In this managed Windows environment default fork workers fail with `spawn EPERM`; setting Vitest's pool to `threads` makes the regular `npm run test` pass. Keep an eye on the CI Linux runner.
- **F04-003 — MEDIUM — npm reported 11 high severity advisories.** `npm audit` was not run, so affected packages and fixes are not yet triaged; resolve or document before G13/G15.
- **F04-004 — LOW — Production bundle exceeds 500 kB.** Vite reports a 553.95 kB JavaScript chunk; assess code splitting during hardening if the bundle grows.
- **F04-005 — LOW — Husky prepare hook reports Git unavailable inside npm script.** `npm ci` still exits 0 and direct `git --version` works. Investigate hook installation before relying on local pre-commit enforcement.

## 6. Documentation updates

- Added TC-036–040 and linked the new engine/session/validation tests to RF-004, RF-011 and RNF-001/002/005/013. Status remains `PLANNED` in traceability until the acceptance matrix is fully complete and gates are reviewed.
- No SPEC or ADR changed: the implementation follows ARC-003's deterministic tick, immutable snapshots and stable reservation contract. Flow and machine tick phases are staged in prompts 05–07.
- Phase 01 and Phase 03 reports now include later dependency/install evidence; neither earlier gate is represented as fully passed.

## 7. Gate decision

**G04: PARTIAL.** Session transitions, layout/runtime separation, pure tick advancement, validators, event sequence and deterministic reservations are implemented and the new test suite passes. The complete ordered simulation pipeline is not wired into `step` yet; the current tick is intentionally a kernel for subsequent transport, processor and routing phases. The next phase can proceed under the user's explicit continuation instruction, but G04 remains partial until the integrated tick behavior and fixtures are verified.
