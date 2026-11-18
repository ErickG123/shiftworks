# PROMPT 13 — Executar auditoria e suíte de testes completa

**Fase:** 13 • **Prioridade:** P1 • **Gate:** G13 • **SPEC:** SPEC-008

## Contexto obrigatório (não pular)

Você é um agente de engenharia implementando SHIFTWORKS. Antes de alterar arquivos:

1. Leia `AGENTS.md`, `.agents/rules/*`, `docs/design/GDD.md`, `docs/vision/VISION.md`, `docs/requirements/REQUIREMENTS.md` e `docs/roadmap/ROADMAP.md`.
2. Leia `docs/architecture/OVERVIEW.md`, `CONTRACTS.md`, `SIMULATION-SEMANTICS.md` e ADRs relevantes. Leia `docs/specifications/SPEC-008.md` e a matriz `docs/qa/TRACEABILITY.md`.
3. Verifique o estado real de Git, scripts, dependências e arquivos; **não assuma que código já existe**. Leia todos os relatórios de execução anteriores relevantes e, principalmente, o relatório imediatamente anterior.
4. Compare o resultado anterior com os gates. Se existir bloqueio que afete esta fase, corrija-o ou declare BLOCKED; não esconda erros nem avance implicitamente.
5. Faça o mínimo necessário para alcançar o gate. Não extrapole P0/P1 nem introduza backend/framework novo sem ADR.

## Tarefas da fase

- Revisar matriz RF→SPEC→teste; identificar buracos e testes com apenas nome sem assert.
- Implementar/executar todos casos críticos de TC-001 a TC-028; priorizar P0 e falhas em concorrência.
- E2E-001/002/003/004/005/007 em Chromium; fallback browser e storage quando possíveis.
- CI com lint, typecheck, unit/integration, build e E2E; registrar execução real.
- Rodar script de fixtures referência com resultado e contagem de ciclos.
- Corrigir erros críticos e registrar cobertura sem afirmar percentuais inexistentes.
- Gerar audit report com blockers/high/medium/low e decisor do gate.

## Critérios de aceite (com provas)

- G13 PASS apenas com testes críticos executados em verde.
- Nenhum item duplicado/perdido ou vitória falsa conhecida.
- Build dist e jornada de ponta a ponta reproduzíveis.

## Testes e verificação obrigatórios

- Crie/atualize testes de regras impactadas e casos negativos da `docs/qa/TEST-PLAN.md`.
- Execute os scripts disponíveis `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`; execute `npm run test:e2e` quando definido e aplicável. Caso não existam, só a Fase 01 deve criá-los; antes dela registre impossibilidade sem declarar sucesso.
- Valide manualmente qualquer UI alterada no navegador real, incluindo tela 1280×720 quando pertinente; não confunda unit tests com verificação visual.
- Nunca use `any` no domínio, não amarre engine ao Three.js, não gere assets não licenciados e não mude semântica de ticks sem atualizar ADR e fixtures.

## Atualizações obrigatórias de documentação

- Atualize `docs/requirements/REQUIREMENTS.md`, SPECs relacionadas, `docs/qa/TRACEABILITY.md` e `docs/roadmap/BACKLOG.md` **somente com evidência**.
- Registre mudança arquitetural em ADR, se necessária; não reescreva o GDD original silenciosamente.
- Crie `docs/reports/REPORT-PHASE-13-qa-hardening.md` seguindo `docs/templates/PHASE-REPORT-TEMPLATE.md`: baseline, arquivos, testes/comandos e resultados reais, critérios aceitos, pendências e status de G13.
- Se gate não passou, explique reprodução, severidade e o trabalho necessário para passá-lo; não siga para a próxima fase.

## Resposta final do agente

Apresente: síntese concreta do que foi implementado, status **PASS/PARTIAL/BLOCKED**, evidências e caminhos alterados, testes reais, problemas pendentes e recomendação objetiva para execução (ou não) do próximo prompt. Não invente commit, screenshot ou release.
