# ADR-0011 — Redesign da Tela de Jogo e Catálogo de Máquinas e Minérios

- **Status:** Aprovado e implementado
- **Data:** 2026-11-18

## Contexto

Com a expansão para 20 fases, 8 máquinas e 11 itens/minérios, o HUD da tela de jogo acumulava cartões empilhados no painel direito, badges de runtime na barra superior e texto fixo de atalhos no viewport 3D. Além disso, faltava uma tela de Catálogo integrada ao progresso real da campanha.

## Decisão

1. **Redesign da Tela de Jogo (`index.html`, `src/styles/main.css`, `navigation-controller.ts`):**
   - Barra superior compacta: badges técnicos de runtime movidos para `.visually-hidden` (preservando contratos acessíveis/testes sem poluição visual).
   - Barra esquerda agrupada por função (`Seleção`, `Construção`, `Edição`).
   - Viewport 3D com dica de controles recolhível (`<details class="controls-hint-popover">`) e botão `#toggle-inspector-btn` que recolhe/expande o painel direito disparando `resize` no Three.js sem interromper a simulação.
   - Painel contextual direito reorganizado em 4 abas (`Objetivo`, `Seleção`, `Diagnóstico`, `Recursos`), com troca automática para `Seleção` quando painéis de regra (`PROCESSOR`/`DIVERTER`) são abertos.
2. **Menu Principal:**
   - Ações ordenadas: Continuar campanha, Selecionar fase, Tutorial, Sandbox, **Catálogo**, Configurações.
3. **Catálogo de Máquinas e Minérios (`catalog.model.ts`, `catalog-screen.html`, `storage-adapter.ts`):**
   - Fonte de verdade pura derivada de `ALL_EDITABLE_TYPES`, `ALL_RESOURCE_TYPES`, `LEVEL_CATALOG`, `PROCESSOR_RECIPES` e `ASSEMBLER_RECIPES`.
   - Estados reais `LOCKED` (mistério sem vazar detalhes, mostrando apenas fase de desbloqueio), `UNLOCKED` e `DISCOVERED`.
   - Busca por nome, filtro por status e ordenação (`Ordem da campanha`, `Nome`, `Progresso`).
   - Persistência retrocompatível de `collectedItemsByType` em `GameData` (versão `1`, sem conceder desbloqueios automáticos em migração), atualizada apenas na conclusão real de fases (`RESULT`).
   - Preview 3D conectado ao `EquipmentPreviewCard` real para `CONVEYOR`, `PROCESSOR` e `DIVERTER`; demais máquinas e minérios exibem swatch/cor canônica e metadados reais.
