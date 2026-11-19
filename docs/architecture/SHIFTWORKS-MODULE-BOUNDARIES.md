# SHIFTWORKS-MODULE-BOUNDARIES

## Direção de Dependências (Regra Vinculante)

- `src/game/domain/*`: **100% puro** — nunca importa DOM, Three.js, `window`, `localStorage`, CSS ou controllers.
- `src/game/simulation/simulation-engine.ts`: depende apenas de `src/game/domain/*`; nunca depende de FPS, `requestAnimationFrame` ou Three.js.
- `src/game/rendering/*`: observa estado/snapshots e gerencia recursos Three.js com `dispose()` explícito; nunca altera regras de domínio ou vitória.
- `src/game/persistence/*`: valida, versiona (`version: 1`) e serializa `GameData` com fallback em memória quando `localStorage` está bloqueado.
- `src/game/ui/*`: views e controllers de navegação (`navigation-controller.ts`, `catalog-view.ts`, `inspector-panel.ts`), sempre usando `src/i18n/` e `dispose()` limpo.
