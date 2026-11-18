# SPEC-007 — Sandbox e persistência local

**Status:** IMPLEMENTED IN PART; shared Sandbox, no-goal output counts, storage fallback and tests implemented; E2E and versioned layout save deferred
**Prioridade:** P1/P2  
**Referências:** RF-017, RF-018, RF-020; RNF-010  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Permitir experimentação livre reutilizando o mesmo motor e editor, com preferências resilientes.

## Comportamento e escopo detalhado

- Sandbox sem metas, com componentes ilimitados e source configurável.
- Load example, Clear com confirmação, Start/Pause/Reset e contadores por output.
- Progresso e preferências best-effort em localStorage com fallback em memória.
- P2: layout sandbox versionado, validar schema ao importar/abrir; não causar falhas em storage bloqueado.
- Sandbox NÃO cria editor separado, componentes novos ou economia.

## Critérios de aceite

1. O mesmo fluxo de itens e regras roda em Sandbox e Desafios.
2. Storage bloqueado/corrompido não impede começar jogo.
3. Clear não exclui progresso de desafios sem ação específica.
4. Save sandbox somente se G08 e G13 seguros; caso contrário registrar corte.

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
