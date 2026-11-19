# SHIFTWORKS — Regras globais para a expansão SDD

**Status:** proposta de implementação, não código já executado. **Base de referência:** GDD v0.1 de 18/11/2026, relatórios e código real do repositório são autoritativos.

## Procedimento obrigatório EM TODAS as fases

1. Inspecionar `AGENTS.md`, `.agents/` e seus arquivos de regras/skills pertinentes. Descobrir primeiro a organização real e os diretórios reais; jamais presumir que arquivos sugeridos estejam presentes.
2. Ler GDD, docs/specifications, docs/requirements, docs/architecture/decisions, docs/audits, docs/reports, docs/roadmap, e **o relatório da fase imediatamente anterior**. Se existem relatórios conflitantes, distinguir decisão atual de histórico; não reverter sem evidência/ADR.
3. Verificar `git status`, scripts `package.json`, configs Vite/TS/Three.js, Vitest/E2E/i18n e estrutura do código antes de editar. Não descartar alterações não commitadas nem sobrescrever trabalho de terceiros.
4. Criar um diagnóstico conciso com evidências de arquivos, comportamento e testes iniciais. Registrar REQUISITO → ARQUIVO → TESTE → EVIDÊNCIA.
5. Implementar incrementos pequenos e testáveis, usando a arquitetura encontrada. Reaproveitar componentes existentes. NUNCA introduzir framework novo, backend, física realista, contas ou dependência incompatível sem ADR, benefício explícito e autorização compatível com o escopo.
6. Preservar motor determinístico: ticks ordenados, invariantes de ocupação, transferências/reservas, receitas, objetivos, progresso e resultado. A renderização Three.js é projeção/observadora do estado lógico; FPS, raycasting, animações e idioma não mudam decisões da simulação.
7. Preservar navegação, menu separado do gameplay, tutorial, Sandbox, L01/L02/L03, tradução PT-BR (primeiro acesso) / EN (seleção do usuário) e dados do localStorage, com migrações versionadas sempre que houver mudança de schema. NUNCA resetar progresso como solução para bugs.
8. Organização: módulos por funcionalidade; `.ts` comportamento; `.html` templates quando fizer sentido; `.css` apresentação; `.model.ts` contratos; `.types.ts` aliases/unions; `.constants.ts` constantes reutilizáveis; `.config.ts` configurações; testes `.test.ts`. Sem criar arquivo para cada tipo local insignificante. Sem HTML extenso em strings TS.
9. UI sem emojis, com ícones vetoriais, estados hover/focus/disabled, teclado funcional, contraste, tooltips; evitar aparência de dashboard empresarial. Nunca depender só de cor.
10. Após cada lote, executar lint, typecheck, Vitest, E2E/Playwright e build conforme scripts reais; registrar exatos comandos, aprovação/falha e motivo de qualquer teste não executado. Testar via navegador quando disponível, sem alegar evidência inexistente.
11. Atualizar specs, GDD/ADR se afetados, docs/reports/REPORT-EXP-XX-*.md e docs/audits/AUDIT-EXP-XX-*.md; regras `.agents/` e AGENTS.md somente se necessário, sem criar duplicações. O relatório deve cobrir baseline, mudanças, comportamento, testes, capturas, riscos, pendências, próximos passos e gate de aceite.
12. Se um pré-requisito não está atendido, registrar bloqueio e corrigir o necessário com escopo mínimo. Nunca marcar CONCLUÍDO por compilação isolada; usar PARCIAL com checklist claro quando faltarem testes ou critérios.

## Regras de produto

- **Loop central:** construir → programar → observar → diagnosticar → otimizar. Tutorial e sistema de informações devem explicar esse ciclo em ações reais, não só textos.
- **Game Off 2026:** priorizar estabilidade e qualidade. A expansão tem módulos pós-jam; jamais prejudicar uma build publicável por querer incluir tudo antes de 1/12. Confirmar regras e prazo oficial antes da submissão.
- **Preservar identificadores:** `BLUE_BLANK`, `AMBER_BLANK`, `CUT_PLATE`, `PRESSED_BLOCK`, `N/E/S/W`, `CUT/PRESS` como IDs estáveis, com rótulos traduzidos no UI.
- **Acesso a conteúdo:** conteúdos desbloqueados jamais desaparecem após replay ruim. Conquistas e estrelas são monotônicas (melhor resultado preservado); desbloqueio depende de conclusão válida do motor de simulação, não de clique em interface.
- **Sensor + Buffer + receitas:** definir semântica de ticks antes de escrever renderização. Não perder/duplicar itens sob contenção.
- **Three.js:** preview 3D real para cards de equipamentos, reutilizar geometrias/registry; previews com ciclo de vida explícito e isolados do estado da campanha.

## Modelo de relatório de cada fase

- Estado: CONCLUÍDO / PARCIAL / BLOQUEADO.
- Requisitos contemplados e status por ID, referências ao GDD original.
- Causas/decisões e ADRs criados ou atualizados.
- Arquivos adicionados/modificados/removidos e razão da mudança.
- Comandos executados; Vitest, lint, types, E2E, build, regressões, browsers e resoluções.
- Evidência visual e/ou textual verificável, sem inventar screenshots.
- Migração de dados/backward compatibility.
- Pendências e aceite do próximo prompt.
