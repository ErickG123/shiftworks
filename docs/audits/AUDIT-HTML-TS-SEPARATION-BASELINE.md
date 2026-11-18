# AUDIT-HTML-TS-SEPARATION-BASELINE

> Date: 2026-11-18  
> Scope: Audit of HTML markup, `innerHTML`, and DOM creation inside TypeScript files.

## 1. Baseline Validation
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS (23 files, 96 tests)
- `npm run build`: PASS
- `npm run test:e2e`: PASS (7/7 tests)

## 2. Inventory of HTML in TypeScript
| File | Line | Pattern | Classification | Action |
|---|---|---|---|---|
| `src/game/ui/navigation-controller.ts` | 167 | `this.overlay.innerHTML` (Main Menu) | Static/semi-static template | Extract to `main-menu.html` (`?raw`) + `textContent` |
| `src/game/ui/navigation-controller.ts` | 228 | `this.overlay.innerHTML` (Level Select) | Static shell + dynamic cards | Extract shell to `level-select.html` (`?raw`) + `createElement`/`textContent` |
| `src/game/ui/navigation-controller.ts` | 145 | `this.tutorialBanner.innerHTML` | Static/semi-static template | Extract to `tutorial-banner.html` (`?raw`) + `textContent` |
| `src/game/ui/navigation-controller.ts` | 62 | `langSelect.innerHTML` | Programmatic options | Replace with `new Option(...)` |
| `src/game/editor/editor-controller.ts` | 283 | `this.levelSelect.innerHTML` | Dynamic `<option>` list | Replace with `replaceChildren` + `new Option(...)` |
| `src/game/editor/editor-controller.ts` | 374 | `this.inventory.innerHTML` | Dynamic `<li>` list | Replace with `replaceChildren` + `createElement` + `textContent` |
