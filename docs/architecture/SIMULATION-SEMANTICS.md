# ARC-003 — Semântica canônica da simulação

**Este contrato resolve ambiguidades de tick e fluxo do GDD para tornar os testes reproduzíveis.** Qualquer mudança exige ADR, novos testes e relatório.

## 1. Tempo lógico

- Um `step` avança **exatamente 1 tick** e nunca consulta relógio externo.
- Cadência sugerida de apresentação: 250 ms por tick em 1×. O controller invoca steps; velocidade de desenho e FPS não interferem.
- `shiftTicks=2`, `processTicks=3`, `sourceInterval=5` são defaults. Após admissão, o processador inicia a troca de modo quando necessária; uma troca ocupa dois avanços de tick completos antes do processamento. Processamento ocupa mais três avanços. Contadores não podem ser descontados duas vezes no tick de entrada.
- Todo novo estado de componente é reconstruído a partir do layout quando `Start`/`Reset`; não reutilizar contadores de tentativa anterior.

## 2. Espaço e capacidade

- `width×height` células indexadas `(x,y)` a partir de `(0,0)`, limites `0<=x<width` etc.
- Uma célula pode conter um componente ou obstáculo; componente tem capacidade interna de **um item** exceto Source/Output, que operam como portas, não como slots persistentes.
- Apenas vizinhos ortogonais com ports compatíveis trocam itens; sem transporte diagonal nem teleporte.
- Conveyor moves diretamente para o vizinho frontal, se livre; input conectado vem por trás. Processor recebe pela traseira e entrega pela frente. Diverter recebe por trás, envia para frente (A) ou direita (B), conforme item. Output recebe pela traseira.
- Se o jogador orientar o Output para uma porta diferente, a UI sinaliza conexão ausente.

## 3. Fases determinísticas do tick

1. **Advance timers:** decrementar timers existentes no começo do tick; se completarem, mudar status `READY` e emitir eventos. Não decrementar timers criados neste mesmo tick.
2. **Snapshot e intenções:** coletar propostas de saída de itens `READY`, baseadas na ocupação do **início da fase 2**. Somente destino sem item no snapshot pode receber; logo dois itens não atravessam em cascata na mesma etapa.
3. **Reserva de destino:** classificar propostas por `(destination.y,destination.x,source.y,source.x,item.sequence,item.id)`; para cada destino, aceitar no máximo uma proposta. Rejeitadas aguardam com motivo `DESTINATION_RESERVED` ou `BLOCKED`.
4. **Commit das transferências:** aplicar propostas aceitas simultaneamente. `Output` consome imediatamente no commit; verifica tipo e meta; se incorreto emite `ITEM_REJECTED`, incrementa rejeições e remove item do mundo.
5. **Admissão:** em Processor/Diverter com item recém-recebido, avaliar regras uma vez; duplicadas são impedidas ao editar, faltantes deixam item retido com `RULE_MISSING` até Reset/Edit. Processor inicia shift ou process; Diverter fixa rota no item.
6. **Source emissão:** fontes com intervalo vencido tentam emitir em vizinho à frente **após transferências**, ocupando um slot vazio e conectado. Cada fonte emite no máximo um item nessa etapa, por tick; se bloqueada, mantém item pendente e não avança sequência. Fila efetiva 1 (sem acumular infinitos atrasos). Item emitido para Processor/Diverter passa pela lógica de admissão sem timer consumido neste tick.
7. **Goals e diagnóstico:** atualizar metas cumulativas/indicadores, detectar vitória; warning deadlock só quando nenhum evento/progresso por janela definida e pedido incompleto; não terminar fase automaticamente.
8. **Eventos:** ordenar com índice crescente dentro do tick; retorno `{state, events}` somente de dados puros, sem IO.

## 4. Contador das fontes

- `nextDueTick` começa em `5`, primeira emissão elegível no tick 5.
- Após emissão bem-sucedida no tick `t`, a próxima fica elegível em `t+5`.
- Se bloqueada em `t`, permanece elegível nos ticks seguintes até conseguir emitir, sem pular itens.
- ID de item: `<sourceId>:<emissionOrdinal>`; ordinal incrementa apenas após emissão.
- A sequência cíclica, como BLUE/AMBER, é indexada pelo ordinal de emissão e não pelo tempo do relógio.
- Source não deve emitir por fora dos limites ou portas inválidas; reportar motivo claro.

