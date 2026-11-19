# SPEC — Gameplay Interaction, Keyboard Shortcuts & Camera Navigation

> **Status:** IMPLEMENTED & VERIFIED  
> **Data:** 2026-11-18  
> **Requisitos associados:** `RF-001`, `RF-002`, `RF-016`, `RNF-002`, `RNF-007`, `RNF-008`

---

## 1. Mapa de Atalhos e Ownership de Eventos

| Tecla (`code` / `key`) | Ação Canônica | Owner | Comportamento |
|---|---|---|---|
| `KeyR` / `r` | `ROTATE_PIECE` | `EditorController` | Gira em 90° sentido horário (`N → E → S → W → N`) a peça selecionada ou a prévia (`ghost`) da ferramenta ativa em `EDITING`. **Nunca rotaciona a câmera.** |
| `KeyW` / `w` | `CAMERA_PAN_FORWARD` | `SceneManager` / `CameraController` | Move o ponto-alvo da câmera para a frente/cima da visão atual sobre o plano `XZ`. |
| `KeyS` / `s` | `CAMERA_PAN_BACKWARD` | `SceneManager` / `CameraController` | Move o ponto-alvo da câmera para trás/baixo da visão atual sobre o plano `XZ`. |
| `KeyA` / `a` | `CAMERA_PAN_LEFT` | `SceneManager` / `CameraController` | Move o ponto-alvo da câmera para a esquerda da visão atual sobre o plano `XZ`. |
| `KeyD` / `d` | `CAMERA_PAN_RIGHT` | `SceneManager` / `CameraController` | Move o ponto-alvo da câmera para a direita da visão atual sobre o plano `XZ`. |
| `KeyQ` / `q` | `CAMERA_ROTATE_LEFT` | `SceneManager` / `CameraController` | Gira a câmera 90° em sentido anti-horário ao redor do ponto-alvo (`45° → 315° → 225° → 135° → 45°`). |
| `KeyE` / `e` | `CAMERA_ROTATE_RIGHT` | `SceneManager` / `CameraController` | Gira a câmera 90° em sentido horário ao redor do ponto-alvo (`45° → 135° → 225° → 315° → 45°`). |
| `Home` | `CAMERA_CENTER` | `SceneManager` / `CameraController` | Centraliza o tabuleiro (`target = (0, 0)`, `yawIndex = 0`, `zoom = 1`). |
| `Escape` | `CANCEL_TOOL` | `EditorController` / `NavigationController` / `SimulationController` | Fecha modal ativo (Configurações / Vitória) ou cancela a ferramenta de construção ativa retornando a `SELECT`. |
| `Space` | `TOGGLE_SIMULATION` | `SimulationController` | Alterna `EDITING → RUNNING ↔ PAUSED`. Não interfere quando um `<button>` possui foco (preservando ativação nativa do botão). |

---

## 2. Regras de Proteção de Foco (`isGlobalShortcutAllowed`)

- Rejeita eventos com `defaultPrevented`, `isComposing`, ou teclas modificadoras (`ctrlKey`, `altKey`, `metaKey`, `shiftKey`).
- Rejeita `event.repeat` para comandos discretos (`ROTATE_PIECE`, `CAMERA_ROTATE_LEFT`, `CAMERA_ROTATE_RIGHT`, `TOGGLE_SIMULATION`, `CANCEL_TOOL`), permitindo repetição controlada apenas para pan contínuo (`WASD`).
- Bloqueia todos os atalhos globais quando `event.target` ou `document.activeElement` estiver dentro de:
  `input`, `textarea`, `select`, `[contenteditable="true"]`, `[role="combobox"]`, `dialog`, `[role="dialog"]`, `[aria-modal="true"]`, `.settings-overlay:not([hidden])`, `.victory-overlay:not([hidden])`, `.screen-overlay:not([hidden])`.
- Quando um `<button>` da barra de ferramentas tem foco, bloqueia `Space` e `Enter` (preservando acessibilidade nativa por teclado), mas permite `R`, `WASD`, `Q/E` e `Escape` para que o jogador possa clicar em uma ferramenta e girar a prévia imediatamente.

---

## 3. Semântica de Rotação de Peça (`R`) e Tutorial `T00`

1. **Peça selecionada (`selectedId !== null`):** `R` envia `{ kind: 'ROTATE', componentId: selectedId }` ao `reduceEditor`, atualiza `direction` para a nova orientação e emite `COMPONENT_ROTATED`.
2. **Ferramenta de construção ativa (`CONVEYOR`, `PROCESSOR`, `DIVERTER`):**
   - Se o cursor estiver sobre uma célula vazia ou fora do tabuleiro, `R` avança `this.direction` (`N → E → S → W → N`), sincroniza `#placement-direction`, redesenha o `ghost` 3D imediatamente e emite `GHOST_ROTATED`.
   - Se o cursor estiver sobre uma peça editável recém-colocada na célula atual (`this.hover`), `R` gira a peça na célula e sincroniza `this.direction`.
3. **Nenhuma peça selecionada e nenhuma ferramenta de construção ativa (`SELECT` ou `REMOVE` com `selectedId === null`):** `R` não altera nenhuma peça do tabuleiro e exibe orientação em `#editor-feedback` (`editor.selectBeforeRotate`).
4. **Tutorial `T00`:** O avanço entre as 4 etapas (`select-conveyor`, `place-conveyor`, `rotate-conveyor`, `start-run`) é acionado exclusivamente por eventos reais emitidos por `EditorController.onAction` (`TOOL_SELECTED`, `COMPONENT_PLACED`, `GHOST_ROTATED`/`COMPONENT_ROTATED`) e `SimulationController.onAction` (`SIMULATION_STARTED`).

---

## 4. Matemática e Invariantes do `CameraController`

- **Projeção:** `OrthographicCamera` com `BASE_FRUSTUM_HEIGHT = 10.8`, raio orbital horizontal `R = √200` (`offset XZ = ±10`) e altura `H = 13`.
- **Base vetorial ortonormal no plano `XZ` para azimute $\theta = \frac{\pi}{4} + \text{yawIndex} \cdot \frac{\pi}{2}$:**
  $$\vec{F} = (-\cos\theta, -\sin\theta), \quad \vec{R} = (\sin\theta, -\cos\theta)$$
  Garante $\vec{F} \cdot \vec{R} = 0$, $\|\vec{F}\| = \|\vec{R}\| = 1$, e que `W/A/S/D` nunca inverte ao girar a câmera em 90°, 180° ou 270°.
- **Limites (Clamp):** `target.x, target.z ∈ [-4.5, +4.5]` para grade 8×8; `zoom ∈ [0.65, 1.6]`.
- **Raycasting:** Após qualquer pan, rotação `Q/E`, zoom ou `resize`, `camera.updateMatrixWorld()` e `camera.updateProjectionMatrix()` são atualizados antes do cálculo de interseção do `Raycaster` com `GridView.pickTargets`.
- **Desacoplamento:** O `CameraController` pertence exclusivamente à camada `src/game/rendering/` e jamais altera coordenadas lógicas `(x, y)` ou direções de domínio `N/E/S/W`.
