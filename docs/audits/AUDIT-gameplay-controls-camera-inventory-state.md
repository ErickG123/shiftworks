# AUDIT — Gameplay Controls, Camera Navigation, Inventory, State Flow & Victory UX

> **Data:** 2026-11-18  
> **Escopo:** Auditoria causal completa do código real (`src/`, `index.html`, `e2e/`) para os 7 problemas reportados em controles (`R`), câmera (`WASD`/`Q/E`), estados (`EDITING`/`RUNNING`/`PAUSED`/`RESULT`), balanceamento da Fase L02, tela de vitória, HUD/3D e localização PT-BR/EN.

---

## 1. Baseline Capturada Antes das Alterações

| Verificação | Comando | Resultado Baseline |
|---|---|---|
| ESLint | `npm run lint` | PASS (`exit code 0`) |
| TypeScript | `npm run typecheck` | PASS (`exit code 0`) |
| Vitest (Unit) | `npm test` | PASS (`24` arquivos, `97` testes) |
| Reference Fixtures | `npm run test:fixtures` | PASS (`L01: 30 ticks`, `L02: 65 ticks / 1 peça`, `L03: 70 ticks`) |
| Build Produção | `npm run build` | PASS (`50` módulos) |
| Playwright E2E | `npm run test:e2e` | PASS (`7/7` testes anteriores; faltavam casos para `R` em ghost, `WASD`/`Q/E`, `PAUSED -> EDITING`, L02 com esteiras e `1024×768`/`1600×900`) |

---

## 2. Diagnóstico Causal por Problema (Código Real Auditado)

### Problema 1 — A tecla `R` não rotacionava a esteira/prévia como esperado no tutorial T00
- **Caminhos de código auditados:**
  - `src/game/editor/editor-controller.ts` (linhas 71–75, 163–178, 318–328, 428–429)
  - `src/game/interaction/keyboard-shortcuts.ts` (linhas 1–6)
  - `src/game/ui/navigation-controller.ts` (linhas 176–206)
- **Causas reais comprovadas (4 camadas combinadas):**
  1. **Ausência de rotação de prévia (`ghost`) com `R`:** Em `EditorController.handleKey`, o handler executava `if (event.key.toLowerCase() === 'r' && this.selectedId) { this.rotateSelected(); }`. Quando uma ferramenta de construção (`CONVEYOR`, `PROCESSOR`, `DIVERTER`) estava ativa, `this.selectedId` era `null`. Pressionar `R` não alterava `this.direction` (orientação do ghost) e o botão `[data-action="rotate"]` permanecia `disabled = true`.
  2. **Ausência de seleção ao posicionar peça:** Ao clicar no tabuleiro com a ferramenta `CONVEYOR` ativa (`onClick`), a peça era inserida via `PLACE`, porém `this.selectedId` continuava `null` e `this.tool` permanecia `'CONVEYOR'`. Se o jogador clicasse na esteira recém-colocada para tentar selecioná-la, `onClick` tentava executar outro `PLACE` na célula ocupada e falhava com `CELL_OCCUPIED`.
  3. **Bloqueio de foco em `<button>` da toolbar:** Em `keyboard-shortcuts.ts`, `isGlobalShortcutAllowed` bloqueava qualquer `keydown` cujo `event.target` estivesse dentro de `button`. Como clicar em `[data-tool="CONVEYOR"]` mantinha o foco DOM no botão da toolbar enquanto o jogador movia o mouse sobre o `<canvas>`, pressionar `R` era descartado por `isGlobalShortcutAllowed`.
  4. **Avanço falso do Tutorial T00 por evento DOM bruto:** Em `NavigationController.bindTutorialEvents`, o passo 3 (`rotate-conveyor`) escutava `document.addEventListener('keydown')` diretamente e chamava `this.advanceTutorial()` ao detectar `event.key === 'r'`, mesmo quando `EditorController` ignorava a tecla! Assim, a esteira não girava, mas o banner do tutorial pulava imediatamente para o Passo 4/4 (`Pressione Iniciar`).

### Problema 2 — Navegação de câmera sem controles `WASD` e `Q/E` em 90°
- **Caminhos de código auditados:**
  - `src/game/rendering/scene-manager.ts` (linhas 105–106, 188–192, 277–293)
  - `src/game/rendering/zoom.ts` (linhas 20–48)
- **Causas reais comprovadas:**
  1. A câmera ortográfica era estática em `(10, 13, 10)` olhando para `(0, 0, 0)`, sem `CameraController` para pan relativo à câmera (`W/A/S/D`) ou rotação orbital horizontal em passos de 90° (`Q/E`).
  2. Os botões `#zoom-in` (`+`) e `#zoom-out` (`-`) em `scene-manager.ts` somavam/subtraíam `CAMERA_ZOOM_STEP` diretamente na escala do frustum (`height = baseHeight * zoom`), invertendo o sentido dos botões visuais de zoom em relação à roda do mouse.

