# AUDIT-shiftworks-global-ui-baseline

> Date: 2026-11-18  
> Scope: Global UI, Main Menu, Level Select, Settings, Gameplay HUD, Pause, Result, Sandbox.

## 1. Baseline
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS (23 files, 96 tests)
- `npm run build`: PASS
- `npm run test:e2e`: PASS (7/7 tests)

## 2. Visual & UX Findings
1. **Main Menu**: Currently renders a centered `.menu-card` over a blurred backdrop. Replacing it with an asymmetric desktop-first game menu (brand + navigation on the left, live 3D factory backdrop visible on the right/background) gives immediate miniature-factory game identity without duplicating `WebGLRenderer`.
2. **Design Tokens**: `src/styles/main.css` uses raw hex colors (`#0b1120`, `#0f172a`, `#1e293b`, `#2563eb`). Consolidating semantic CSS custom properties (`--bg-canvas`, `--bg-surface`, `--bg-elevated`, `--border-subtle`, `--text-primary`, `--text-muted`, `--accent-primary`, `--accent-positive`, `--accent-warning`, `--accent-danger`) will unify Menu, Level Select, HUD, Inspector, and Result.
3. **Settings Modal**: Audio toggle and volume are in the header, and language is in the header/menu. Adding a dedicated Settings modal (accessible from Main Menu and Gameplay) unifies language (`pt-BR` / `en`), audio, and keyboard help with `Escape` close.
