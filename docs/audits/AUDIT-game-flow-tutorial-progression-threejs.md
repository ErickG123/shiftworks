# AUDIT-game-flow-tutorial-progression-threejs

> Date: 2026-11-18  
> Scope: Full playable flow, tool availability (L01 Processor UX), Main Menu, Level Select, Progression, Tutorial (T00/T01), and Three.js validation.

## 1. Baseline Status
- **Lint / Typecheck / Unit / Build**: PASS (`21` test files, `86` tests).
- **E2E (Playwright)**: `5/7` PASS (`responsive-ux`, `keyboard-ux`, `visual-audio`). Pre-existing failures in `e2e/l03-victory.spec.ts` (hardcoded `clickGridCell` projection) and `e2e/sandbox.spec.ts` (`#storage-status` text).

## 2. Root-Cause Findings
1. **L01 Processor UX (Phase A)**: `LEVEL_CATALOG` intentionally sets `PROCESSOR: 0` and `DIVERTER: 0` for L01 (`First Line`), because L01 teaches conveyors only. However, `#editor-toolbar` leaves `[data-tool="PROCESSOR"]` and `[data-tool="DIVERTER"]` enabled and clickable, showing `Preview blocked: No pieces of this type remain.` instead of disabling unavailable tools with a clear reason (`Not available in this level` vs `No pieces remaining`).
2. **Navigation & Screens (Phase B)**: `index.html` boots directly into the editor. There is no `MAIN_MENU`, `LEVEL_SELECT` (with `LOCKED` / `UNLOCKED` / `COMPLETED` states), `TUTORIAL_SELECT`, or `PAUSE_MENU`.
3. **Progression & Persistence (Phase C)**: `level-progression.model.ts` has pure functions (`isLevelUnlocked`, `completeLevel`, `nextUnlockedLevelId`), and `storage-adapter.ts` persists `completedLevelIds`, but there is no `LEVEL_SELECT` UI enforcing locks, no `bestResultsByLevel` comparator, and no `tutorialCompletedIds` tracking.
4. **Playable Tutorial (Phase D)**: No `T00` (Basic Controls) or `T01` (First Delivery) guided step engine observing real editor/simulation events.
5. **Three.js (Phase G)**: `SceneManager` uses genuine `WebGLRenderer`, `OrthographicCamera`, `ResizeObserver`, `Raycaster`, `dispose()`, `webglcontextlost`/`restored`, and `visibilitychange`.

## 3. Implementation Plan
1. **Phase A (Tool Availability)**: Add `getToolAvailability` pure helper differentiating `Not available in this level`, `No pieces remaining`, and `Finish or exit the current run to edit`; disable unavailable tool buttons in `#editor-toolbar` with accessible descriptions and inventory counts; auto-cancel active tool if context changes.
2. **Phase B & C (Navigation, Level Select & Progression)**: Add a non-destructive screen overlay/router (`MAIN_MENU`, `LEVEL_SELECT`, `GAMEPLAY`, `PAUSE_MENU`) on top of the shared `SceneManager` (no duplicate WebGLRenderer/canvas); enforce `L01` unlocked, `L02`/`L03` locked until previous level completed; add `bestResultsByLevel` and `tutorialCompletedIds` to persistence.
3. **Phase D (Tutorial T00/T01)**: Add event-driven tutorial banner/step tracker for `T00` (Basic Controls) and `T01` (First Delivery) with `Skip` option, non-blocking overlay (`pointer-events: none` on backdrop), and real completion tracking.
4. **Verification**: Add unit tests for `getToolAvailability`, `level-progression`, and `tutorial`; run `lint`, `typecheck`, `vitest`, `build`, and `playwright`.
