# Equipamentos, itens e receitas — conteúdo 2.0

## Oito equipamentos construíveis

| ID conceitual | Papel | Input / Output | UI e Three.js | Introdução |
|---|---|---|---|---|
| CONVEYOR | Transportar 1 item por célula/tick conforme motor atual | 1/1 | seta de direção, roletes animados, fluxo | L01 |
| PROCESSOR | Transformar 1 item via CUT/PRESS; shift custa ciclos | 1/1 | cabeçote comutável, status | L02 |
| DIVERTER | Enviar item por propriedade/regra a A ou B | 1/2 | pivô em Y, realce de rota | L03 |
| BUFFER | Fila FIFO, capacidade finita, backpressure | 1/1 | ocupação n/N e animação de saída | L05 |
| SENSOR | Observar propriedade de item e emitir ação no tick lógico | 1 leitura / sinais tipados | feixe e indicador; sem teleporte | L09 |
| SPLITTER | Distribuir fluxo em duas saídas pela política declarada | 1/2 | rotação/indicador de alternância | L10 |
| MERGER | Unificar duas entradas com arbitragem determinística | 2/1 | prioridades visíveis, limites claros | L11 |
| ASSEMBLER | Unir dois insumos de receita em 1 produto | 2/1 | slots e braços ou cabeçotes animados | L14 |

**Source e Output**: entidades de fase/sandbox, normalmente fixas; não contam nos oito equipamentos construíveis. Verificar tipos e IDs existentes no código antes de renomear.

## Conteúdo de cada ficha educativa

Nome PT/EN, resumo, quando utilizar, entradas/saídas, capacidade, configuração, limites, motivo de bloqueio, fase de desbloqueio, demonstração 3D funcional (sem alterar motor), segurança visual e atalhos. Hover/foco: tooltip. Clique em detalhes: modal/card não permanente, com Play/Pause/Reset e dispose.

## Onze itens (manter quatro IDs históricos)

- `BLUE_BLANK` — bloco azul; `CUT_PLATE` — placa cortada.
- `AMBER_BLANK` — bloco âmbar; `PRESSED_BLOCK` — bloco prensado.
- `COPPER_BLANK` — bloco de cobre; `COPPER_STRIP` — tira de cobre.
- `INSULATOR` — isolante; `CIRCUIT` — circuito.
- `FRAME` — estrutura; `CONTROL_MODULE` — módulo de controle; `AUTOMATION_UNIT` — unidade de automação.

**Não adicionar IDs duplicados se nomes equivalentes já existirem**. Registrar mapeamento e manter compatibilidade com dados salvos.

## Proposta de recipes

```text
BLUE_BLANK --Processor CUT--> CUT_PLATE
AMBER_BLANK --Processor PRESS--> PRESSED_BLOCK
COPPER_BLANK --Processor CUT--> COPPER_STRIP
COPPER_STRIP + INSULATOR --Assembler--> CIRCUIT
CUT_PLATE + PRESSED_BLOCK --Assembler--> FRAME
FRAME + CIRCUIT --Assembler--> CONTROL_MODULE
CONTROL_MODULE + PRESSED_BLOCK --Assembler--> AUTOMATION_UNIT
```

A semântica de múltiplos inputs deve ser atômica e testada; nome de receita e custo/tempo são dados balanceáveis. Definir grafo de receitas acíclico, verificações de origem dos insumos e topologia de fontes. Não usar dados magicos de fixtures para gerar produtos sem cadeia real.

## Acesso por fase e por desbloqueio

`globalUnlocked = campanha aprendida` é diferente de `availableComponents = orçamento da fase` e de `placeable = (globalUnlocked && inventory>0 && EDITING && cellValid)`. Em Sandbox, itens podem ter todas as ferramentas liberadas por design, sem liberar conquistas da campanha automaticamente. Tooltips explicam o motivo de cada indisponibilidade.
