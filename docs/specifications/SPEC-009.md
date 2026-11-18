# SPEC-009 — Evolução pós-game-jam

**Status:** APPROVED FOR IMPLEMENTATION (não implementado)  
**Prioridade:** POST  
**Referências:** RF-021  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Evoluir o protótipo para produto sem comprometer release da jam.

## Comportamento e escopo detalhado

- Propor economia de produção, mais matérias-primas e receitas encadeadas.
- Editor de regras com sensores externos e roteamento avançado, com AST tipada.
- Editor de níveis e compartilhamento/import/export validado.
- Melhorar progressão, achievements e retenção sem analytics invasivo.
- Avaliar frameworks UI ou engine alternativa somente com ADR e benchmarks.
- Priorizar ideias com playtests e dados de feedback, não adicionar todas de imediato.

## Critérios de aceite

1. Backlog com problema, hipótese, impacto e custo.
2. ADRs para mudanças arquiteturais, novas migrações de save e contratos.
3. Nenhuma fase pós-jam é requisito para submissão 2026.

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
