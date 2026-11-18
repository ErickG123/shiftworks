# REPORT-PHASE-09 — Levels, progression and scoring

> Date: 2026-11-18 (America/Sao_Paulo)  
> Status: PARTIAL  
> Gate: G09 — PARTIAL  
> Commit: not created; branch `main` has no commits  
> Requirements: RF-013/014, RNF-006/RNF-013, SPEC-004

## 1. Verified baseline

- Read the Phase 09 prompt, Phase 08 report, project rules and the relevant GDD, vision, requirements, architecture contracts, ADRs, level catalog, test plan, traceability and backlog.
- Three.js is a library and is already declared and installed: `npm ls three vite --depth=0` reports `three@0.187.0` and `vite@8.3.8`. Rendering and interaction modules import Three.js; simulation/domain modules remain independent.
- The repository had the L03-only playable flow from Phase 08. G08 was PARTIAL because Playwright could not spawn a worker and no browser visual check was available.
- `npm run typecheck` initially found an event handler returning `boolean` while declared `void`; the handler was corrected during this phase.

## 2. Work completed

- Added playable catalog data for L01 transport, L02 processor mode shifts and L03 product routing, each with contextual lesson text and a reference layout.
- Added reference fixtures that run the production simulation engine until RESULT and assert all goals, zero rejects, empty slots, piece count and 3-star rating.
- Added in-memory progression: L01 starts unlocked, completing a level unlocks the next, and completion is idempotent.
- Connected the level selector and contextual instructions, result title/stars, replay and next-level flow. Added used pieces to the HUD metrics.
- Derived star tick boundaries from measured reference fixtures: L01 30 ticks/6 pieces, L02 65 ticks/1 piece, L03 70 ticks/6 pieces. The three-star boundary is one tick beyond each measured completion, requires at most the reference piece count and zero rejects.
- Updated the E2E journey to build and win L01, L02, then L03. Its discovery and TypeScript check pass; execution remains blocked before test startup.
- Confirmed the requested rendering dependency was already present rather than adding a duplicate package.

### Files added or changed

- Added: `src/game/domain/level-catalog.model.ts`, `src/game/domain/level-progression.model.ts`, `src/game/domain/level-progression.test.ts`, `src/game/domain/level-scoring.model.ts`, `src/game/simulation/level-reference.test.ts`, `docs/reports/REPORT-PHASE-09-levels.md`.
- Changed: `src/game/editor/editor-controller.ts`, `src/game/simulation/simulation-controller.ts`, `src/game/domain/session.model.ts`, `e2e/l03-victory.spec.ts`, `docs/levels/LEVEL-CATALOG.md`, `docs/specifications/SPEC-004.md`, `docs/qa/TEST-PLAN.md`, `docs/qa/TRACEABILITY.md`, `docs/roadmap/BACKLOG.md`.

## 3. Technical evidence

| Command/check | Executed? | Actual result | Notes |
|---|---:|---|---|
| `npm ls three vite --depth=0` | Yes | PASS | `three@0.187.0`, `vite@8.3.8`. |
| Vite smoke check on `127.0.0.1:3000` | Yes | PASS | `npm run dev -- --version` reports Vite 8.3.8; index, Three.js scene module and optimized Three.js dependency return HTTP 200 via `curl.exe --noproxy "*"`. |
| `npm run lint` | Yes | PASS | Exit code 0. |
| `npm run typecheck` | Yes | PASS | Exit code 0 after fixing the event handler. |
| `npm run test` | Yes | PASS | 15 files, 62 tests passed, including level reference, scoring and progression tests. |
| `npm run build` | Yes | PASS | Vite 8.3.8 production build succeeded. Bundle is 588.07 kB and triggers the >500 kB advisory. |
| Playwright TypeScript check | Yes | PASS | `npx tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --strict --skipLibCheck --types node playwright.config.ts e2e/l03-victory.spec.ts`. |
| `npx playwright test --list` | Yes | PASS | Discovers the one L01→L02→L03 journey; discovery is not execution. |
| `npm run test:e2e -- --reporter=list` | Yes | BLOCKED | Playwright reports `Error: spawn EPERM` while starting its worker, before the test runs. |
| Manual browser/UI check at 1280×720 | No | NOT_RUN | No browser screenshot or visual inspection is available. |

## 4. Acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| L01, L02 and L03 have reference layouts that reach all goals | PASS in engine fixture | `level-reference.test.ts`; measured at 30, 65 and 70 ticks respectively. |
| L02 demonstrates automatic CUT/PRESS shifting | PASS in engine fixture | L02 reaches both goals and records five mode shifts. |
| Progression unlocks the next level after completion | PASS in unit tests | `level-progression.test.ts`; completion is idempotent and unknown IDs are rejected. |
| Star score follows measured ticks, reference pieces and rejects | PASS in unit tests | `level-reference.test.ts` checks all reference fixtures earn three stars and covers rating boundaries/rejections. |
| Browser flow L01→L02→L03 | NOT_RUN | E2E is authored and discovered; worker spawn fails with `EPERM`. |
| Contextual tutorial, result and next/replay controls are visually usable | NOT_RUN | UI is implemented but browser inspection is outstanding. |
| G09 | PARTIAL | Engine/scoring/progression evidence passes; required browser E2E and visual evidence are unavailable. |

## 5. Problems, questions and risks

- **F09-001 — BLOCKER for G09 — Browser E2E cannot start in this environment.** Reproduce with `npm run test:e2e -- --reporter=list`; Playwright fails while creating its worker (`spawn EPERM`). Run the journey and capture the requested browser evidence in an environment that permits child processes.
- **F09-002 — MEDIUM — UI paths are not visually verified.** Level selection, locked states, result stars, replay and next need a real-browser check at the target viewport.
- **F09-003 — LOW — Production bundle advisory persists.** Build output is 588.01 kB minified; code splitting can be considered during hardening.
- Progress is in memory and resets after reload. Persistent progression belongs to the later storage phase.

## 6. Documentation changes

- Updated SPEC-004 to reflect implemented level/reference/progression/scoring work while keeping verification partial.
- Added measured fixture evidence to the level catalog, linked test paths in the test plan/traceability, and recorded G09 limitations in the backlog.
- Three.js already existed in both manifest and installed modules; no dependency change was needed.

## 7. Gate decision

**G09: PARTIAL.** L01-L03 fixtures, progression and measured scoring pass the executed checks, and the production build succeeds. The required browser journey and manual visual verification remain unexecuted because Playwright cannot spawn its worker (`spawn EPERM`). Do not mark G09 PASS or treat Phase 10 as verified until the browser journey is run in an environment that permits it.
