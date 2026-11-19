# ADR-0010 — Conteúdo e Progressão 2.0 (20 Fases, 8 Equipamentos e 11 Itens)

- **Status:** Aprovado e implementado
- **Data:** 2026-11-18
- **Escopo:** `CNT-00`..`CNT-22`

## Contexto

Após a consolidação da vertical slice (`L01–L03`) e da expansão UX (`EXP-00..23`), o SHIFTWORKS precisava escalar para uma campanha completa de 20 fases em 5 setores, 8 equipamentos construíveis, 11 itens e 7 receitas, preservando determinismo puro, compatibilidade retroativa com saves e inventários de 3 chaves (`L01–L03`), além de i18n completo `pt-BR`/`en`.

## Decisão

1. **Domínio extensível sem quebra (`component.model.ts`, `recipes.model.ts`, `ports.model.ts`):**
   - `ItemType` expandido para 11 itens (`BLUE_BLANK`, `AMBER_BLANK`, `CUT_PLATE`, `PRESSED_BLOCK`, `COPPER_BLANK`, `COPPER_STRIP`, `INSULATOR`, `CIRCUIT`, `FRAME`, `CONTROL_MODULE`, `AUTOMATION_UNIT`).
   - `EditableComponentType` expandido para 8 equipamentos (`CONVEYOR`, `PROCESSOR`, `DIVERTER`, `BUFFER`, `SENSOR`, `SPLITTER`, `MERGER`, `ASSEMBLER`), com `ComponentInventory` retrocompatível via `getInventoryCount()`.
   - Receitas canônicas centralizadas em `recipes.model.ts` (`PROCESSOR_RECIPES` + `ASSEMBLER_RECIPES`).
2. **Motor determinístico puro (`simulation-engine.ts`):**
   - `BUFFER` (fila FIFO), `SENSOR` (passagem 1/1), `SPLITTER` (alternância determinística A↔B), `MERGER` (2 entradas → 1 saída), `ASSEMBLER` (2 slots de ingredientes → craft atômico de 3 ticks).
3. **Campanha data-driven (`campaign-levels.model.ts`, `level-catalog.model.ts`):**
   - `L01–L03` preservadas integralmente; `L04–L20` organizadas nos setores `SECTOR-01`..`SECTOR-05`, todas com `referenceComponents` executáveis e validadas em `npm run test:fixtures` com 0 rejeições e 3 estrelas.
4. **UI responsiva e Three.js (`component-view.ts`, `navigation-controller.ts`, `main.css`):**
   - Cores dedicadas por equipamento no `ComponentView`, catálogo `LEVEL_SELECT` com rolagem vertical segura (`align-items: flex-start; overflow-y: auto`) em `1024×768` até `1920×1080`, e traduções `pt-BR`/`en` para todos os 11 itens, 8 equipamentos e 5 setores.

## Consequências

- Todos os 20 níveis são jogáveis e verificados automaticamente por fixtures determinísticas e Vitest.
- Nenhuma quebra em saves existentes (`localStorage`) ou nos contratos de `L01–L03`.
