# SPEC-002 — Motor de simulação e transporte

**Status:** IMPLEMENTED IN PART; G08 vertical slice automated, browser gate pending  
**Prioridade:** P0  
**Referências:** RF-004, RF-005, RF-006, RF-011; RNF-001, RNF-002, RNF-005, RNF-013  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Simular fábricas por ticks determinísticos, preservando itens e capacidade sob concorrência.

## Comportamento e escopo detalhado

- Implementar `step(state)` puro, com snapshots e eventos imutáveis.
- Separar estado de layout de estado de execução (timers, itens, métricas, metas).
- Resolução de propostas concorrentes com ordem fixa e reservas.
- Source periódica com backpressure e sequências estáveis.
- Conveyor move uma célula/tick quando livre e ports compatíveis.
- Start/Pause/Edit/Reset/Result são uma máquina de estados explícita.
- Consultar rigorosamente `SIMULATION-SEMANTICS.md`.

## Critérios de aceite

1. Mesmo estado inicial, layout, regras e N steps gera resultado e eventos idênticos.
2. Fontes bloqueadas aguardam e não pulam item.
3. Não há múltiplos itens no mesmo slot ou teleportes entre células.
4. Pause não avança ticks; Reset zera runtime e preserva configuração.

## Casos negativos / bordas

- Input inválido não modifica estado silenciosamente; produzir erro tipado e feedback apropriado.
- Estado não permitido não executa ação (ex.: editar durante RUNNING).
- Falha do DOM, WebGL ou armazenamento não deve alterar regras do motor.
- Qualquer divergência de contrato deve ser formalizada em ADR/teste antes de mudar o comportamento.

## Testabilidade e evidências

- Testes com IDs em `docs/qa/TEST-PLAN.md`; linkar casos reais no relatório da fase.
- Quando houver UI, comprovar com captura ou registro E2E de fluxo real.
- Quando houver engine, verificar fixtures puras sem WebGL.
- Status só muda para VERIFIED após execução e gate correspondente aprovado.

## Não incluir nesta SPEC

Funcionalidades de prioridade superior à fase atual não justificadas. Sistemas pós-jam não devem contaminar o MVP.
