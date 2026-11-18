# SPEC-003 — SHIFT Processor e regras

**Status:** IMPLEMENTED IN PART; G06/G07 remain PARTIAL pending visual and full-flow evidence  
**Prioridade:** P0  
**Referências:** RF-007, RF-008, RF-009; RNF-005, RNF-013  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Transformar materiais com comutação automática de CUT/PRESS e rotas inteligentes.

## Comportamento e escopo detalhado

- Duas receitas base: BLUE_BLANK→CUT_PLATE e AMBER_BLANK→PRESSED_BLOCK.
- Processador com modo persistente, shift 2 ticks, processamento 3 ticks; espera se output bloqueado.
- Editor de até 2 regras para Processor e 2 para Diverter, sem parser textual nem `eval`.
- DuplicateRule e regra ausente são diagnósticos distintos; validar antes do Start.
- Diverter usa A (frente) e B (direita), com rotação relativa consistente.
- Output aceita por type; rejeita produto incorreto sem contar meta.

## Critérios de aceite

1. Material azul em modo PRESS aguarda 2+3 ticks antes de produzir placa.
2. Processador muda de volta ao receber âmbar e não processa com modo antigo.
3. Diverter enruta ambos os produtos para os destinos corretos independentemente da rotação.
4. Regras conflitantes bloqueiam Start; regra faltante aponta equipamento e item.

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
