# REPORT-PHASE-05 — Source, conveyors and blocked flow

> Date/time: 2026-11-18 12:16 America/Sao_Paulo (UTC−03:00)  
> Status: PARTIAL  
> Gate: G05 — PARTIAL  
> Commit: not created; branch `main` has no commits  
> Requirements: RF-004, RF-005, RF-006; RNF-001, RNF-002, RNF-005, RNF-013; SPEC-002

## 1. Verified baseline

- Read `REPORT-PHASE-04-engine-core.md`; G04 was `PARTIAL` because the tick kernel did not yet integrate movement/events. The user explicitly authorized advancing phases despite partial validation/gates.
- Three.js 0.187.0 is in `package.json` and `package-lock.json`. `npm ci` previously installed 198 packages. Eleven high severity advisories and a Husky Git warning remain recorded in the Phase 04 follow-up.
- Vite 8.3.8 remains active at `127.0.0.1:3000`. After Phase 05 changes, `GET /`, `GET /src/main.ts` and `GET /src/game/simulation/simulation-controller.ts` each returned HTTP 200.
- No browser screenshot or manual WebGL interaction was captured. The current goal permits continuing without that evidence; it does not convert visual validation into a pass.

## 2. Work completed

- Integrated discrete source emission into `step`: first attempt at tick 5, periodic interval, alternating configured material sequence, stable `<sourceId>:<ordinal>` IDs, and persistent pending ordinal under backpressure. An item emits only after transfer commits and cannot move in that same tick.
- Integrated Conveyor movement against the start-of-transfer occupancy snapshot. Each item proposes at most one adjacent port-compatible receiver per tick; destinations use the deterministic reservation resolver; accepted moves commit without same-tick cascades.
- Added persistent blocked diagnostics and emits `BLOCKED` only when the reason changes. Items remain in their slots through missing ports, occupied/reserved destinations, or a connected output that does not yet have a sink implementation.
- Added `SimulationController` UI controls for Start/Pause/Resume/Edit/Reset using a 250 ms application timer. The timer only calls pure ticks; it does not define simulation behavior. Editor tools lock while RUNNING/PAUSED.
- Added an `ItemView` and pure `projectItems` adapter that draw each runtime slot item at its component's grid cell. Blue/amber blanks and their products use distinct geometry as well as color.
- Added/expanded tests for first emission, alternating sequence/IDs, blocked pending source retry, no-port diagnostics, ten-tick congestion, one-cell movement, and renderer projection. Mapped the existing TC-005–010 plus TC-041 to the implementation.

### Files added or changed

- Added: `src/game/simulation/simulation-controller.ts`, `src/game/rendering/item-view.ts`, `item-projection.ts`, `item-projection.test.ts`, `docs/reports/REPORT-PHASE-05-flow.md`.
- Changed: `src/game/simulation/simulation-engine.ts`, `simulation-engine.test.ts`, `src/game/domain/simulation.model.ts`, `session.model.ts`, `src/game/editor/editor-controller.ts`, `src/main.ts`, `index.html`, `src/styles/main.css`, `docs/qa/TRACEABILITY.md`.

## 3. Technical evidence

| Command/check | Executed? | Actual result | Notes |
|---|---:|---|---|
| `npm run lint` | Yes | PASS | ESLint completed with exit code 0. |
| `npm run typecheck` | Yes | PASS | Strict TypeScript completed with exit code 0. |
| `npm run test` | Yes | PASS | 10 files, 41 tests passed. Includes source, congestion, transfer, session and projection tests. |
| `npm run build` | Yes | PASS | Vite production build passed. Bundle is ~569 kB minified and still triggers the >500 kB advisory. |
| Static review of domain/simulation imports | Yes | PASS | Engine logic continues to import no DOM, Three.js, timer or frame-clock APIs. Timer is isolated in `simulation-controller.ts`. |
| Vite server on `127.0.0.1:3000` | Yes | PASS | Server remains running; app shell and edited modules returned HTTP 200. |
| Browser control of Start→item movement / screenshot | No | NOT_RUN | A local UI automation skill was unavailable as an executable tool in this session; HTTP transform does not prove canvas behavior. |
| `npm run test:e2e` | No | NOT_RUN | No E2E script is defined. |

## 4. Acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| Source emits every 5 ticks with alternating sequence and stable IDs | PASS | Simulation tests confirm tick-5 emission, BLUE/AMBER/BLUE order and IDs `source-1:0..2`. |
| A blocked source retains its ordinal and emits that item after space opens | PASS | Congested seeded queue blocks at tick 5; the same `source-1:0` is emitted at tick 6 after a slot is freed. |
| Conveyor movement respects ports, capacity and no-cascade snapshots | PASS | Tests verify one-cell-per-tick movement, a single reserved destination, and blocked contents retained for 10 ticks. |
| BLOCKED events are legible and do not spam while the condition is unchanged | PASS | Diagnostics retain reason and tests verify one event across repeated blocked ticks. |
| Item snapshot projects to the correct grid cell without mutating engine state | PASS | TC-041 passed. |
| Material visibly walks through conveyors in the browser | NOT_RUN | Item meshes and controls are implemented; no browser screenshot/manual interaction was available. |

## 5. Problems, debts and risks

- **F05-001 — HIGH — Visual behavior is not manually inspected.** Start the app at port 3000, build a source-to-conveyor line, run, pause and reset; capture the board after an item moves. The current evidence proves module serving and pure snapshots, not WebGL appearance/input.
- **F05-002 — MEDIUM — Outputs do not consume items yet.** Until Phase 07, a conveyor facing an Output reports `DESTINATION_NO_STORAGE` and keeps its item; Output delivery/rejection is not implemented in this phase.
- **F05-003 — MEDIUM — Processor and Diverter accept items into their runtime slots but do not act on them yet.** Phase 06/07 supplies their timer and routing behavior.
- **F05-004 — LOW — Simulation uses a fixed 250 ms interval.** Logical ticks are independent of rendering FPS, but application timer throttling in background tabs is not yet coordinated with visibility handling.
- **F05-005 — LOW — Build bundle remains above 500 kB.** The warning persists; splitting or lowering bundle size is deferred to hardening.

## 6. Documentation updates

- Test plan TC-005–010 now has matching source, conveyor, blocking and reservation test coverage; TC-041 covers item projection. Traceability RF-004/005/006 includes the relevant unit-test paths and stays `PLANNED` until the visual criterion and full G05 gate are reviewed.
- No ARC-003 semantics changed: source emission remains after transfer commit; destination occupancy uses the phase-start snapshot; reservations remain stable. No ADR was needed.
- Backlog checkboxes remain unchanged because the complete gate, including visual inspection, is not demonstrated.

## 7. Gate decision

**G05: PARTIAL.** Source backpressure, deterministic IDs, alternating emission, conveyor transfers, reservations, no-cascade behavior and unit tests pass. The Start/Pause/Resume/Edit/Reset controls and item meshes are connected to snapshots, and Vite serves the updated modules at port 3000. The visual acceptance criterion has no screenshot/manual browser evidence, so G05 is not declared PASS. Continue to Phase 06 under the user's explicit instruction; keep G05 partial until visual validation is captured.
