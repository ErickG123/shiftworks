# SPEC-006 — Visual procedural, áudio e performance

**Status:** PARTIALLY IMPLEMENTED — G12 PARTIAL (2026-11-18; ver `docs/reports/REPORT-PHASE-12-visual-audio.md`)  
**Prioridade:** P1  
**Referências:** RF-015, RF-016; RNF-009, RNF-008  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Construir linguagem visual 3D industrial sem assets desenhados manualmente.

## Comportamento e escopo detalhado

- Geometrias e materiais específicos para cinco máquinas; diferentes silhuetas e marcadores.
- Movimentação suave entre snapshots; animação de shift e desviador sem alterar resultados.
- SFX originais limitados a no máximo um evento significativo por tick; inicia mutado e só cria/resume AudioContext após clique explícito.
- Iluminação/ambient/shadow leve, grid com feedback de seleção e peça fantasma.
- SFX gerados via Web Audio API; mute/volume e respeito a user gesture no navegador.
- Dispose de WebGL, materials, geometries, observers, event listeners e áudio.
- Teste de performance em desktop, fallback claro quando não houver WebGL.

## Critérios de aceite

1. A animação não duplica/remover itens lógicos; pode ser desligada sem alterar estado.
2. Áudio pode ser silenciado; autoplay respeita restrições do navegador.
3. Renderiza 1280×720 e 1920×1080 sem perda de legibilidade.
4. Renderer desmonta sem loop e listeners residuais evidentes.

## Casos negativos / bordas

- Input inválido não modifica estado silenciosamente; produzir erro tipado e feedback apropriado.
- Estado não permitido não executa ação (ex.: editar durante RUNNING).
- Falha do DOM, WebGL ou armazenamento não deve alterar regras do motor.
- Qualquer divergência de contrato deve ser formalizada em ADR/teste antes de mudar o comportamento.

## Testabilidade e evidências

- Testes com IDs em `docs/qa/TEST-PLAN.md`; linkar casos reais no relatório da fase.
- Quando houver UI, comprovar com captura ou registro E2E de fluxo real.
- Interpolação pura está coberta em `src/game/rendering/interpolation.test.ts`; mapeamento de SFX em `src/game/audio/sound-effects.test.ts`; E2E de mute/gesture em `e2e/visual-audio.spec.ts` permanece sem execução enquanto o Playwright não inicia workers.
- Quando houver engine, verificar fixtures puras sem WebGL.
- Status só muda para VERIFIED após execução e gate correspondente aprovado.

## Não incluir nesta SPEC

Funcionalidades de prioridade superior à fase atual não justificadas. Sistemas pós-jam não devem contaminar o MVP.
