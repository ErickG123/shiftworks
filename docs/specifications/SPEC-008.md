# SPEC-008 — Qualidade, release e publicação

**Status:** PARTIALLY IMPLEMENTED — G13/G15 PARTIAL, G16 BLOCKED (2026-11-18; ver relatórios de fases 13, 15 e 16)  
**Prioridade:** P0/P1  
**Referências:** RF-019; RNF-004, RNF-006, RNF-011, RNF-012  
**Dependências:** ver `docs/roadmap/ROADMAP.md`.

## Objetivo funcional

Validar o jogo, empacotar build web estática e documentar submissão pública.

## Comportamento e escopo detalhado

- Testes Vitest unit/integration e Playwright E2E de fluxo crítico; CI.
- Workflow CI agora instala Chromium e agenda a suíte Playwright além de lint, typecheck, unit tests, fixtures e build; execução no GitHub Actions ainda não foi observada.
- `npm run test:fixtures` imprime status, ticks, peças, emissões, rejeições e estrelas das três soluções de referência.
- Checklist RC registra freeze de features, auditoria dos 233 metadados de licença, uso de IA e instalação isolada do lockfile; E2E, screenshots, iframe e upload continuam pendentes.
- Smoke local de `dist/` com servidor de arquivos estáticos, não só dev server.
- Verificar imagens, licenças, atribuições, conteúdo de IA e conformidade com regras atuais da jam.
- Publicar HTML5 itch.io, validar iframe, input mouse/teclado, tamanho e URL pública.
- README, controles, exemplos, 3 screenshots reais, descrições e tag SemVer.
- Registrar hora/página da submissão real; jamais afirmar envio sem evidência.

## Critérios de aceite

1. CI sem blockers em lint/typecheck/tests/build.
2. Vertical slice jogável em release build hospedada, sem erro bloqueante no console.
3. Assets externos/IA declarados conforme regras verificadas.
4. Registro do link público e confirmação de inscrição/submissão; se não ocorrer, gate BLOCKED.

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
