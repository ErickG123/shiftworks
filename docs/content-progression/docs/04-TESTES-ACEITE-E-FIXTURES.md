# Matriz de qualidade e aceite — conteúdo 2.0

## Gates por nível

| Gate | Evidência obrigatória |
|---|---|
| Schema | validado e referenciando apenas itens/receitas/components existentes |
| Topologia | Source, Output, portas e dimensões coerentes |
| Inventário | fornece peças suficientes para solução e não deixa obrigatória com count 0 |
| Tutor | primeira mecânica ensinada por ação validada; pular sem quebrar |
| Simulação | fixture conclui sem intervenção durante RUNNING; determinismo |
| Score | thresholds 2★/3★ plausíveis e demonstrados |
| UI | fase abrível pelo fluxo normal, objetivos traduzidos, resultado correto |
| Save | desbloqueia próximo sem apagar progresso histórico |
| E2E | ao menos teste representativo por setor e fixtures para **todas** as fases |

## Gates de integração dos equipamentos

- Construção/rotação/remoção, ports coerentes, inserção no motor, comportamento real sob tick, UI de configuração, visual Three.js, tooltips, modal 3D, tradução, persistência, E2E.
- Buffer FIFO: 1.000 ticks sem duplicação/perda; quando cheio bloqueia downstream.
- Sensor: regra muda função/rota apenas na fronteira de tick; sem loop infinito.
- Splitter: duas saídas, ordem reproduzível, ocupação e prioridades.
- Merger: arbitra duas entradas sem colisão ou starvation não documentada.
- Assembler: duas entradas com slots corretos, consumo atômico e output condicionado à livre saída.
- Pedidos dinâmicos: waveId/tick objetivo, sem cancelar entregas históricas.

## Regression suite

- Baseline relatada: 31 arquivos/125 testes unitários, fixtures L01/L02/L03 a 30/68/70 ticks, 11 E2E. Reexecutar e documentar resultados reais, sem afirmar compatibilidade antes da execução.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:fixtures`, `npm run build`, `npm run test:e2e`, `npm run manifest:update` (somente se scripts existirem).
- 1024×768, 1280×720, 1920×1080; interface PT-BR/EN sem labels técnicos crus.
- Testar keyboard `R`, `WASD`, `Q/E`, Esc, tooltip/modal, foco, controles ao pausar e editar, resize e vários ciclos menu → gameplay → menu.
- Performance: medir se possível, sem inventar FPS; anotar renderer.info, count de render loops e listeners.

## Protocolo de falha

A fase com fixture ausente ou sem execução não é `CONCLUÍDA`; a fase com E2E impossível por ambiente é `PARCIAL` se E2E for gate. Não forçar passagens por localStorage, `setTimeout`, disparo artificial de eventos de vitória ou assertions que não conferem o estado do motor.
