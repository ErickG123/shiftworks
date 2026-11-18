# SHIFTWORKS-UI-SCREENS-AND-IDENTITY

> Data: 2026-11-18  
> Escopo: Identidade visual, separação de telas (`MAIN_MENU`, `LEVEL_SELECT`, `GAMEPLAY`) e overlays (`SETTINGS`).

## 1. Separação de Telas (Telas ≠ Overlays sobre Gameplay)
- **`MAIN_MENU` (`app[data-screen="MAIN_MENU"]`)**:
  - Oculta completamente o HUD de gameplay (`.game-header`, `.left-rail`, `.viewport-toolbar`, `.right-inspector`, `.bottom-bar` com `display: none !important`).
  - O viewport 3D (`#factory-canvas`) expande para `100vw × 100vh` exibindo o **Diorama 3D em Tempo Real** (`MenuDiorama`), com a linha `Source → SHIFT Processor (CUT ↔ PRESS) → Esteiras → Diverter (A ↔ B) → Outputs` em operação contínua.
  - À esquerda, `.menu-hero-panel` apresenta a marca `SHIFTWORKS`, subtítulo, ações hierarquizadas (`Continuar Campanha` / `Jogar Campanha`, `Tutorial`, `Modo Sandbox`, `Configurações`), progresso da campanha e seletor de idioma.
- **`LEVEL_SELECT` (`app[data-screen="LEVEL_SELECT"]`)**:
  - Tela full-viewport dedicada (`radial-gradient`), sem HUD de gameplay ao fundo.
  - Cards para `L01`, `L02`, `L03` com estados `DISPONÍVEL`, `CONCLUÍDA` e `BLOQUEADA` + requisito explícito traduzido (`Requisito: Conclua a Fase L01 para liberar.`).
- **`GAMEPLAY` (`app[data-screen="GAMEPLAY"]`)**:
  - Desativa e limpa o `MenuDiorama`, restaura a visibilidade dos grupos `editor-components` e `simulation-items` e exibe o HUD compacto (Header, Left Tool Rail, Central 3D Viewport, Right Contextual Inspector e Bottom Simulation Bar).
- **`SETTINGS` (`#settings-overlay`)**:
  - Modal acessível a partir do Menu Principal (`#menu-settings`) ou do Header de Gameplay (`#open-settings`), com fechamento via botão ou tecla `Escape` e devolução de foco ao botão invocador.
