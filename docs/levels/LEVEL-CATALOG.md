# LVL-001 — Catálogo de níveis e soluções de referência

**Regra:** definição de fase é dado; solução de referência é fixture executável até `GOAL_COMPLETED`. Não afirmar solvabilidade antes do teste.

## L01 — First Line

- Objetivo: entregar `3 BLUE_BLANK` em DOCK.
- Elementos fixos: source azul, output DOCK.
- Ferramentas: Conveyor com quantidade suficiente para rota básica.
- Ensinamentos: orientação, conexão e Start/Pause/Reset.
- Estado inicial: modo EDITING. Vitória não exige processor.
- Aceite: entrega de 3 itens sem intervenção; orientações inválidas reportadas.

## L02 — One Machine, Two Jobs

- Objetivo: `3 CUT_PLATE` e `3 PRESSED_BLOCK` em outputs compatíveis.
- Elementos fixos: source alternada e saídas; parte do caminho pode estar pré-conectada.
- Ferramentas: 1 Processor, poucas Conveyors; Diverter pode ser pré-configurado para concentrar-se em regras de máquina.
- Ensinamentos: IF material THEN CUT/PRESS, custo de shift.
- Aceite: visualizar alternância de modos ao longo dos itens; sem clique após Start.

## L03 — Smart Routing

- Objetivo: `3 CUT_PLATE` em A + `3 PRESSED_BLOCK` em B.
- Elementos fixos: Source, Output A, Output B.
- Ferramentas: 1 Processor, 1 Diverter e orçamento limitado de Conveyors.
- Ensinamentos: bifurcar para rotas distintas por tipo de produto, otimização.
- Aceite: layout livre respeita restrições, simulação conclui sem rejeição na fixture de referência.

## Regras para implementação

1. Escolher coordenadas fixas e orientações conectáveis, validar com simulação real.
2. Criar `reference-l01`, `reference-l02`, `reference-l03` contendo layout e rules.
3. Em teste, alimentar engine com fixture e executar número máximo razoável de ticks; assert meta e invariantes.
4. Só após fixture vitoriosa calibrar `twoStarMaxTicks`, `threeStarMaxTicks` e `threeStarMaxPieces`. Prazos fictícios não são aceitos.
5. Tutorial explica o conceito, não bloqueia usuário com telas longas.

## Extras (P2)

L04 — Tight Space (obstáculos); L05 — Rush Order (pedidos assimétricos). Só criar após G13.

## Measured reference evidence (Phase 09)

Measured with the checked-in reference layouts and the production simulation engine (`level-reference.test.ts`):

| Level | Ticks to RESULT | Items emitted/delivered | Mode shifts | Editable pieces |
|---|---:|---:|---:|---:|
| L01 | 30 | 3 / 3 | 0 | 6 |
| L02 | 65 | 6 / 6 | 5 | 1 |
| L03 | 70 | 6 / 6 | 5 | 6 |

The current three-star tick boundary is measured reference ticks + 1, so each reference finishes inside the strict < comparison. Three stars also require the measured piece budget and zero rejects. The reference fixtures assert these criteria; broader score-balance/playtest evidence remains outstanding.
