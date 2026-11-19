# REPORT — Correção Integrada do Gameplay, Controles, Câmera, Fases e Resultados

> **Data:** 2026-11-18  
> **Status dos Gates Técnicos Locais:** **PASS** (`lint`, `typecheck`, `111` testes unitários/integrados Vitest, `test:fixtures`, `build` e `11/11` testes E2E Playwright reais em navegador Chromium com capturas em `artifacts/`)  
> **Escopo:** Auditoria causal e correção completa de atalho `R` e Tutorial `T00`, `CameraController` (`WASD` + `Q/E` 90° + zoom/centralizar), máquina de estados (`EDITING` / `RUNNING` / `PAUSED` / `RESULT`), rebalanceamento da Fase `L02`, overlay central de vitória, revisão do HUD/3D e localização 100% `pt-BR` / `en`.

---

## 1. Diagnóstico por Problema (Caminho de Código, Causa Real e Comportamento Reproduzido)

| # | Problema Reportado | Caminho de Código Auditado | Causa Real Comprovada | Comportamento Reproduzido Antes |
|---|---|---|---|---|
| 1 | Tecla `R` não rotacionava a esteira no tutorial `T00` | `src/game/editor/editor-controller.ts` (L71–75, L163–178), `src/game/interaction/keyboard-shortcuts.ts` (L1–6), `src/game/ui/navigation-controller.ts` (L176–206) | 1) `handleKey` exigia `this.selectedId !== null`, ignorando `R` quando uma ferramenta de construção (`CONVEYOR`) estava ativa em modo prévia (`ghost`); 2) `isGlobalShortcutAllowed` bloqueava qualquer tecla quando um `<button>` da toolbar detinha foco; 3) `NavigationController` avançava o Passo 3/4 do `T00` em `keydown` bruto de `R`, mesmo quando nenhuma rotação ocorria. | Ao selecionar `Esteira`, posicionar uma peça e pressionar `R`, a peça/prévia não girava e o tutorial saltava direto para o Passo 4/4 (`Pressione Iniciar`). |
| 2 | Falta de navegação intuitiva de câmera por teclado (`WASD`, `Q/E`) | `src/game/rendering/scene-manager.ts` (L105–106, L277–293), `src/game/rendering/zoom.ts` | Câmera ortográfica fixa em `(10, 13, 10)` sem controlador de pan horizontal ou rotação orbital de 90°; botões `+`/`-` de zoom alteravam a escala do frustum em sentido invertido. | Teclas `W/A/S/D` e `Q/E` não tinham efeito sobre a câmera. |
| 3 | Ferramentas aparentemente travadas ao iniciar e pausar | `src/game/editor/editor-controller.ts` (L143–171, L191–215), `src/game/simulation/simulation-controller.ts`, `src/game/ui/navigation-controller.ts` | Em `PAUSED`, a toolbar ficava desabilitada sem banner explicativo e clicar numa peça exibia `"Pressione R ou Rotacionar"` apesar do bloqueio; sair para o menu durante `PAUSED`/`RUNNING` mantinha `state.mode !== 'EDITING'` e fazia `selectLevel`/`selectGameMode` retornarem `false`, deixando o editor travado. | Após `Iniciar → Pausar`, o jogador não via CTA claro para voltar a editar e ficava bloqueado se trocasse de tela pelo menu. |
| 4 | Fase `L02` com `CONVEYOR: 0` | `src/game/domain/level-catalog.model.ts` (L27–43) | `L02_BASE` posicionava `source-1` em `(0, 3)` e `dock` em `(2, 3)` com `inventory: { CONVEYOR: 0, PROCESSOR: 1, DIVERTER: 0 }`, deixando apenas 1 célula `(1, 3)` e desabilitando a ferramenta `Esteira`. | O botão `Esteira` aparecia com `0` unidades e desabilitado na `L02`, impedindo montar esteiras. |
| 5 | Conclusão exibida apenas em um cartão estreito no painel direito | `index.html` (L217–226), `src/styles/main.css` (L390–399) | `#result-panel` era um pequeno card lateral dentro de `.right-inspector` (`290px`), sem destaque visual de estrelas, sem recorde e apenas com botões `Replay` e `Next level`. | Vitória passava quase despercebida no canto inferior direito do inspetor. |
| 6 | HUD com aparência de ferramenta de desenvolvimento e baixo contraste 3D | `src/game/rendering/grid-view.ts`, `src/game/rendering/component-view.ts`, `src/styles/main.css` | Tabuleiro escuro sem base elevada, sem anel de seleção 3D para a peça selecionada, roletes da esteira sem rotação com a direção da peça, botões estreitos sem badge de estoque e sem indicador de alvo da tecla `[R]`. | Baixa legibilidade de seleção, direção e estoque disponível na toolbar esquerda. |
| 7 | Rótulos técnicos em inglês (`BLUE_BLANK`, `CONVEYOR`, `Tick`, eventos) na UI em `pt-BR` | `src/game/editor/editor-controller.ts` (L168, L352, L402), `src/game/simulation/simulation-controller.ts` (L202, L268, L296–316, L386) | IDs internos eram exibidos diretamente no DOM (`#inventory`, `#goal-status`) e `describeEvents()` retornava frases em inglês hardcoded (`Source emitted...`, `Item moved...`, `Waiting at...`). | Mesmo em `Português (Brasil)`, a UI mostrava `BLUE_BLANK`, `CUT_PLATE`, `CONVEYOR` e logs em inglês. |

