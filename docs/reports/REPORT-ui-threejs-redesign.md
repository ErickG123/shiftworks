# REPORT-ui-threejs-redesign — Three.js Audit & Game-First UI/UX Redesign

> Date: 2026-11-18  
> Scope: Three.js lifecycle hardening, UTF-8 encoding fix, and game-first layout redesign.

## 1. Summary of Changes

1. **Baseline Audit**: Created [AUDIT-ui-threejs-baseline.md](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/docs/audits/AUDIT-ui-threejs-baseline.md) documenting genuine `WebGLRenderer`, `OrthographicCamera`, `ResizeObserver`, `Raycaster`, and pre-existing E2E failures.
2. **Three.js Hardening** (`src/game/rendering/scene-manager.ts`):
   - Added `webglcontextlost` and `webglcontextrestored` handlers on `canvas`, properly removed in `dispose()`.
   - Added `visibilitychange` handler on `document` to pause/resume the `requestAnimationFrame` loop when the tab is hidden/visible, properly removed in `dispose()`.
   - Added `fitBoard()` (bound to `#zoom-reset`) to reset camera position/lookAt and zoom.
   - Added `getRenderStats()` exposing `renderer.info.render` (`calls`, `triangles`), `renderer.info.memory` (`geometries`, `textures`), `zoom`, and `selectedCell`.
3. **Game-First UI/UX & UTF-8 Fix** (`index.html`, `src/styles/main.css`):
   - Fixed UTF-8 mojibake (`Checking…`, `8 × 8 factory board`, `A · front`, `B · right`).
   - Replaced the vertically-stacked dashboard layout (which pushed the 3D canvas below ~535px) with a `100vh` CSS Grid shell (`overflow: hidden`):
     - Compact header (`.game-header`) with brand, Campaign/Sandbox mode, level selector, audio controls, and runtime status badges.
     - Left tool rail (`.left-rail`) with SVG-icon tool buttons (`Select`, `Conveyor`, `Processor`, `Diverter`, `Remove`, `Rotate`, `Cancel`) and direction selector.
     - Dominant central 3D viewport (`.viewport-center` + `.scene-frame` with `flex: 1; min-height: 0`).
     - Right contextual inspector (`.right-inspector`) for Objective, Inventory, Processor/Diverter rules, Result panel, and Status/Ports.
     - Compact bottom simulation bar (`.bottom-bar`) for Start/Pause/Resume/Edit/Reset, tick counter, metrics, and status message.

## 2. Validation Results

| Check | Command | Result | Notes |
|---|---|---|---|
| ESLint | `npm run lint` | PASS | Exit code 0 |
| Typecheck | `npm run typecheck` | PASS | `tsc --noEmit`, exit code 0 |
| Unit/Integration | `npm test` | PASS | 21 files, 86 tests passed |
| Production Build | `npm run build` | PASS | `dist/assets/index-C3cbtJ1V.js` (607.51 kB) |
| E2E (Playwright) | `npm run test:e2e` | 5/7 PASS | `responsive-ux` (1280x720, 1920x1080), `keyboard-ux` (2), `visual-audio` passed. Pre-existing failures: `l03-victory.spec.ts` (now hits cell `0, 4` instead of `none`, projection offset in test helper) and `sandbox.spec.ts` (`#storage-status` text). |

## 3. Remaining Risks & Next Steps

- `e2e/l03-victory.spec.ts` uses a hardcoded `clickGridCell` projection formula (`bounds.height / 10.8`) that should be updated or calibrated to the new full-height viewport.
- `e2e/sandbox.spec.ts` expects `#storage-status` to contain `'session'` when `localStorage` is blocked.
