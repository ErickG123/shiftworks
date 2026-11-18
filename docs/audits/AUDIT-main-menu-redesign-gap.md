# AUDIT-main-menu-redesign-gap — Auditoria de Gaps do Redesign, Navegação por Telas, Menu 3D e i18n

> Data: 2026-11-18  
> Escopo: Diagnóstico técnico e visual do redesign anterior (Main Menu sobreposto ao gameplay, ausência de cena 3D demonstrativa animada no menu e strings hardcoded em inglês no modo `pt-BR`).

## 1. Respostas da Investigação (Etapa 0)

1. **Qual implementação responde pela abertura do menu?**
   - `NavigationController` (`src/game/ui/navigation-controller.ts:24-41, 163-194`) cria `<div id="game-screen-overlay" class="screen-overlay">` anexado a `#app`.
2. **Quando o jogo inicia, o gameplay é montado imediatamente e recebe uma camada escura?**
   - **Sim (Causa Raiz #1)**. Em `src/main.ts:13-23` e `index.html:15-268`, toda a estrutura de gameplay (`.game-header`, `.left-rail`, `.viewport-toolbar`, `.right-inspector`, `.bottom-bar`) permanece visível no DOM enquanto `.screen-overlay` aplica um gradiente semitransparente (`src/styles/main.css:533`) por cima. Por isso o tabuleiro vazio, a toolbar, o inspetor e o rodapé aparecem escurecidos ao fundo.
3. **O menu possui uma cena Three.js demonstrativa própria em funcionamento?**
   - **Não (Causa Raiz #2)**. O canvas `#factory-canvas` continuava exibindo apenas o estado inicial vazio da `L01` montado pelo `EditorController` (apenas `Source` e `Output` estáticos, sem esteiras, sem `Processor` alternando `CUT ↔ PRESS`, sem `Diverter` e sem itens em movimento).
4. **Como são montadas e desmontadas as telas de Menu, Seleção de Fases e Gameplay?**
   - Todas usavam o mesmo `#game-screen-overlay` sobre o HUD de gameplay, sem ocultar `.game-header`, `.left-rail`, `.viewport-toolbar`, `.right-inspector` e `.bottom-bar` quando `screen !== 'GAMEPLAY'`.
5. **Onde os textos em inglês ainda estão hardcoded (Causa Raiz #3)?**
   - `src/game/editor/editor-controller.ts`:
     - `messages` (linhas 17–23): erros de construção em inglês.
     - `refreshLevelOptions()` e `selectLevel()` (linhas 195–196, 286, 294): `level.tutorial`, `level.lesson`, `(locked)`.
     - `refresh()` (linhas 386, 393, 413–414): `'Unlimited'`, `'Ports face adjacent cells...'`, `'Preview valid at...'`.
     - `persistPreferences()` (linha 272): `'Progress and preferences saved...'`.
     - `onClick()` / `setMode()` (linhas 161, 170, 175, 343): feedback do editor em inglês.
   - `src/game/editor/tool-availability.ts` (linhas 25, 42, 51): `'Finish or exit the current run to edit'`, `'Not available in this level'`, `'No pieces remaining'`.
   - `src/game/simulation/simulation-controller.ts` (linhas 117–298, 315–320, 348, 378–385): `'Processor: Idle'`, `'Machines: Idle'`, `'Ticks: 0 · Delivered: 0...'`, `'Start the factory...'`, `'Sound off'` / `'Sound on'`.
   - `src/game/rendering/scene-manager.ts` (linhas 248–250): `'Selected cell: none'` / `'Selected cell: x, y'`.
   - `index.html`: textos iniciais de `#editor-feedback`, `#connections`, `#machine-status`, `#goal-status`, `#simulation-metrics`, `#simulation-message`, `#storage-status`, labels de direção e opções do Sandbox.

## 2. Matriz de Requisitos e Gaps

| Requisito | Evidência (Arquivo / Linha) | Estado Atual | Impacto | Correção Planejada | Teste de Validação |
|---|---|---|---|---|---|
| Menu principal como tela própria (sem HUD/editor ao fundo) | `src/game/ui/navigation-controller.ts:163`, `src/styles/main.css:526` | **Regressão / Parcial** | HUD, toolbar, inspetor e rodapé aparecem escurecidos atrás do card do menu | Controlar `app.dataset.screen`: ocultar `.game-header`, `.left-rail`, `.viewport-toolbar`, `.right-inspector` e `.bottom-bar` quando `screen !== 'GAMEPLAY'`, dedicando 100% do viewport ao Menu + Diorama 3D | Unit + Playwright E2E (`toBeHidden()` no HUD durante `MAIN_MENU` e `LEVEL_SELECT`) |
| Fábrica Three.js demonstrativa animada no Menu Principal | `src/main.ts:13-23`, `src/game/ui/navigation-controller.ts` | **Não implementado** | Fundo do menu mostra apenas o tabuleiro vazio da L01 | Criar `MenuDioramaController` que renderiza no `SceneManager` compartilhado uma linha completa animada (Source → Processor SHIFT → Esteiras → Diverter → Outputs A/B + itens em movimento) apenas durante `MAIN_MENU`, limpando ao sair | Unit (`MenuDioramaController` lifecycle) + Playwright E2E |
| Seleção de Fases como tela dedicada | `src/game/ui/navigation-controller.ts:196`, `src/game/ui/level-select.html` | **Parcial** | Renderizada como modal sobre o HUD | Tela full-viewport dedicada (`app[data-screen="LEVEL_SELECT"]`), sem HUD de gameplay ao fundo, com pré-requisitos traduzidos e separação clara | Playwright E2E |
| Hierarquia do botão Continuar Campanha | `src/game/ui/main-menu.html:6`, `navigation-controller.ts:183` | **Parcial** | `Continuar Campanha` sempre aparece como primário mesmo sem progresso salvo | Exibir/destacar `Continuar Campanha` conforme progresso real; permitir acesso direto e claro a `Jogar Campanha`, `Tutorial` e `Sandbox` | Unit + Playwright E2E |
| i18n 100% PT-BR / EN (zero inglês hardcoded em PT-BR) | `editor-controller.ts`, `simulation-controller.ts`, `scene-manager.ts`, `tool-availability.ts`, `index.html` | **Parcial** | Strings de objetivo, status, portas, células, feedback e métricas aparecem em inglês mesmo com `pt-BR` ativo | Expandir catálogos `pt-BR.ts` e `en.ts` para 100% das strings dinâmicas e estáticas e re-renderizar textos ao trocar idioma | Vitest (`i18n.service.test.ts`) + Playwright E2E |
