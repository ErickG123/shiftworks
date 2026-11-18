# SPEC-001 — Grid, interação e construção

**Status:** APPROVED FOR IMPLEMENTATION (não implementado)  
**Prioridade:** P0  
**Referências:** RF-001, RF-002, RF-003; RNF-006, RNF-007  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Exibir cenário isométrico e permitir construir linhas de produção com feedback instantâneo e sem falsos placements.

## Comportamento e escopo detalhado

- Grade 8×8 e projeção ortográfica com zoom clamp, dimensões validadas.
- Raycast traduz pointer em célula estável, priorizando grid e collider lógico em vez de mesh decorativa.
- Ferramentas PLACE/ROTATE/REMOVE com previews válidos/inválidos, ID estável e inventory.
- Portas direcionais N/E/S/W; conexão só entre peças adjacentes e compatíveis.
- Source/Output fixos nos níveis, não removíveis; ações só em EDITING.
- Canvas não deve capturar wheel quando o cursor está em painéis DOM.

## Critérios de aceite

1. Colocar fora da grade/ocupado falha com reason code, sem alteração de estado.
2. Rotação de 90° modifica direção e exibição de portas corretamente.
3. Remover devolve inventário, jamais exclui componente fixo.
4. Interação funciona em 1280×720 e 1920×1080, incluindo zoom e ESC.

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
