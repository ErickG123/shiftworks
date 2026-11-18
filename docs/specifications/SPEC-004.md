# SPEC-004 — Vitória, fases e pontuação

**Status:** IMPLEMENTED IN PART; L01-L03 references, in-memory progression, contextual tutorial, replay/next and measured score are implemented; G09 browser evidence pending  
**Prioridade:** P0/P1  
**Referências:** RF-010, RF-012, RF-013, RF-014; RNF-006, RNF-013  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Entregar jornada jogável de puzzle com múltiplas soluções e feedback de objetivos.

## Comportamento e escopo detalhado

- Objetivos acumulativos por output, tipo e quantidade; vitória automática no fim do tick.
- L01 básico de transporte, L02 processador, L03 roteamento inteligente.
- Fase e restrições descritas em dados, não hardcode de layout único.
- Criar fixtures reais vitoriosas para cada fase e executá-las em teste de integração.
- Pontuação 1/2/3 estrelas com limites calibrados após executar soluções, não valores inventados.
- Menus de escolha, replay, próximo nível e estados de locked/unlocked quando aplicável.

## Critérios de aceite

1. L01, L02 e L03 têm soluções de referência que atingem metas na engine.
2. L03 demonstra 3 placas em A e 3 blocos em B sem intervenção após Start.
3. Rejeição não pontua em destino errado; vitória não ocorre antes de todas as metas.
4. Score e métricas são derivados dos eventos/estado, sem divergência de HUD.

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
- Fase 14 não obteve sessões humanas: onboarding e equilíbrio ainda não têm feedback de jogador; tempos medidos de fixtures são somente dados da engine.

## Não incluir nesta SPEC

Funcionalidades de prioridade superior à fase atual não justificadas. Sistemas pós-jam não devem contaminar o MVP.
