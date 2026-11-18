# SCREEN-NAVIGATION-LIFECYCLE

> Data: 2026-11-18  
> Escopo: Ciclo de vida de navegação (`NavigationController`) e do Diorama Three.js (`MenuDiorama`).

## 1. Contrato de Navegação
- `ScreenState = 'MAIN_MENU' | 'LEVEL_SELECT' | 'GAMEPLAY'` em [navigation-controller.ts](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/src/game/ui/navigation-controller.ts).
- `app.dataset.screen` controla a visibilidade estrutural do DOM: quando `screen !== 'GAMEPLAY'`, todas as barras do editor são ocultadas e `ResizeObserver` redimensiona o `WebGLRenderer` compartilhado sem recriar contextos WebGL.

## 2. Ciclo de Vida do Diorama 3D (`MenuDiorama`)
- Implementado em [menu-diorama.ts](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/src/game/rendering/menu-diorama.ts).
- **`start()`**:
  - Idempotente (`if (this.active) return`).
  - Oculta os grupos `editor-components` e `simulation-items` na `Scene` compartilhada.
  - Instancia `ComponentView` e `ItemView` dedicados ao layout de demonstração (`L03_REFERENCE_COMPONENTS`) e inicia um timer isolado (`260 ms`) que avança um estado de simulação local em loop contínuo (sem tocar em `localStorage`, áudio ou progresso da campanha).
- **`stop()` / `dispose()`**:
  - Cancela o timer (`clearInterval`), chama `dispose()` nas views de componentes e itens do diorama (liberando geometrias e materiais), e restaura `visible = true` nos grupos de gameplay.
  - Enquanto `menuDiorama.isActive()` é `true`, `main.ts` bloqueia eventos de hover/click do editor (`onCellHover`/`onCellClick`) e encaminha `onFrame` para `menuDiorama.animate(time)`.
