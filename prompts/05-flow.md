# PROMPT 05 — Implementar Source, esteiras e bloqueios

**Fase:** 05 • **Prioridade:** P0 • **Gate:** G05 • **SPEC:** SPEC-002

## Contexto obrigatório (não pular)

Você é um agente de engenharia implementando SHIFTWORKS. Antes de alterar arquivos:

1. Leia `AGENTS.md`, `.agents/rules/*`, `docs/design/GDD.md`, `docs/vision/VISION.md`, `docs/requirements/REQUIREMENTS.md` e `docs/roadmap/ROADMAP.md`.
2. Leia `docs/architecture/OVERVIEW.md`, `CONTRACTS.md`, `SIMULATION-SEMANTICS.md` e ADRs relevantes. Leia `docs/specifications/SPEC-002.md` e a matriz `docs/qa/TRACEABILITY.md`.
3. Verifique o estado real de Git, scripts, dependências e arquivos; **não assuma que código já existe**. Leia todos os relatórios de execução anteriores relevantes e, principalmente, o relatório imediatamente anterior.
4. Compare o resultado anterior com os gates. Se existir bloqueio que afete esta fase, corrija-o ou declare BLOCKED; não esconda erros nem avance implicitamente.
5. Faça o mínimo necessário para alcançar o gate. Não extrapole P0/P1 nem introduza backend/framework novo sem ADR.

## Tarefas da fase

- Implemente Source com emissão periódica 5 ticks, sequência determinística BLUE/AMBER e backpressure.
- Implemente transferência de Conveyor e port compatibility, capacidade 1, sem movimento em cascata no mesmo tick.
- Conflitos por destino resolvidos com ordenação fixa e reserva de destino.
- Emissão bloqueada mantém próximo item pendente; IDs derivam de Source e ordinal.
- Exponha eventos ITEM_EMITTED, ITEM_MOVED e BLOCKED com razões legíveis.
- Integre posições dos itens ao renderer por projeção de snapshot/eventos, sem mudar lógica.

## Critérios de aceite (com provas)

- TC-005 a TC-010 e teste de congestão devem passar.
- Visualização permite ver material andando por esteiras.
- Repetir fixture produz contagens/eventos idênticos.

## Testes e verificação obrigatórios

- Crie/atualize testes de regras impactadas e casos negativos da `docs/qa/TEST-PLAN.md`.
- Execute os scripts disponíveis `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`; execute `npm run test:e2e` quando definido e aplicável. Caso não existam, só a Fase 01 deve criá-los; antes dela registre impossibilidade sem declarar sucesso.
- Valide manualmente qualquer UI alterada no navegador real, incluindo tela 1280×720 quando pertinente; não confunda unit tests com verificação visual.
- Nunca use `any` no domínio, não amarre engine ao Three.js, não gere assets não licenciados e não mude semântica de ticks sem atualizar ADR e fixtures.

## Atualizações obrigatórias de documentação

- Atualize `docs/requirements/REQUIREMENTS.md`, SPECs relacionadas, `docs/qa/TRACEABILITY.md` e `docs/roadmap/BACKLOG.md` **somente com evidência**.
- Registre mudança arquitetural em ADR, se necessária; não reescreva o GDD original silenciosamente.
- Crie `docs/reports/REPORT-PHASE-05-flow.md` seguindo `docs/templates/PHASE-REPORT-TEMPLATE.md`: baseline, arquivos, testes/comandos e resultados reais, critérios aceitos, pendências e status de G05.
- Se gate não passou, explique reprodução, severidade e o trabalho necessário para passá-lo; não siga para a próxima fase.

## Resposta final do agente

Apresente: síntese concreta do que foi implementado, status **PASS/PARTIAL/BLOCKED**, evidências e caminhos alterados, testes reais, problemas pendentes e recomendação objetiva para execução (ou não) do próximo prompt. Não invente commit, screenshot ou release.