## 5. Processamento e mudança de modo

- Na chegada de `BLUE_BLANK` ou `AMBER_BLANK`, procurar exatamente uma regra compatível.
- Quando não há regra: `RULE_MISSING`; item bloqueado e diagnóstico. Quando regra se repete: configuration invalid; Start não deve prosseguir até corrigir.
- Se modo desejado difere do atual, disparar `MODE_SHIFT_STARTED`, custo 2 ticks; após completar, `PROCESS_STARTED`, custo 3 ticks.
- Se modo igual, iniciar imediatamente 3 ticks de processamento.
- Quando processo conclui, transformar item em CUT_PLATE ou PRESSED_BLOCK, emitir evento, manter item no componente até saída ter espaço. Item não deve processar novamente ao esperar saída.
- Modo permanece após conclusão, exigindo troca apenas se próximo item pedir modo diferente.

## 6. Diverter e Outputs

- Diverter fixa A/B na chegada com base no tipo **processado**. A saída A é a porta frontal; B é a porta lateral direita, relativas à rotação da peça; nenhuma regra usa ID de Output para pular conexões.
- Output aceita todos os itens que fisicamente chegarem pela porta de entrada; conta como entrega válida somente se tipo constar em `acceptedTypes` e corresponder à meta daquela saída.
- Item incorreto é rejeitado/removido e incrementa `rejectedCount`; não completa a meta.
- Fase 01 pode configurar Output como `DOCK`, aceitando `BLUE_BLANK`.
- Evitar vitória prematura: somente quando todas as metas são satisfeitas, avaliado após commit do tick.

## 7. Edit/Run/Pause/Reset

- `EDITING`: peças e rules editáveis; não há avanço lógico.
- `RUNNING`: somente step/pause/velocidade (se disponível); nenhuma mudança de layout.
- `PAUSED`: sem step automático; layout ainda não editável; `Edit` volta a `EDITING`, **zera contadores e itens**, mantém construção e rules.
- `RESULT`: conclusão exibida; replay reinicializa com o mesmo layout; editar permite alterações preservando peça colocada.
- `Reset` de execução restaura layout/configuração e counters, mantendo sessão no estado definido pela UI (preferir `EDITING`, salvo replay explícito).

## 8. Métricas auditáveis

`tickCount`, `itemsEmitted`, `itemsMoved`, `itemsProducedByType`, `itemsDeliveredByOutput`, `rejectedCount`, `modeShiftCount`, `piecesUsed`. Contar transformações e entregas como eventos diferentes; não computar produto apenas por ser transformado.

## 9. Testes-âncora

- Fonte bloqueada não avança sequence, emite o item esperado ao desbloquear.
- Dois itens competindo pelo mesmo destino não se duplicam; vencedor fixo independente de ordem de iteração de Map.
- Conveyor bloqueado não destrói item nem move em cascata.
- Processador azul no modo PRESS leva 2 ticks de shift + 3 ticks de process; item só sai quando conectado e destino livre.
- Item laranja logo após azul requer nova troca CUT→PRESS, não aplica CUT indevidamente.
- Diverter B usa orientação relativa direita após rotação de 90°.
- Output incorreto registra reject e não aumenta goal.
- Replay de N ticks reproduz snapshots/eventos binariamente equivalentes (serialização estável).

## 10. Casos de limite a resolver na implementação

- Processador que conclui no mesmo tick de movimento pode propor saída conforme `READY` da fase 1; esse comportamento deve ser fixture do contrato.
- Quando Source emite em Processor que está livre, o timer de shift/process só começa na admissão da fase 6, sem desconto naquele tick.
- Um item recém-transferido para Conveyor só pode mover no tick seguinte.
- Vitória causa transição para `RESULT` no final do tick; nenhum `step` posterior deve ser executado sem novo Start/Replay.

## Sandbox output behavior (ADR-0007)

For a goal-free layout, an Output counts an item as delivered when the item's type is listed in `acceptedTypes`; it emits `ITEM_DELIVERED` and increments `itemsDeliveredByOutput`. Wrong item types remain rejected. A no-goal simulation remains RUNNING indefinitely and never emits `GOAL_COMPLETED` or enters RESULT. Goal-bearing campaign behavior is unchanged.