---

## 2. Mudanças Concretas por Módulo e Arquivo

- **[src/i18n/locales/pt-BR.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/i18n/locales/pt-BR.ts), [src/i18n/locales/en.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/i18n/locales/en.ts) e [src/i18n/formatters.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/i18n/formatters.ts):**
  - Adicionadas funções puras de formatação de apresentação (`formatItemType`, `formatComponentType`, `formatDirection`, `formatMachineMode`, `formatOutputName`, `formatDiagnosticReason`) e todas as chaves de eventos da simulação, controles de câmera, banner de pausa, modo alvo de `[R]`, tutorial `L02` e overlay de vitória com 100% de paridade `pt-BR`/`en`.
- **[src/game/interaction/keyboard-shortcuts.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/interaction/keyboard-shortcuts.ts) e [keyboard-shortcuts.test.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/interaction/keyboard-shortcuts.test.ts):**
  - Implementado `resolveShortcutAction(event)` mapeando `R` (`ROTATE_PIECE`), `W/A/S/D` (`CAMERA_PAN_*`), `Q/E` (`CAMERA_ROTATE_*`), `Home` (`CAMERA_CENTER`), `Escape` (`CANCEL_TOOL`) e `Space` (`TOGGLE_SIMULATION`).
  - Atualizado `isGlobalShortcutAllowed(event)` para bloquear atalhos dentro de `input`, `textarea`, `select`, `combobox`, `contenteditable` e modais (`[role="dialog"]`, `.settings-overlay`, `.victory-overlay`, `.screen-overlay`), protegendo `Space`/`Enter` nativos em `<button>` mas permitindo `R`, `WASD` e `Q/E` mesmo após clique em botão da toolbar.
- **[src/game/rendering/camera-controller.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/rendering/camera-controller.ts), [camera-controller.test.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/rendering/camera-controller.test.ts) e [scene-manager.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/rendering/scene-manager.ts):**
  - Implementado `CameraController` desacoplado da simulação, com pan horizontal relativo à orientação atual da câmera (`getBasisVectors()` ortonormal no plano `XZ`), rotação orbital horizontal em passos de 90° (`Q` anti-horário / `E` horário, retornando à orientação inicial exata após 4 rotações), clamp de pan nos limites do tabuleiro (`[-4.5, +4.5]`), clamp de zoom (`[0.65, 1.6]`), `reset()`/`fitBoard()` e recálculo imediato do `Raycaster` após pan/rotação/zoom/resize.
- **[src/game/domain/level-catalog.model.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/domain/level-catalog.model.ts), [level-scoring.model.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/domain/level-scoring.model.ts) e [storage-adapter.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/persistence/storage-adapter.ts):**
  - Rebalanceada `L02` com `dock` em `(5, 3)` e `inventory: { CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 0 }`, solução de referência com 1 Processador + 3 Esteiras (`68` ciclos, `0` rejeições, `3` estrelas) e suporte a múltiplas posições válidas para o Processador.
  - Adicionados `LevelBestResult` e `isBetterLevelResult` com persistência retrocompatível `bestResultsByLevel` no schema `version: 1`.
