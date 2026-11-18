# AUDIT-SHIFTWORKS-ARCHITECTURE-BASELINE

> Date: 2026-11-18  
> Scope: Structural audit, dependency boundaries, and reproducible baseline.

## 1. Reproducible Baseline
| Check | Command | Result |
|---|---|---|
| ESLint | `npm run lint` | PASS |
| Typecheck | `npm run typecheck` | PASS (`tsc --noEmit`) |
| Unit/Integration | `npm test` | PASS (23 files, 96 tests) |
| Production Build | `npm run build` | PASS (`dist/assets/index-D28RsHFv.js` 622.71 kB) |
| E2E (Playwright) | `npm run test:e2e` | PASS (7/7 tests) |

## 2. Module & Dependency Inventory
- `src/game/domain/*.model.ts`: Pure types and invariants (`grid`, `component`, `ports`, `editor`, `simulation`, `level-catalog`, `level-progression`, `level-scoring`, `layout-validator`). Zero Three.js/DOM/storage imports.
- `src/game/simulation/`: Deterministic tick engine (`simulation-engine.ts`, `transfer-resolver.ts`, `event-sequencer.ts`, `simulation-controller.ts`).
- `src/game/rendering/`: Three.js isolation (`scene-manager.ts`, `grid-view.ts`, `component-view.ts`, `item-view.ts`, `zoom.ts`, `interpolation.ts`, `item-projection.ts`).
- `src/game/editor/`: `editor-reducer.ts` (pure), `tool-availability.ts` (pure), `editor-controller.ts` (DOM binding).
- `src/game/ui/`: `navigation-controller.ts` (Main Menu, Level Select, Tutorial T00, i18n DOM sync).
- `src/i18n/`: `i18n.model.ts`, `i18n.service.ts`, `formatters.ts`, `locales/{pt-BR,en}.ts`.
- `src/game/persistence/`: `storage-adapter.ts` (`shiftworks.game-state.v1` with in-memory fallback).

## 3. Problem Matrix
| ID | Evidence | Symptom | Severity | Minimal Fix | State |
|---|---|---|---|---|---|
| ARCH-01 | `src/game/ui/navigation-controller.ts` | `i18n.subscribe()` not unsubscribed on `dispose()` | P2 | Store unsubscribe callback and expose `dispose()` called in `main.ts` `pagehide` | Planned |
| ARCH-02 | `npm run build` output | Single 622.71 kB JS chunk (>500 kB Vite warning) | P2 | Documented; optional `manualChunks` for `three` if needed | Open |