### Problema 3 — Ferramentas aparentemente travadas após Iniciar e Pausar
- **Caminhos de código auditados:**
  - `src/game/editor/editor-controller.ts` (linhas 143–171, 191–215)
  - `src/game/simulation/simulation-controller.ts` (linhas 132–180, 375–388)
  - `src/game/ui/navigation-controller.ts` (linhas 134–137)
- **Causas reais comprovadas:**
  1. Ao entrar em `PAUSED`, todos os botões de construção ficavam `disabled` (`opacity: 0.4`) sem banner explicativo no viewport e sem destaque visual no botão `#edit-simulation` (que se chamava apenas `"Editar"` com aparência secundária).
  2. Ao clicar em uma peça no tabuleiro durante `PAUSED`, `EditorController.onClick` exibia a mensagem `'editor.componentSelected'` (`"{type} selecionado. Pressione R ou Rotacionar"`), induzindo o jogador a pressionar `R` quando a edição ainda estava bloqueada.
  3. **Bug crítico de bloqueio persistente na navegação:** Se o jogador iniciasse ou pausasse a simulação (`state.mode = 'RUNNING' | 'PAUSED'`) e navegasse para o Menu Principal ou Seleção de Fases, `NavigationController.setScreen` não encerrava a sessão de simulação nem restaurava `EditorController` para `EDITING`. Como `EditorController.selectLevel` e `selectGameMode` tinham a guarda `if (this.state.mode !== 'EDITING') return false;`, tentar abrir outra fase ou o Sandbox a partir do menu falhava silenciosamente e deixava todas as ferramentas travadas em `PAUSED`/`RUNNING`.

### Problema 4 — Inventário `CONVEYOR: 0` na Fase L02
- **Caminho de código auditado:**
  - `src/game/domain/level-catalog.model.ts` (linhas 27–43)
- **Causa real comprovada:**
  - `L02_BASE` foi definida com `l02Source` em `(0, 3)`, `l02Output` (`dock`) em `(2, 3)` e `inventory: { CONVEYOR: 0, PROCESSOR: 1, DIVERTER: 0 }`. Isso deixava apenas 1 célula `(1, 3)` entre fonte e saída, desabilitava o botão `Esteira` na toolbar com `0` unidades e impedia qualquer liberdade de construção com esteiras.

### Problema 5 — Conclusão confinada a um cartão estreito no painel direito
- **Caminhos de código auditados:**
  - `index.html` (linhas 217–226)
  - `src/styles/main.css` (linhas 390–399)
  - `src/game/simulation/simulation-controller.ts` (linhas 247–254)
- **Causa real comprovada:**
  - `#result-panel` era apenas uma `<section class="inspector-card result-card">` dentro da coluna lateral `.right-inspector` (290px de largura), sem destaque visual de estrelas, sem comparação de recorde e sem ações diretas para Editar fábrica, Selecionar fase ou Menu principal.

### Problema 6 — Hierarquia visual do HUD e legibilidade 3D
- **Caminhos de código auditados:**
  - `src/game/rendering/grid-view.ts`, `src/game/rendering/component-view.ts`, `src/styles/main.css`
- **Causas reais comprovadas:**
  - Tabuleiro com contraste baixo (`#26364a`/`#202f41` sobre `#182334`), ausência de anel 3D para a peça selecionada (`selectedId`), roletes da esteira (`roller`) que não acompanhavam `directionAngle[component.direction]`, e botões de ferramentas estreitos (`88px`) sem contador de estoque visível no botão e sem indicação se `[R]` atua no ghost ou na peça selecionada.

### Problema 7 — Rótulos técnicos em inglês na interface em português
- **Caminhos de código auditados:**
  - `src/game/editor/editor-controller.ts` (linhas 168, 352, 402)
  - `src/game/simulation/simulation-controller.ts` (linhas 202, 268, 274–316, 386)
  - `index.html` (linhas 185–193)
- **Causas reais comprovadas:**
  - `EditorController` exibia `type` bruto (`CONVEYOR`, `PROCESSOR`, `DIVERTER`) na lista `#inventory` e nas mensagens de seleção/posicionamento.
  - `SimulationController` interpolava `goal.itemType` bruto (`BLUE_BLANK`, `CUT_PLATE`, `PRESSED_BLOCK`) em `#goal-status`, tinha `describeEvents` 100% hardcoded em inglês (`Source emitted...`, `Item moved from...`, `Waiting at...`), `Tick ${count}` hardcoded em `updateControls()` e `<option value="CUT">CUT</option>` sem tradução.
