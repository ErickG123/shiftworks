# CNT-21 — Gate final de QA, regressão, performance e acessibilidade

**Projeto:** SHIFTWORKS — Conteúdo e Progressão 2.0  
**Prioridade:** P0  
**Pré-requisito:** CNT-20  
**Entrega principal:** código e documentação SDD testados no repositório existente.

## Objetivo

Executar de ponta a ponta a fase **Gate final de QA, regressão, performance e acessibilidade**, integrando os recursos à experiência jogável, sem criar sistemas paralelos ou quebrar o jogo existente.


## Contrato obrigatório desta execução (não omitir)

1. **Ler o repositório antes de modificar**: `AGENTS.md`, `.agents/**`, GDD atual, SPECs, ADRs, auditorias e relatórios anteriores, sobretudo `REPORT-EXP-23-documentacao-release-e-consolidacao.md` e o relatório **CNT** imediatamente anterior. Se o caminho não existir, localizar o equivalente e registrar; não fingir leitura.
2. **Mapear estado real** com evidência (`arquivo:linha`/testes/prints). O usuário relatou EXP-00..EXP-23 concluídas, 125 testes Vitest, fixtures L01–L03 e 11 E2E. Isso é uma *baseline relatada*, **não prova** que equipamentos avançados estejam acessíveis e utilizáveis no jogo. Reutilizar o que já existe antes de adicionar código.
3. **Implementar, não só analisar**, salvo bloqueador real. Não substituir o motor determinístico, não acoplar lógica a Three.js/DOM/FPS e não criar backend, engine de física ou framework UI novo sem ADR aprovado.
4. **Governança**: seguir estrutura de `.agents/`; `.model.ts` contratos, `.types.ts` aliases/unions, `.constants.ts` constantes, `.config.ts` configs, templates `.html`, estilo `.css`, implementação `.ts`; aplicar apenas onde há benefício concreto. Atualizar regras existentes sem duplicar normas ou destruir histórico.
5. **Compatibilidade**: PT-BR padrão + EN completo (catálogos sem texto solto), saves versionados e migráveis, campaign L01–L03 e progressão histórica preservadas. Não apagar progresso/recordes; testes de migração para dados antigos.
6. **Qualidade real**: rodar lint, typecheck, Vitest, fixtures, build e E2E pertinentes, documentar comandos e códigos de saída; quando algum gate for indisponível, registrar limitação, sem chamar de PASS.
7. **Rastreabilidade**: atualizar SPECs/ADRs/GDD/roadmap e escrever relatório `docs/reports/REPORT-CNT-XX-<slug>.md` com status `CONCLUÍDO | PARCIAL | BLOQUEADO`, evidência por critério, riscos e próximo passo. Antes de avançar, validar o gate do prompt corrente.
8. **Entrega**: manter build utilizável a cada etapa. Não declarar `CONCLUÍDO` só porque tipos, stubs ou testes de unidade passaram; demonstrar fluxo real pelo jogador quando a fase exigir UI.


## Fonte do pacote / contrato

Leia também: `shiftworks-content-progression-prompts/docs/00-GOVERNANCA-E-GATES.md`, `01-CAMPANHA-20-FASES.md`, `02-EQUIPAMENTOS-RECEITAS.md`, `03-PROGRESSAO-CONQUISTAS-E-PONTUACAO.md`, `04-TESTES-ACEITE-E-FIXTURES.md` e `05-ARQUITETURA-E-MIGRACAO.md`. Caminhos desse pacote são *referências de implementação*, não substituem GDD/ADRs atualizados do repo. Leia o relatório `docs/reports/REPORT-CNT-20-*.md` e valide se a fase anterior foi concluída.

## Implementação obrigatória (específica da fase)

- Criar/atualizar matriz nível por nível `L01..L20`: schema, fixture, E2E abertura, vitória, save, stars, localized, tool, viewport e estado da release.
- Validar 8 equipamentos: inventário, place, rotate, remove, inspect, card3D, anim, ports, Save/Load, comportamentos sob PAUSED/EDITING/RUNNING, reduced motion e 1×/2×/4×.
- Stress de 1.000 ticks com buffer, sensor, Splitter, Merger e Assembler; invariantes de conservação, prioridade, ausência de deadlock falso e determinismo.
- Regressão L01/L02/L03, T00/T01, main menu, level select, 3-star, old saves, português default, inglês, pausa/edição, R, WASD, Q/E, mouse, render resize.
- Verificar uso correto de Three.js e ausência de render loop/listener duplicado; medir draw calls/renderer.info e FPS em navegador real quando disponível.
- Rodar lint, typecheck, test, fixtures, build, E2E e manifest:update quando existentes; registrar logs e scripts.
- Criar relatório com `PASS | FAIL | NOT_RUN` por gate, sem declarações genéricas. Fase incompleta não entra em build anunciada como jogável.

## Verificações de aceite específicas

- Toda fase marcada como jogável tem fixture provando vitória por motor real.
- E2E comprova desbloqueio e acesso a novos equipamentos sem fuga pela UI.
- Nenhum gate bloqueante da release tem resultado FAIL/NOT_RUN sem decisão explícita documentada.

## Gates técnicos e relatório

- Adicionar testes unitários de domínio para decisões lógicas e componentes, fixtures de simulação para novas fases e E2E real quando envolver interface.
- Rodar comandos disponíveis (`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:fixtures`, `npm run build`, `npm run test:e2e`, `npm run manifest:update`) conforme necessidade; se qualquer script não existir, documentar.
- Revisar i18n PT-BR/EN, teclado, focus/aria, tela pequena, performance de Three.js e migração de saves nos módulos afetados.
- Atualizar docs e relatório `docs/reports/REPORT-CNT-21-qa-integracao-fixtures-e2e.md`, com status, testes de fato executados, evidências de tela se houver browser, falhas e riscos. Respeitar naming já definido em `.agents/` e ajustar a referência, se necessário.
- Se critério dependente de uma fase anterior estiver incompleto, não avance silenciosamente; corrija primeiro ou classifique a fase como PARCIAL.

## Proibições

Não criar vitórias hardcoded por ID de fase; não reimplementar sensores/buffers/etc. que já funcionam; não atribuir conquistas por ler páginas; não usar DOM para decidir simulação; não alterar o progresso histórico para "limpar testes"; não afirmar testes E2E/prints sem execução real; não renomear arquivos indiscriminadamente; não fazer deploy sem autorização.

## Resultado a entregar no fim da execução

1. Arquivos modificados e explicação curta do design adotado.
2. Critérios de aceite atingidos com evidências (sem boilerplate genérico).
3. Gates executados e saída objetiva (`PASS/FAIL/NOT_RUN`).
4. Documentos SDD atualizados e relatório da fase.
5. Pendências e go/no-go para CNT-22 .
