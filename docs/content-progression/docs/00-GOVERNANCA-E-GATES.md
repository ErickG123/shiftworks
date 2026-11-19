# Regras de execução — SHIFTWORKS Conteúdo e Progressão 2.0

**Status do pacote**: especificação e prompts para implementação futura, não código pronto. 
**Referências**: GDD atual no repo; EXP-00..EXP-23 já relatadas como concluídas pelo usuário. Preservar o histórico de `docs/`, `AGENTS.md` e `.agents/`.

## Gates mandatórios

1. Cada prompt CNT inicia lendo `AGENTS.md`, `.agents/**`, documentação SDD real do repositório e relatório CNT anterior.
2. Não deduzir disponibilidade ao jogador apenas por existir `*.model.ts` ou teste. Comprovar fluxo `catalog → tool → placement → simulation → visuals → objective → save → E2E`.
3. Motor determinístico independente do DOM/Three.js/FPS; tick autoritativo. UI não modifica estado da simulação diretamente.
4. Camadas e padrões TypeScript/HTML/CSS definidos pelo projeto, sem arquitetura desproporcional. Não sobrepor arquivos antigos por versão de pacote.
5. PT-BR padrão e EN com chaves auditadas; identificadores técnicos e saves permanecem estáveis.
6. Integridade de saves, scores, desbloqueios e achievements; migração explícita e testes de regressão.
7. Cada fase precisa de schema válido, objetivo legível, componentes suficientes, tutorial quando introduzir mecânica, ao menos uma solução de referência executável, E2E pertinente e critérios de estrelas alcançáveis.
8. Testes relatados **não** são testes executados pelo agente atual. Registrar comando, resultado, duração e evidência; `NOT_RUN` não equivale a `PASS`.
9. Nenhuma mudança destrutiva no histórico; não ressetar arquivos, Git nem localStorage do usuário sem consentimento.
10. Prioridade à publicação: conteúdo novo não deve atrasar build estável. Permitido cortar depois de L08–L10 para a jam e continuar pós-jam.

## Status de gates

- `CONCLUÍDO`: critérios atendidos com provas de motor + UI quando aplicável e testes executados.
- `PARCIAL`: implementação incompleta, sem integração, sem fixture ou sem E2E onde obrigatório; registrar pendência.
- `BLOQUEADO`: impedimento técnico reproduzível e relatado, interromper cadeia dependente.

## Documentação por fase

`docs/reports/REPORT-CNT-XX-<slug>.md` (não sobrescrever relatórios EXP). Incluir diagnóstico/arquivos/decisões/alterações/aceite/testes/gates/falhas/próximo prompt. Atualizar specs/ADRs e `.agents/` com moderação: evitar duplicar regras existentes.

## Milestones / corte

- **P0**: 00–03, 11, 12, 21, 22 + correções bloqueantes dos equipamentos usados no recorte.
- **P1**: 04–10 e 13–15, 17–18, 20 (conteúdo interessante, reduzido se prazo apertado).
- **P2**: 16 e 19 (toda campanha de 20 fases, Sandbox ampliado, pós-jam quando necessário).
- Rodar CNT-21/22 após cada release selecionada; depois retomar prompt seguinte e refazer QA final.
