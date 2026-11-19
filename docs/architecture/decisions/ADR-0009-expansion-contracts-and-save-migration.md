# ADR-0009 — Contratos de Expansão, Histórico Transacional e Preview 3D Isolado

**Status:** ACCEPTED  
**Data:** 2026-11-18

## Contexto

A expansão do SHIFTWORKS (`EXP-02..EXP-23`) introduz construção por arrasto com Undo/Redo, overlay de fluxo, passo a passo por tick (`+1 tick`), catálogo de equipamentos com preview 3D animado, conquistas persistentes, novos setores/desafios, sensores/receitas/buffers/pedidos e blueprints.

## Decisão

1. **Contratos puros em `src/game/domain/expansion-contracts.model.ts`:** `BuildTransaction`, `EditorHistoryState`, `EquipmentCatalogEntry`, `PreviewLifecycleState`, `BottleneckEntry`, `EfficiencySnapshot`, `AchievementId`, `FactoryBlueprint` e `GameDataV2` permanecem 100% livres de Three.js, DOM e `localStorage`.
2. **Transações de Edição Atômicas:** Toda operação de arrasto, colocação, remoção, rotação ou aplicação de blueprint gera um `BuildTransaction` com snapshots `before`/`after` imutáveis de `EditorState`, garantindo `Undo`/`Redo` exato sem perda ou duplicação de inventário.
3. **Preview 3D Isolado:** O card flutuante 3D de equipamento utiliza um canvas/viewport dedicado com `dispose()` explícito ao fechar, sem compartilhar estado com a simulação da campanha.
4. **Compatibilidade de Save:** `GameStorageAdapter` mantém compatibilidade retroativa com `shiftworks.game-state.v1` e adiciona campos opcionais/versionados (`bestResultsByLevel`, `tutorialCompletedIds`, `unlockedAchievements`, `blueprints`) de forma idempotente, sem jamais exigir limpeza do `localStorage`.
