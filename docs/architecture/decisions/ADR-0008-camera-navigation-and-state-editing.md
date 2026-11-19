# ADR-0008 — Navegação de câmera isométrica (`WASD` + `Q/E` 90°) e transição explícita `PAUSED → EDITING`

**Status:** ACCEPTED  
**Data:** 2026-11-18

## Contexto

Durante os testes de usabilidade e auditoria visual do SHIFTWORKS:
1. O jogador não dispunha de controles de teclado para deslocar (`pan`) ou girar a visão isométrica do tabuleiro 8×8, e existia o risco de conflito entre girar a câmera e girar a peça (`R`).
2. Ao pausar a simulação (`PAUSED`), as ferramentas de construção ficavam desabilitadas sem caminho evidente para retomar a edição, e navegar para o menu durante uma pausa podia manter o editor bloqueado.
3. Na Fase `L02`, o orçamento `CONVEYOR: 0` impedia o uso de esteiras.

## Decisão

1. **Separar estritamente controles de câmera e de peça:**
   - Criar `CameraController` (`src/game/rendering/camera-controller.ts`) restrito à camada de apresentação Three.js.
   - `W/A/S/D` realizam pan horizontal sobre o plano `XZ` relativo à orientação atual da câmera (usando base vetorial ortonormal derivada do azimute atual), com clamp nos limites do tabuleiro.
   - `Q` e `E` rotacionam a câmera em passos discretos de 90° (`45°, 135°, 225°, 315°`) ao redor do ponto-alvo, recalculando matrizes e `Raycaster` imediatamente.
   - `R` permanece 100% exclusivo do `EditorController` para girar a prévia (`ghost`) ou a peça selecionada no mundo (`N → E → S → W → N`).
2. **Transição explícita `PAUSED → EDITING` via CTA "Editar fábrica":**
   - Manter a simulação determinística proibindo mutação de layout durante `PAUSED`, mas permitir inspeção somente leitura de qualquer peça clicada e exibir um banner contextual (`#paused-callout-banner`) com CTA primário **Editar fábrica** (que preserva o layout e reinicia a tentativa no ciclo 0).
   - Forçar `ensureEditingMode()` ao sair da tela `GAMEPLAY` para evitar bloqueio residual de ferramentas.
3. **Flexibilizar a Fase L02 com orçamento de esteiras (`CONVEYOR: 10, PROCESSOR: 1`):**
   - Posicionar a Doca da L02 em `(5, 3)` com orçamento de 10 esteiras e 1 processador, permitindo múltiplas soluções válidas com solução de referência verificada em 68 ciclos (3 estrelas).

## Consequências e trade-offs

- **Positivas:** O motor de simulação permanece 100% puro e determinístico (zero dependência de câmera ou FPS); `R` funciona tanto na prévia quanto na peça selecionada; `WASD` nunca inverte após girar a vista com `Q/E`; L02 permite construção real com esteiras.
- **Cuidados:** As coordenadas de domínio (`N/E/S/W` e `(x, y)`) continuam absolutas no tabuleiro; o indicador `Visão 45° / 135° / 225° / 315°` e as setas direcionais 3D orientam o jogador após rotações de câmera.
