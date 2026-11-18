# REPORT-PHASE-07 — Diverter routing and Outputs

> Date/time: 2026-11-18 12:39 America/Sao_Paulo (UTC−03:00)  
> Status: PARTIAL  
> Gate: G07 — PARTIAL  
> Commit: not created; branch `main` has no commits  
> Requirements: RF-007, RF-008, RF-009; RNF-005, RNF-013; SPEC-003

## 1. Verified baseline

- Read the prior Phase 06 report and the Phase 07 prompt. G06 remained PARTIAL due to missing browser evidence and an incomplete end-to-end output path; continuing is authorized by the user.
- Three.js is installed as a project dependency. Vite 8.3.8 is recognized by `npm run dev -- --version`; the already-running server at `127.0.0.1:3000` serves `/`, `/src/main.ts`, and `/src/game/simulation/simulation-engine.ts` with HTTP 200.
- Before this phase, `DiverterRuntime` and port geometry existed, but the engine did not choose routes or deliver/reject at Outputs. The editor exposed only Processor recipes. Output goals were not updated by simulation.

## 2. Work completed

- Added editable rules for two product conditions on the Diverter: CUT_PLATE and PRESSED_BLOCK, each selecting A, B, or no rule. New Diverters receive CUT_PLATE→A and PRESSED_BLOCK→B defaults. Duplicate and over-limit configurations are rejected.
- The engine chooses a route once on item admission, stores it on the item/runtime, and only proposes the selected physical port. B is the clockwise/right-hand port for all four orientations.
- Outputs remain physical endpoints and consume arrivals. Only accepted types with a matching unsatisfied goal advance progress; wrong types and accepted items without a goal are rejected. Partial goals stay RUNNING; all satisfied goals transition once to RESULT.
- Added contextual UI selects for Processor and Diverter rules, output goal progress, machine route/phase text, and component coordinates in simulation diagnostics. No textual expression parser was added.
- Added tests for all four Diverter orientations, B routing after rotation, output delivery, wrong-type rejection, partial goals, goal completion, empty-type Output connectivity, and editor rule validation.

### Files added or changed

- Added: `src/game/simulation/routing-output.test.ts`, `docs/reports/REPORT-PHASE-07-routing.md`.
- Changed: `src/game/simulation/simulation-engine.ts`, `src/game/simulation/simulation-controller.ts`, `src/game/domain/ports.model.ts`, `src/game/domain/ports.model.test.ts`, `src/game/domain/editor.model.ts`, `src/game/editor/editor-reducer.ts`, `src/game/editor/editor-reducer.test.ts`, `src/game/editor/editor-controller.ts`, `src/game/domain/layout-validator.test.ts`, `index.html`, `docs/specifications/SPEC-003.md`, `docs/qa/TRACEABILITY.md`, `docs/roadmap/BACKLOG.md`.

## 3. Technical evidence

| Command/check | Executed? | Actual result | Notes |
|---|---:|---|---|
| `npm run lint` | Yes | PASS | ESLint exit code 0. |
| `npm run typecheck` | Yes | PASS | Strict TypeScript exit code 0. |
| `npm run test` | Yes | PASS | 12 test files, 54 tests passed, including the all-orientation test expansion. |
| `npm run build` | Yes | PASS | Vite build passed; JS chunk 579.65 kB triggers the >500 kB advisory. |
| `npm run test:e2e` | No | NOT_RUN | No E2E script is defined. |
| `npm run dev -- --version` | Yes | PASS | Local npm script reports `vite/8.3.8`. |
| GET `/`, `/src/main.ts`, simulation engine on port 3000 | Yes | PASS | All three requests returned HTTP 200. |
| Manual browser/screenshot at 1280×720 | No | NOT_RUN | No screenshot or visual interaction evidence was captured. |

## 4. Acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| TC-015: duplicate rule configuration rejected | PASS | Editor reducer and layout validator tests; invalid layout throws before Start. |
| TC-016: missing rule holds item and reports diagnostic | PASS | Processor runtime test covers held input and single RULE_MISSING event. |
| TC-017: A front / B right after rotation | PASS | Port tests cover four orientations; routing integration test follows B at N orientation. |
| TC-018: wrong output type is rejected and does not advance a goal | PASS | `routing-output.test.ts` asserts ITEM_REJECTED and unchanged progress. |
| TC-019: partial delivery does not win early | PASS | Quantity-two goal remains RUNNING after first delivery. |
| TC-020: complete goals enter RESULT | PASS | Quantity-one delivery records goal and transitions to RESULT. |
| Configure four rules without code | PARTIAL | Processor and Diverter panels expose four typed selects; no browser interaction evidence. |
| Output route is physically connected and type checked | PASS | Pure port matching and engine delivery/rejection tests. |
| G07 complete | PARTIAL | UI is implemented, but manual browser/E2E validation has not been performed. |

## 5. Problems, debts and risks

- **F07-001 — HIGH — Rule panels and route labels are not visually inspected.** Reproduce at `http://127.0.0.1:3000/`: place/select each machine, save the four conditions, run a branch and inspect 1280×720. No screenshot was captured.
- **F07-002 — MEDIUM — No E2E smoke script exists.** Unit tests cover pure routing and Output behavior, not mouse-driven configuration, live Three.js state, or visual accessibility.
- **F07-003 — LOW — Bundle warning persists.** Vite reports a 579.65 kB minified JS chunk; consider splitting during hardening.

## 6. Documentation updates

- Updated SPEC-003 status to reflect partial implementation and partial gates.
- Expanded the RF-007/008/009 traceability row with actual test file paths; status remains PLANNED until the full gate is evidenced.
- Added phase evidence to the backlog without checking off the P0 vertical slice. Requirements and ADRs were not otherwise changed; route geometry and tick semantics follow the existing contracts.

## 7. Gate decision

**G07: PARTIAL.** Rules, four-orientation port geometry, route persistence, output acceptance/rejection, partial goal progress, victory transition, lint/typecheck/test/build, and local Vite serving have implementation evidence. The UI was not manually inspected and no E2E runner exists, so G07 is not PASS. Continue to Phase 08 under the user's explicit instruction; carry forward the visual-validation gap and the large-bundle warning.
