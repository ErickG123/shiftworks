# AUDIT-SHIFTWORKS-TS-CONTRACTS-AND-AGENTS

> Date: 2026-11-18  
> Scope: TypeScript contracts, types, constants, and `.agents/` governance audit.

## 1. Baseline
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS (23 files, 96 tests)
- `npm run build`: PASS
- `npm run test:e2e`: PASS (7/7 tests)

## 2. TypeScript Contracts & Constants Inventory
- `src/game/domain/*.model.ts`: 11 domain model files with discriminated unions (`Component`, `EditorCommand`, `SimulationEvent`, etc.) and zero `any` or Three.js/DOM imports.
- `src/i18n/i18n.model.ts`: `SupportedLocale`, `DEFAULT_LOCALE = 'pt-BR'`, `I18nService`.
- `src/game/editor/tool-availability.ts`: `EditorTool`, `ToolAvailability` (co-located with pure `getToolAvailability` function).
- `src/game/ui/navigation-controller.ts`: `ScreenState`, `TutorialStep` (co-located with `NavigationController`).

## 3. `.agents/` Inventory
- `.agents/rules/global.md`
- `.agents/rules/rendering-ux.md`
- `.agents/rules/sdd-execution.md`
- `.agents/rules/simulation.md`
- `.agents/skills/phase-execution/SKILL.md`
- `.agents/skills/validate-simulation/SKILL.md`
- **Gap**: No dedicated rule in `.agents/rules/` codifying the `?raw` HTML template convention, `pt-BR` default i18n parity, and `*.model.ts` / `*.types.ts` / `*.constants.ts` boundaries.
