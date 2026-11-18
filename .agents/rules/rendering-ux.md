# Regra — renderização, interação e UX

- `renderer` observa snapshots/eventos e não escolhe resultados da produção.
- `requestAnimationFrame` só interpola/monta meshes; usar dispose de geometrias, materiais e listeners.
- Raycast sobre grid/equipamentos com camada de colisão interativa explícita. Não selecionar objetos decorativos por engano.
- Mostrar orientação, ports e ghost de colocação; proibir placement fora da grade ou sobre componente fixo.
- Estado RUNNING desabilita edição e explica por quê. Pausa também congela visual coerentemente.
- HUD legível em 1280×720 e 1920×1080, zoom clamp, rolagem sobre o painel não move o tabuleiro.
- Não usar apenas cor para BLUE/AMBER e CUT/PRESS; reforçar com texto, forma, padrões e símbolos.
- Visual procedural original; não usar sprites/pixel art nem modelos com licença desconhecida.
