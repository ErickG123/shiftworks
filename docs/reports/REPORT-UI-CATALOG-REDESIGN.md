# REPORT-UI-CATALOG-REDESIGN — Redesign da Tela de Jogo e Catálogo

- **Status:** CONCLUÍDO
- **Data:** 2026-11-18

## 1. Problemas Encontrados na Interface Atual
- Barra superior exibia badges técnicos de runtime (`engine-status`, `webgl-status`) competindo com ações globais.
- Dica longa de atalhos de teclado ocupava espaço fixo na barra do viewport 3D.
- Painel direito empilhava 5+ cartões simultaneamente (objetivo, seleção, regras, diagnóstico, inventário), exigindo rolagem constante e sem opção de recolher o painel.
- Ferramentas da barra esquerda não eram agrupadas visualmente por função.
- Menu principal não possuía acesso a um catálogo de máquinas e minérios/recursos conectado ao progresso real.

## 2. Componentes e Arquivos Alterados
- [catalog.model.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/domain/catalog.model.ts) e [catalog.model.test.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/domain/catalog.model.test.ts)
- [storage-adapter.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/persistence/storage-adapter.ts)
- [editor-controller.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/editor/editor-controller.ts) e [simulation-controller.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/simulation/simulation-controller.ts)
- [main-menu.html](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/ui/main-menu.html), [catalog-screen.html](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/ui/catalog-screen.html), [navigation-controller.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/ui/navigation-controller.ts)
- [index.html](file:///C:/Users/erick/Documentos/Github/shiftworks/index.html), [main.css](file:///C:/Users/erick/Documentos/Github/shiftworks/src/styles/main.css)
- [pt-BR.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/i18n/locales/pt-BR.ts) e [en.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/i18n/locales/en.ts)

## 3. Decisões Visuais e de Interação
- Mantidos todos os IDs, atalhos de teclado (`WASD`, `Q/E`, `R`, `Espaço`, `Esc`) e fluxos de campanha/sandbox/tutorial.
- Painel direito com 4 abas (`Objetivo`, `Seleção`, `Diagnóstico`, `Recursos`) + botão `#toggle-inspector-btn` que recolhe o painel e redimensiona o canvas Three.js sem pausar a simulação.
- Dica de controles em `<details>` recolhível na barra do viewport 3D.

## 4. Funcionamento do Catálogo e Ligação com Progresso
- Derivado diretamente de `LEVEL_CATALOG`, `ALL_EDITABLE_TYPES`, `PROCESSOR_RECIPES` e `ASSEMBLER_RECIPES`.
- Itens bloqueados exibem apresentação de mistério (`Registro confidencial`) + requisito real de fase (`Fase L02`, etc.).
- Entregas concluídas em `RESULT` acumulam `collectedItemsByType` no save (`localStorage` v1, retrocompatível).

## 5. Limitações Reais Registradas
- Preview 3D interativo (`EquipmentPreviewCard`) está disponível para `CONVEYOR`, `PROCESSOR` e `DIVERTER`; os 5 equipamentos novos (`BUFFER`, `SENSOR`, `SPLITTER`, `MERGER`, `ASSEMBLER`) e os 11 recursos utilizam cor/swatch canônica e metadados reais até que mini-cenas 3D dedicadas sejam criadas.
