# Regra — renderização, interação e UX

- `renderer` observa snapshots/eventos e não escolhe resultados da produção.
- `requestAnimationFrame` só interpola/monta meshes e atualiza o `CameraController` visual; usar dispose de geometrias, materiais e listeners.
- `CameraController` controla apenas a visualização (`WASD` pan relativo à câmera, `Q/E` rotação orbital em passos de 90°, `Scroll`/`+`/`-` zoom e `100%`/`Home` centralizar). A tecla `R` jamais altera a câmera — é exclusiva do `EditorController` para girar a peça selecionada ou a prévia (`ghost`).
- Atalhos globais de teclado (`R`, `WASD`, `Q/E`, `Espaço`, `Esc`) passam por `isGlobalShortcutAllowed`, sendo bloqueados quando `input`, `select`, `textarea`, `combobox` ou modal (`[role="dialog"]`, configurações, vitória) detêm o foco.
- Raycast sobre grid/equipamentos com camada de colisão interativa explícita, recalculando matrizes da câmera após pan, rotação `Q/E`, zoom e resize.
- Mostrar orientação, ports, anel de seleção 3D e ghost de colocação; proibir placement fora da grade ou sobre componente fixo.
- Estados `RUNNING` e `PAUSED` desabilitam edição de peças, permitem inspeção somente leitura e exibem claramente o CTA **Editar fábrica** para retornar a `EDITING` preservando o layout.
- HUD legível em 1024×768, 1280×720, 1600×900 e 1920×1080, zoom clamp, rolagem sobre o painel não move o tabuleiro.
- Toda apresentação ao usuário deve ser localizada via `i18n` (`pt-BR` padrão e `en`), mantendo IDs internos de domínio (`BLUE_BLANK`, `CONVEYOR`, `N/E/S/W`) imutáveis.
- Não usar apenas cor para BLUE/AMBER e CUT/PRESS; reforçar com texto, forma, padrões e símbolos.
- Visual procedural original; não usar sprites/pixel art nem modelos com licença desconhecida.
