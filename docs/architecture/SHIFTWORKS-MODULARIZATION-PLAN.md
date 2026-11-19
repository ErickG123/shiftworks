# SHIFTWORKS-MODULARIZATION-PLAN

- **Data:** 2026-11-18
- **Princípio:** Refatoração incremental orientada por evidências; menor alteração segura que reduz acoplamento e elimina vazamentos sem introduzir frameworks ou camadas artificiais.

## Ordem de Execução e Gates

1. **Lote D1 (Imediato — Executado neste ciclo):**
   - Extrair `src/game/ui/inspector-panel.ts` de `navigation-controller.ts` com `dispose()` explícito do `MutationObserver`.
   - Extrair `src/game/ui/catalog-view.ts` de `navigation-controller.ts` para isolar a tela de Catálogo.
   - Gate: `lint` + `typecheck` + `test` + `test:fixtures` + `build` + `test:e2e`.
2. **Lote E1 (Próximo ciclo, opcional pós-release):**
   - Extrair persistência de progresso/preferências de `editor-controller.ts` para um serviço dedicado.
3. **Lote D2 (Próximo ciclo, opcional pós-release):**
   - Extrair `victory-overlay-view.ts` de `simulation-controller.ts`.
