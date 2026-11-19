# Prompts SDD — execução com Codex/CLI

Leia `AGENTS.md` e `docs/roadmap/ROADMAP.md` antes de rodar qualquer arquivo. **Não execute todos os prompts em uma única invocação sem gates**; rode um por vez, gere relatório, valide e só depois avance. Prompt 17 é pós-jam e opcional.

## Sequência e áreas

00 baseline → 01 scaffold → 02 grid Three.js → 03 editor → 04 engine → 05 fluxo source/conveyor → 06 processor SHIFT → 07 diverter/rules/output → 08 vertical slice → 09 níveis/score → 10 sandbox opcional → 11 UX → 12 visual/audio → 13 QA → 14 playtests → 15 RC → 16 itch.io → 17 pós-jam.

## Como iniciar

1. Crie um repositório de projeto vazio `shiftworks` (ou coloque o pacote documental na raiz do repo existente após auditoria).
2. Copie `AGENTS.md`, `.agents/`, `docs/` e `prompts/` mantendo os paths.
3. Envie ao agente o conteúdo de `prompts/00-baseline.md` ou peça: "Execute o prompt `prompts/00-baseline.md` de ponta a ponta, obedecendo AGENTS.md".
4. Leia `docs/reports/REPORT-PHASE-00-*.md` e confirme que G00 tem evidência antes da Fase 01.
5. Em caso de falha, peça correção do mesmo prompt e novo relatório; não forçar PASS.

## Compromisso de saída de cada fase

- Código real que resolve apenas o escopo.
- Casos de teste concretos com resultados reais (ou bloqueios claros).
- Atualização documental coerente.
- Relatório específico em `docs/reports/` e indicação clara de gate.
- Nenhum comentário TODO substitui implementação aceita.

## Prompt de orientação comum

"Priorize o prazo da jam; reporte escopo cortado, jamais afirme conclusão sem teste. Faça o motor puramente determinístico, modelos `.model.ts`, separação de código e UI, mantenha a arquitetura e releia os relatórios anteriores. Não avance se G08/G13 estiverem quebrados."