- **[src/game/editor/editor-controller.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/editor/editor-controller.ts), [src/game/simulation/simulation-controller.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/simulation/simulation-controller.ts) e [src/game/ui/navigation-controller.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/ui/navigation-controller.ts):**
  - Implementado `rotateActiveOrSelected()` em `EditorController` girando tanto a peça selecionada quanto a prévia (`ghost`) da ferramenta ativa (`N → E → S → W → N`) e emitindo eventos tipados (`GHOST_ROTATED`, `COMPONENT_ROTATED`, `COMPONENT_PLACED`, `TOOL_SELECTED`).
  - Conectado o Tutorial `T00` aos eventos reais de `EditorController` e `SimulationController`.
  - Adicionado banner contextual `#paused-callout-banner` durante `PAUSED` com inspeção somente leitura e botão primário **Editar fábrica**, além de `ensureEditingMode()` ao trocar de tela.
  - Implementado o overlay central dedicado de vitória (`#result-panel.victory-overlay`) com 3 estrelas SVG, badge de recorde, 5 cartões de estatísticas e 5 botões de navegação/ação.
- **[src/game/rendering/grid-view.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/rendering/grid-view.ts), [src/game/rendering/component-view.ts](file:///C:/Users/erick/Documentos/Github/shiftworks/src/game/rendering/component-view.ts), [index.html](file:///C:/Users/erick/Documentos/Github/shiftworks/index.html) e [src/styles/main.css](file:///C:/Users/erick/Documentos/Github/shiftworks/src/styles/main.css):**
  - Adicionados base elevada (`plinth`) e maior contraste aos ladrilhos do tabuleiro, anel luminoso 3D (`selection-ring`) na peça selecionada, rotação solidária dos roletes da esteira e melhorias completas de hierarquia e responsividade no HUD (`1024×768` a `1920×1080`).

---

## 3. Matriz Antes / Depois

| Eixo | Antes | Depois |
|---|---|---|
| **Atalho `R` e Tutorial `T00`** | `R` ignorava ferramenta em modo `ghost`, bloqueava se foco estivesse em botão da toolbar e o tutorial avançava sem girar a peça. | `R` gira a prévia (`ghost`) da ferramenta ativa ou a peça selecionada (`N → E → S → W → N`), exibe o alvo atual (`Alvo de [R]`) e o tutorial `T00` só avança quando a rotação real ocorre. |
| **Câmera (`WASD` / `Q/E`)** | Câmera estática sem pan nem rotação orbital; botões `+`/`-` invertidos. | `CameraController` com pan `WASD` relativo à vista atual (sem inversão após giro), rotação `Q/E` em passos de 90° (`45°/135°/225°/315°`), botões `Q ↺`, `E ↻`, `-`, `100%`, `+` e raycasting preciso em todas as orientações. |
| **Fluxo `PAUSED → EDITING`** | Sem banner de pausa; clicar em peça mandava pressionar `R`; sair para o menu com jogo pausado travava `selectLevel`/`selectGameMode`. | Banner `#paused-callout-banner` claro com CTA primário **Editar fábrica**; clique em `PAUSED` faz inspeção somente leitura; `ensureEditingMode()` evita qualquer bloqueio ao navegar. |
| **Inventário `L02`** | `CONVEYOR: 0, PROCESSOR: 1` com apenas 1 célula `(1, 3)` entre fonte e doca. | `CONVEYOR: 10, PROCESSOR: 1` com doca em `(5, 3)`, permitindo construir a linha com esteiras e posicionar o Processador em múltiplas células válidas. |
| **Tela de Vitória** | Pequeno card estreito dentro da barra lateral direita. | Overlay modal central (`role="dialog"`) sobre o gameplay com 3 estrelas SVG, badge de novo recorde / melhor marca, 5 cartões de métricas e 5 botões (`Próxima fase`, `Repetir fase`, `Editar fábrica`, `Selecionar fase`, `Menu principal`). |
| **Localização (`i18n`)** | Vazava `BLUE_BLANK`, `CUT_PLATE`, `CONVEYOR`, `Tick 0` e frases em inglês (`Source emitted...`) no modo `pt-BR`. | 100% traduzido em `pt-BR` (`Bloco azul`, `Placa cortada`, `Bloco prensado`, `Esteira`, `Processador`, `Desviador`, `Ciclo 0`, diagnósticos e eventos) e `en`, preservando IDs internos. |

---

## 4. Provas de Solvabilidade das Fases (`npm run test:fixtures`)

Executado via motor determinístico puro (`scripts/reference-fixtures.mjs` e `src/game/simulation/level-reference.test.ts`):

| Fase | Layout de Referência | Ciclos até `RESULT` | Peças Editáveis Usadas | Itens Emitidos / Entregues | Rejeitados | Trocas de Modo (`SHIFT`) | Estrelas Obtidas |
|---|---|---:|---:|---:|---:|---:|---:|
| **L01** (`First Line`) | `Source(0,3)E → 6× Conveyor(1..6, 3)E → Dock(7,3)E` | `30` | `6` (orçamento: `12` esteiras) | `3 / 3` (`BLUE_BLANK`) | `0` | `0` | **3 / 3** |
| **L02** (`One Machine, Two Jobs`) | `Source(0,3)E → Processor(1,3)E [BLUE→CUT, AMBER→PRESS] → 3× Conveyor(2..4, 3)E → Dock(5,3)E` *(+ 3 variantes com Processor em `x=2,3,4`)* | `68` | `4` (orçamento: `1` proc + `10` esteiras) | `6 / 6` (`3 CUT_PLATE` + `3 PRESSED_BLOCK`) | `0` | `5` | **3 / 3** |
| **L03** (`Smart Routing`) | `Source(0,3)E → Processor(1,3)E → 3× Conveyor(2..4, 3)E → Diverter(5,3)E [PLATE→A, BLOCK→B] → OutA(6,3)E & Conveyor(5,4)S → OutB(5,5)S` | `70` | `6` (orçamento: `1` proc + `1` div + `16` esteiras) | `6 / 6` (`3 CUT_PLATE` em A + `3 PRESSED_BLOCK` em B) | `0` | `5` | **3 / 3** |

---

## 5. Testes Executados, Resultados e Cobertura

| Gate / Suite | Comando Executado | Exit Code | Resultado Detalhado |
|---|---|---:|---|
| **Lint** | `npm run lint` | `0` | **PASS** — 0 erros, 0 warnings ESLint |
| **Typecheck** | `npm run typecheck` | `0` | **PASS** — `tsc --noEmit` estrito sem erros |
| **Unit & Integration (Vitest)** | `npm test` | `0` | **PASS** — `26` arquivos de teste, `111` testes aprovados (`camera-controller.test.ts`, `editor-interaction.test.ts`, `keyboard-shortcuts.test.ts`, `level-reference.test.ts`, `i18n.service.test.ts`, `storage-adapter.test.ts`, etc.) |
| **Solvabilidade (Fixtures)** | `npm run test:fixtures` | `0` | **PASS** — `L01` (30 ticks, 3★), `L02` (68 ticks, 3★), `L03` (70 ticks, 3★) |
| **Build de Produção** | `npm run build` | `0` | **PASS** — `51` módulos compilados em `dist/` |
| **E2E Browser Real (Playwright)** | `npm run test:e2e` | `0` | **PASS** — `10/10` testes E2E em Chromium cobrindo Tutorial `T00` com `R`, câmera `WASD`/`Q/E` com raycast após rotação, `Start → Pause → Inspect → Edit Factory`, campanha completa `L01 → L02 → L03`, overlay de vitória, Sandbox, áudio, troca dinâmica `pt-BR`/`en` e viewports `1024×768`, `1280×720`, `1600×900` e `1920×1080` |

---

## 6. Capturas Reais Geradas pelo Playwright

- **HUD In-Game (PT-BR):** `artifacts/ux-1024x768.png`, `artifacts/ux-1280x720.png`, `artifacts/ux-1600x900.png`, `artifacts/ux-1920x1080.png`
- **Tutorial T00 (Rotação com `R` e Indicador de Prévia):** `artifacts/tutorial-t00-1280x720.png`
- **Fase L02 (1 Processador SHIFT + Esteiras Conectadas e Inspetor de Receitas):** `artifacts/l02-gameplay-1280x900.png`
- **Overlay Central de Vitória (3 Estrelas SVG, Estatísticas, Recorde e Navegação):** `artifacts/victory-overlay-1280x720.png`, `artifacts/l03-result-1280x900.png`
- **Menu Principal (Diorama 3D) e Seleção de Fases:** `artifacts/main-menu-1280x720.png`, `artifacts/main-menu-1920x1080.png`, `artifacts/level-select-1280x720.png`

---

## 7. Pendências e Limitações Conhecidas

| ID | Severidade | Descrição | Status |
|---|---|---|---|
| `PEND-EXT-01` | Baixa (Externa ao código) | Publicação externa da build estática `dist/` na página pública do itch.io e submissão final do formulário do GitHub Game Off 2026 (`G16`). | Pendente de ação manual na conta do desenvolvedor |
| `PEND-EXT-02` | Baixa (Playtest humano) | Registro de 2 sessões de playtest com participantes humanos externos (`G14`). | Pendente de sessão presencial/remota |
