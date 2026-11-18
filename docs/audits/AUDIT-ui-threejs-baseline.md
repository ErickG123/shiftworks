# AUDIT-ui-threejs-baseline — Three.js & UI/UX Baseline Audit

> Date: 2026-11-18  
> Scope: SHIFTWORKS (`Vite 8.3.8` + `TypeScript 5.9.3` + `Three.js ^0.187.0` + `Vitest 5.1.1` + `Playwright 1.65.1`)  
> Purpose: Baseline audit before Three.js hardening and game-first UI/UX redesign.

## 1. Baseline Validation Results

| Check | Command | Result | Notes |
|---|---|---|---|
| ESLint | `npm run lint` | PASS | Exit code 0 |
| Typecheck | `npm run typecheck` | PASS | `tsc --noEmit`, exit code 0 |
| Unit/Integration | `npm test` | PASS | 21 test files, 86 tests passed |
| Production Build | `npm run build` | PASS | `dist/assets/index-BBVi75bM.js` (606.54 kB) |
| E2E (Playwright) | `npm run test:e2e` | PARTIAL (5/7) | 5 passed; 2 failed (`e2e/l03-victory.spec.ts`, `e2e/sandbox.spec.ts`) |

### Pre-existing E2E Failures
1. `e2e/l03-victory.spec.ts:17`: `clickGridCell` failed (`#selected-cell` remained `Selected cell: none` after clicking projected canvas coordinates).
2. `e2e/sandbox.spec.ts:3`: `#storage-status` did not contain `'session'` when `localStorage` was blocked.

## 2. Three.js Audit Checklist

| Item | Status | Evidence & Notes |
|---|---|---|
| Genuine `WebGLRenderer` & `canvas` | CONFIRMADO | `src/game/rendering/scene-manager.ts:82` creates `new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false })` with `SRGBColorSpace` and `PCFSoftShadowMap`. No 2D/CSS fake scene. |
| `Scene` & `OrthographicCamera` | CONFIRMADO | `src/game/rendering/scene-manager.ts:35-36, 89-90` uses `Scene` and `OrthographicCamera(-6, 6, 6, -6, 0.1, 100)` at `(10, 13, 10)` looking at `(0, 0, 0)`. |
| Scene graph inventory | CONFIRMADO | `GridView` (`src/game/rendering/grid-view.ts`) manages floor, grid lines, cells, `ComponentView` meshes (Source, Conveyor, Processor, Diverter, Output), `ItemView` meshes, and selection/ghost highlights. |
| Resize & Orthographic Frustum | CONFIRMADO | `src/game/rendering/scene-manager.ts:137-148, 228-236` uses `ResizeObserver`, `renderer.setSize(width, height, false)`, and `orthographicFrustum(BASE_FRUSTUM_HEIGHT, this.zoom, aspect)` + `camera.updateProjectionMatrix()`. |
| Raycasting / Picking | CONFIRMADO | `src/game/rendering/scene-manager.ts:196-214` normalizes pointer against `this.canvas.getBoundingClientRect()` and intersects `this.gridView.pickTargets`. |
| Simulation decoupling | CONFIRMADO | `SimulationController` and `SimulationEngine` run deterministic ticks independent of `requestAnimationFrame` FPS. |
| Frame loop & teardown | PARCIAL | `SceneManager.start()/stop()/dispose()` (`scene-manager.ts:110-167`) manages a single `requestAnimationFrame` loop and `disposeSceneResources(this.scene)`. Missing: `webglcontextlost`/`webglcontextrestored` handlers and `visibilitychange` pause/resume. |
| Camera Pan / Fit Board | PARCIAL | Zoom (`wheel`, `+`, `-`, `100%`) is implemented, but there is no pan or explicit "Fit board" reset when panned. |
| Debug Metrics | NÃO VERIFICADO / AUSENTE | No optional debug overlay exposing `renderer.info` (`calls`, `triangles`, `geometries`, `textures`), FPS, or camera/tick state. |
| WebGL Fallback | PARCIAL | `src/status.ts:15-33` updates `#webgl-status` (`Available`/`Unavailable`), but `Available` is displayed in the main header even before verifying rendered frames, and `#factory-canvas` fallback text is hidden inside `<canvas>`. |

## 3. UI/UX & Encoding Audit

1. **Viewport & Layout (P0)**: `index.html` and `src/styles/main.css` stack `.intro` (huge `h1` + `.status-card`), `.viewport-toolbar`, `.editor-panel` (`.sandbox-controls`, `.editor-toolbar`, `.editor-info` with Inventory/Ports/Lesson/Rules, `.simulation-controls`) *above* `.scene-frame`. At 1417x791 or 1280x720, the 3D canvas is pushed below ~535px and cut off, requiring vertical scrolling.
2. **UTF-8 / Mojibake Encoding (P0)**: `index.html` contains `Checkingâ€¦` (line 26), `8 Ã— 8 factory board` (line 41), and `A Â· front` / `B Â· right` (lines 96, 98).
3. **Visual Hierarchy (P1)**: Game lacks a game-first layout (compact header, left tool rail, dominant central 3D viewport, right contextual inspector, bottom simulation bar).
4. **3D Contrast & Readability (P1)**: Dark navy background (`#111827`) with low-contrast board planes; component silhouettes and directional cues can be sharpened for miniature automation factory readability.

## 4. Priorities

- **P0**: Fix UTF-8 mojibake in `index.html`; refactor shell layout to game-first CSS Grid (`100vh`, `overflow: hidden` on shell, central dominant `.scene-frame`, zero vertical scroll at 1280x720 and 1920x1080); add `webglcontextlost`/`webglcontextrestored` and WebGL fallback overlay; add `Fit board` camera reset.
- **P1**: Compact header, left tool rail with SVG icons & shortcuts, right contextual inspector (empty = objective/hint, selected = component details/rules), bottom simulation bar; optional debug metrics toggle (`?debug=1` or debug button); improve 3D lighting/contrast.
- **P2**: Investigate and fix pre-existing E2E failures (`l03-victory.spec.ts` and `sandbox.spec.ts`) if caused by layout/storage, and update SDD docs (`SPEC-ui-threejs-editor.md`, ADR, `REPORT-ui-threejs-redesign.md`).
