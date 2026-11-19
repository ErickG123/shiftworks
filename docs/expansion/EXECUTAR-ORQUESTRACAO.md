# Prompt mestre — executar a expansão SHIFTWORKS por fases, com gates

Você é o agente de implementação do SHIFTWORKS com acesso ao repositório local.

**Objetivo:** aplicar os prompts `shiftworks-expansion-prompts/prompts/00-*.md` até `23-*.md` em ordem segura, sem reescrever funcionalidades completas, sem perder progresso e sem omitir testes.

## Processo

1. Confirme que o pacote está dentro do repo. Antes de qualquer código, leia `AGENTS.md`, `.agents/`, docs atuais e `shiftworks-expansion-prompts/README.md`, `docs/00-PRINCIPIOS-E-REGRAS-EXECUCAO.md`, `docs/01-MAPA-DE-REQUISITOS.md`, `docs/05-MATRIZ-DE-TESTES-E-GATES.md`.
2. Identifique a fase de expansão mais antiga não concluída com gate validado, começando em 00, e leia o prompt correspondente. Leia também **o último relatório de fase existente** e todos os ADRs que impactam a tarefa.
3. Audite o código; implemente, teste, atualize SDD e gere `docs/reports/REPORT-EXP-XX-*.md` com status e evidências. Se necessário, crie `docs/audits/AUDIT-EXP-XX-*.md`.
4. Somente prossiga para o prompt seguinte quando os critérios de aceite estiverem atendidos. Quando houver bloqueio técnico, investigue e corrija com escopo mínimo. Se ainda bloqueado, informe a pendência e pare a sequência em vez de produzir falsos relatórios de conclusão.
5. Trabalhe por lotes pequenos. Preserve Git history, não resete banco/localStorage, não faça commits automáticos destrutivos nem substitua o motor determinístico.
6. Ao completar um conjunto publicável de P0, execute 22 (QA) e 23 (release) antes de correr risco com P2. Depois retome P1/P2 e execute 22/23 novamente ao consolidar nova release.
7. Não afirme acesso a browser, screenshots ou sucesso de deploy sem evidência. Testar no ambiente real quando disponível.

## Critérios centrais

- 15 melhorias rastreadas pelos IDs SW-101..SW-115.
- Catálogo de equipamentos com tooltips em hover/foco e card flutuante com demonstração 3D em movimento real por equipamento.
- Tutorials T00/T01 e lições Processor/Diverter com passos de ações reais, não apenas slides.
- Progressão L01→L02→L03 preservada, equipamento bloqueado vs estoque zero explicado, conquistas por eventos reais, saves migrados.
- `pt-BR` default e `en` disponíveis em TODOS os textos novos, sem quebrar identificadores internos.

A cada fase conclua com resumo de 1) entregue, 2) testes reais, 3) arquivos/documentos alterados, 4) pendências, 5) próximo prompt. Não deixe o cliente sem uma build funcional ao final de cada marco estável.
