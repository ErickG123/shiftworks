# Skill: phase-execution

**Quando usar:** executar qualquer `prompts/XX-*.md`.

## Procedimento

- Abrir `AGENTS.md`, regras, última auditoria e relatório anterior.
- Gerar checklist da fase a partir dos critérios do prompt.
- Implementar com testes próximos às regras de domínio e evitar trabalhos fora de escopo.
- Verificar `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` (quando disponíveis).
- Conferir manualmente fluxo alterado no navegador; registrar se não foi possível.
- Atualizar documentos e abrir `docs/reports/REPORT-PHASE-XX-<slug>.md` com gate PASS/PARTIAL/BLOCKED.
- Informar riscos à próxima fase; não declarar a próxima pronta se houver blockers.
