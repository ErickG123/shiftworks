# REFACTOR-PLAN-SHIFTWORKS

> Date: 2026-11-18  
> Strategy: Minimal, safe, evidence-based improvements without big-bang folder moves.

## Incremental Batches
1. **Batch A (Baseline & Lifecycle)**: Add `dispose()` to `NavigationController` (`src/game/ui/navigation-controller.ts`) to unsubscribe from `i18n` on `pagehide` in `src/main.ts`.
2. **Batch B (Verification & SDD)**: Re-run `lint`, `typecheck`, `vitest`, `build`, and write `docs/reports/REPORT-SHIFTWORKS-ARCHITECTURE-REFACTOR.md`.
