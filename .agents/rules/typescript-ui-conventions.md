# TypeScript, UI Templates & i18n Conventions

- **Domain Models**: Place shared domain interfaces and discriminated unions in `*.model.ts` under `src/game/domain/` (zero Three.js, DOM, or `localStorage` imports).
- **Type-Only Imports**: Use `import type` / `export type` for type-only imports.
- **HTML / TS / CSS Separation**: Store static/semi-static UI templates in `*.html` files imported via Vite `?raw`. Update dynamic content via `textContent`, `dataset`, and `replaceChildren(...)` — never interpolate dynamic data into `innerHTML`.
- **i18n**: `pt-BR` is the mandatory default locale on first launch; `en` is the secondary locale. Every new user-facing string must be added to both `src/i18n/locales/pt-BR.ts` and `src/i18n/locales/en.ts` with parity verified by `src/i18n/i18n.service.test.ts`.
- **Three.js Lifecycle**: Keep a single `WebGLRenderer` and `requestAnimationFrame` loop in `SceneManager`; clean up listeners, observers, and GPU resources in `dispose()`.
