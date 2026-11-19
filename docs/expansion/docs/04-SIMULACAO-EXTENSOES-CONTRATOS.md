# Contratos da expansão de automação — proposta para ADR

O motor determinístico existente deve ser auditado e preservado. Esta proposta **não** substitui contratos reais sem migração e testes.

## Tick e ordenação

- O jogador controla pausa / um tick / 1× / 2× / 4×. Um passo pausa antes/depois e executa **exatamente uma** evolução de estado lógico; UI e animação podem interpolar eventos mas nunca avançar ticks extras.
- `SimulationSnapshot` imutável inclui `tick`, componentes, itens, filas, metas/pedidos, diagnóstico e eventos. `StepResult` inclui novo snapshot e eventos observáveis. IDs estáveis permitem reconstituir análise.
- Estados `EDITING`, `RUNNING`, `PAUSED`, `RESULT` respeitam transições; editar interrompe tentativa e restaura layout/configurações do snapshot inicial conforme política existente.
- Nos fluxos de transferência, reservar destinos e processar saídas de forma determinística. Filas internas de buffer contam ocupação; não duplicar/descartar item se destino cheio.

## Sensores

- Sensor pode observar `item.type`, `productType`, contagem de passagem e estado lógico validado. Definir alvo/porta/regra explicitamente; sinais com IDs determinísticos, não baseados na ordem de animações.
- No MVP de sensores, **não implementar** editor de lógica arbitrária: `IF tipo/contagem THEN SET_MODE / SET_ROUTE / ENABLE` com validação de alvo, tempo da ação e prioridade. Se houver duas regras conflitantes, comportamento explícito e teste.
- Sinal emitido em tick `t` é aplicado no tick `t+1` (ou outra semântica escolhida via ADR); isso evita dependência de ordem implícita durante processamento.

## Receitas encadeadas

- `RecipeDefinition`: recipeId, inputs, outputs, processingTicks, requiredMode, capability, capacity (sem inventário fracionado). Não existir receita de output inexistente, ciclo impossível ou máquina sem porta.
- Para suporte inicial simplificar para um item de entrada/saída por etapa; combinações multi-input ficam para pós-jam caso exijam engine adicional. Documentar decisão.
- Trocas de modos continuam custando ticks definidos, inclusive em receitas avançadas; não quebrar CUT/PRESS básicos.

## Buffers

- `Buffer` define `capacity`, `queue` FIFO, portas de entrada/saída e políticas quando cheio/vazio. Emissão atômica por tick, só remove o primeiro item se destinatário reservar a célula.
- Três casos obrigatórios: fonte bloqueada aguarda; buffer cheio recusa entrada sem descartar item; saída bloqueada mantém item sem duplicar.
- Interações com diverter e sensor devem ser estáveis, sem starvation e com critérios de fairness documentados.

## Pedidos dinâmicos

- `OrderSchedule` é dado de nível: sequência ou transição por tick/evento determinístico; sem aleatoriedade não semeada, rede ou timer de parede.
- O novo pedido não pode gerar situação irresolúvel sem indicar isso no level design. Mostrar pedido atual, próximo pedido (se regras permitem), histórico e condição de vitória.
- Metas de entrega contam apenas enquanto pedido adequado estiver ativo; itens já emitidos e em trânsito seguem política explícita (aceitar/estocar/rejeitar) baseada em regras do nível, não comportamento acidental.
- Testar solubilidade via solução de referência automática, com e sem reaproveitamento de processor.

## Observabilidade

- `MachineStatus`: ID, operação ativa, progresso restante, item atual, entrada/saída, bloqueio com código de motivo traduzível. Diagnóstico não recalcula estado; deriva de snapshot/eventos da engine.
- Eficiência: propostas de métricas `throughput = entregas válidas / ticks decorrido`, utilização = ticks ocupados / ticks totais, rejeição = rejeitados/produzidos, custo = máquinas/esteiras e mudanças de modo. Definir denominadores, zeros, corte por modo; pontuação/estrelas por nível com thresholds calibrados (não valores arbitrários).
- Histórico de eventos limitado em memória para evitar explosão; export opcional pós-jam.
