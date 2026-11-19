# CNT-11 — Progressão por setores, conquistas e avaliação versionada

**Projeto:** SHIFTWORKS — Conteúdo e Progressão 2.0  
**Prioridade:** P0  
**Pré-requisito:** CNT-10  
**Entrega principal:** código e documentação SDD testados no repositório existente.

## Objetivo

Executar de ponta a ponta a fase **Progressão por setores, conquistas e avaliação versionada**, integrando os recursos à experiência jogável, sem criar sistemas paralelos ou quebrar o jogo existente.


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

Leia também: `shiftworks-content-progression-prompts/docs/00-GOVERNANCA-E-GATES.md`, `01-CAMPANHA-20-FASES.md`, `02-EQUIPAMENTOS-RECEITAS.md`, `03-PROGRESSAO-CONQUISTAS-E-PONTUACAO.md`, `04-TESTES-ACEITE-E-FIXTURES.md` e `05-ARQUITETURA-E-MIGRACAO.md`. Caminhos desse pacote são *referências de implementação*, não substituem GDD/ADRs atualizados do repo. Leia o relatório `docs/reports/REPORT-CNT-10-*.md` e valide se a fase anterior foi concluída.

## Implementação obrigatória (específica da fase)

- Auditar progressão e 8 conquistas anteriores; preservar records, estrelas e unlocked históricos, sem reset, duplicar recompensas ou atribuir conquistas por abrir telas.
- Implementar 5 setores × 4 fases (`L01..L20`) com avanço sequencial por `completedLevelIds`; conclusão L03 libera L04; conquista/estrelas não devem bloquear campanha principal (somente bônus opcionais).
- Definir catálogo de desbloqueio de equipamentos por fase de aprendizado: Processor=L02, Diverter=L03, Buffer=L05, Sensor=L09, Splitter=L10, Merger=L11, Assembler=L14; Conveyor=L01.
- Diferenciar **disponibilidade global**, **orçamento da fase** e **modo Sandbox**; não permitir equipamento não previsto num nível, mesmo globalmente unlocked, sem indicação visível.
- Definir estrelas por objetivos concluídos + thresholds calibrados por solução de referência, sem valores impossíveis ou por contagem interna falsa. Persistir melhores marcas sem sobrescrever por resultado pior.
- Recompensas por setor: emblema visual, conquistas e acesso a desafios bônus/Sandbox (nunca dependências ocultas de missão).
- Versionar save com migração e tolerância a payload incompleto; não usar `localStorage.clear` em testes de usuário; adotar storage fake.
- Testar unlock L03→L04, progressão antiga, carga corrompida, replay, melhor marca, estrela idempotente e ausência de unlock em derrota.

## Verificações de aceite específicas

- L01–L03 continuam concluídas em saves existentes; L04 abre automaticamente se L03 está concluída.
- Conquistas não concedidas por mudança manual de localStorage sem eventos válidos.
- Seleção de fase e inventário exibem motivos distintos para bloqueio/estoque zero.

## Gates técnicos e relatório

- Adicionar testes unitários de domínio para decisões lógicas e componentes, fixtures de simulação para novas fases e E2E real quando envolver interface.
- Rodar comandos disponíveis (`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:fixtures`, `npm run build`, `npm run test:e2e`, `npm run manifest:update`) conforme necessidade; se qualquer script não existir, documentar.
- Revisar i18n PT-BR/EN, teclado, focus/aria, tela pequena, performance de Three.js e migração de saves nos módulos afetados.
- Atualizar docs e relatório `docs/reports/REPORT-CNT-11-desbloqueios-estrelas-conquistas.md`, com status, testes de fato executados, evidências de tela se houver browser, falhas e riscos. Respeitar naming já definido em `.agents/` e ajustar a referência, se necessário.
- Se critério dependente de uma fase anterior estiver incompleto, não avance silenciosamente; corrija primeiro ou classifique a fase como PARCIAL.

## Proibições

Não criar vitórias hardcoded por ID de fase; não reimplementar sensores/buffers/etc. que já funcionam; não atribuir conquistas por ler páginas; não usar DOM para decidir simulação; não alterar o progresso histórico para "limpar testes"; não afirmar testes E2E/prints sem execução real; não renomear arquivos indiscriminadamente; não fazer deploy sem autorização.

## Resultado a entregar no fim da execução

1. Arquivos modificados e explicação curta do design adotado.
2. Critérios de aceite atingidos com evidências (sem boilerplate genérico).
3. Gates executados e saída objetiva (`PASS/FAIL/NOT_RUN`).
4. Documentos SDD atualizados e relatório da fase.
5. Pendências e go/no-go para CNT-12 .
