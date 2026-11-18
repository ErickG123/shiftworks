# REFACTOR-PLAN-TS-MODULES

> Date: 2026-11-18  
> Strategy: Preserve existing `*.model.ts` boundaries, avoid unnecessary file churn, and codify conventions in `.agents/rules/typescript-ui-conventions.md` and `docs/architecture/`.

## Batches
1. **Batch A**: Add `.agents/rules/typescript-ui-conventions.md` with TypeScript, HTML `?raw`, i18n (`pt-BR` default + `en`), and Three.js boundary rules.
2. **Batch B**: Document `docs/architecture/TYPESCRIPT-FILE-CONVENTIONS.md`, `docs/architecture/AGENT-GOVERNANCE.md`, and `docs/reports/REPORT-SHIFTWORKS-TS-AND-AGENTS-REFACTOR.md`.
3. **Batch C**: Run `lint`, `typecheck`, `vitest`, and `build` to confirm zero regressions.
