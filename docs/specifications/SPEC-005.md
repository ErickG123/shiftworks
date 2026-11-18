# SPEC-005 — Interface, usabilidade e acessibilidade

**Status:** PARTIALLY IMPLEMENTED — G11 PARTIAL (2026-11-18; ver `docs/reports/REPORT-PHASE-11-ux.md`)  
**Prioridade:** P0/P1  
**Referências:** RF-010, RF-011, RF-016; RNF-007, RNF-008  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Criar interface jogável, autoexplicativa e consistente para construir, programar e diagnosticar.

## Comportamento e escopo detalhado

- Menu, seleção de fase, HUD, toolbar, inspector, diálogos, resultados e ajuda.
- Labels em controles e estados de foco e teclado corretos.
- Atalhos globais Space/R/Escape respeitam foco em botões, campos editáveis e selects; métricas frequentes não são anunciadas como live region.
- Zoom disponível por wheel no canvas e por controles DOM acessíveis.
- Instruções curtas contextuais, ferramentas selecionadas evidentes, orientação e ports visíveis.
- Mensagens não intrusivas para bloqueio, erro de regra, saída incorreta e deadlock.
- Iniciar sem rules válidas gera mensagem acionável, não travamento ou crash.
- Separar TS e CSS; DOM para UI sobre canvas; sem emoji como ícone.

## Critérios de aceite

1. Jogador consegue usar mouse/teclado sem depender de cor ou áudio.
2. HUD e inspector não se sobrepõem em 1280×720, sem scroll horizontal.
3. Modal e selects preservam navegação por teclado; ESC e SPACE respeitam foco.
4. Erros mostram causa e componente específico, podendo navegar até ele.

## Casos negativos / bordas

- Input inválido não modifica estado silenciosamente; produzir erro tipado e feedback apropriado.
- Estado não permitido não executa ação (ex.: editar durante RUNNING).
- Falha do DOM, WebGL ou armazenamento não deve alterar regras do motor.
- Qualquer divergência de contrato deve ser formalizada em ADR/teste antes de mudar o comportamento.

## Testabilidade e evidências

- Testes com IDs em `docs/qa/TEST-PLAN.md`; linkar casos reais no relatório da fase.
- Quando houver UI, comprovar com captura ou registro E2E de fluxo real.
- `E2E-004/005` foram implementados em `e2e/responsive-ux.spec.ts` e `e2e/keyboard-ux.spec.ts`, mas a execução e as capturas continuam pendentes até o worker/browser iniciar.
- Quando houver engine, verificar fixtures puras sem WebGL.
- Status só muda para VERIFIED após execução e gate correspondente aprovado.

## Não incluir nesta SPEC

Funcionalidades de prioridade superior à fase atual não justificadas. Sistemas pós-jam não devem contaminar o MVP.
