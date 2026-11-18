# ROADMAP — execução SDD

**Regra:** cada fase tem prompt dedicado, SPEC/Requisitos, testes, relatório e gate; se bloqueada, resolver antes de avançar.

| Fase | Prioridade | Resultado concreto | Dependências | Gate |
|---|---|---|---|---|
| 00 | P0 | Auditoria inicial e plano de execução | — | G00 |
| 01 | P0 | Scaffold Vite/TS, ferramentas, arquitetura, CI | 00 | G01 |
| 02 | P0 | Scene Three.js, grid e câmera | 01 | G02 |
| 03 | P0 | Editor placement, rotate, remove e portas | 02 | G03 |
| 04 | P0 | Estado puro, tick e estado da sessão | 01,03 | G04 |
| 05 | P0 | Source, Conveyor e resolução de fluxo | 04 | G05 |
| 06 | P0 | SHIFT Processor, receitas, troca de modo | 05 | G06 |
| 07 | P0 | Diverter, rules editor, Outputs e diagnóstico | 06 | G07 |
| 08 | P0 | Vertical slice E2E com vitória | 02–07 | **G08** |
| 09 | P1 | 3 fases, tutorial, results, score | 08 | G09 |
| 10 | P1 | Sandbox, opções e persistência simples | 08 | G10 |
| 11 | P1 | UX, acessibilidade, responsividade | 08 | G11 |
| 12 | P1 | Geometrias, animações, áudio, desempenho | 08 | G12 |
| 13 | P1 | QA automatizado e hardening | 09–12 | **G13** |
| 14 | P1 | Playtest, balanceamento, correção crítica | 13 | G14 |
| 15 | P1 | Build release-candidate e auditoria de entrega | 14 | G15 |
| 16 | P1 | Publicar itch.io, tag e relatório de submissão | 15 | **G16** |
| 17 | POST | Backlog pós-jam e visão de produto | 16 | Opcional |

## Trilha crítica

Fases **00–08** provam o jogo. Fases 09,11,12,13,14,15,16 dão qualidade e entrega. A **Fase 10 é sacrificável** se o cronograma apertar. A Fase 17 nunca bloqueia a publicação.

## Sugestão de organização temporal

- 18–19/11: 00–03 (fundação e editor mínimo).
- 20–22/11: 04–08 (motor, SHIFT, vertical slice).
- 23–25/11: 09–11 (fases, sandbox opcional, UX).
- 26–28/11: 12–14 (polimento + QA + playtests).
- 29–30/11: 15–16 (release e submissão com margem).

Datas orientativas, **não evidência** de implementação nem garantia de duração.

## Critérios para cortar escopo

- Se P0 não estiver verificado ao fim de 22/11, remover P2 e suspender sandbox.
- Se G08 falhar em 26/11, parar features P1; concentrar na vertical slice estável e publicação.
- Se G15 estiver em risco, publicar uma única fase completa em vez de um jogo com 3 fases quebradas.
- Nunca cortar: confiabilidade dos itens, SHIFT visível, vitória, instruções e deploy público verificável.
