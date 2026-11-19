# PROMPT EXP-17 — Pedidos dinâmicos e adaptação automática de produção

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-106**  
> Prioridade: **P2**  
> Pré-requisitos: **14,15,16**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-17. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


## Regras transversais — não negociar

1. Leia **antes de codificar**: `AGENTS.md`, regras/skills válidas de `.agents/`, GDD/SPECs/ADRs/roadmap, auditorias e relatórios da fase anterior. Leia `shiftworks-expansion-prompts/docs/00-PRINCIPIOS-E-REGRAS-EXECUCAO.md` e os documentos aplicáveis neste pacote. Se diretórios forem diferentes no repositório, descubra-os, não invente caminhos.
2. Avalie a implementação real e **não reimplemente** recurso já funcional. Preserve saves existentes (com migração), o motor determinístico, IDs de nível/equipamento, campanha L01/L02/L03, tutoriais, i18n PT-BR/EN, menus e Three.js.
3. Não alterar contratos de domínio para resolver visual nem inventar sucesso de teste; UI e Three.js só consomem estados/eventos corretos do motor. Nenhuma mudança de FPS altera ticks.
4. Arquivos organizados por domínio/feature: `.model.ts`/`.types.ts`/`.constants.ts`/`.config.ts` conforme uso real, `.ts` comportamento, `.html` templates quando apropriado e `.css` estilos. Evite abstrações e dependências inúteis; sem emojis nos elementos da interface.
5. Implementar primeiro um menor fluxo completo verificável, depois expandir. Em mudança de dados persistidos, criar testes e migração idempotente; jamais pedir ao usuário que limpe localStorage para funcionar.
6. Executar os comandos realmente disponíveis (`lint`, `typecheck`, `test`/Vitest, E2E/Playwright, build), informar falhas e limitações honestamente. Fazer screenshots/playtest em browser real quando houver suporte.
7. Atualizar documentação SDD e regras `.agents/` se mudarem as convenções, sem duplicações. Criar relatório da fase com gate explícito e resumo de dependências para próxima execução.
8. Se algum requisito importante não for validado, status PARCIAL. Se uma mudança ameaça a estabilidade da build jogável, interromper a expansão e preservar a versão funcional.


## Escopo específico e instruções de implementação

- Criar `OrderSchedule` determinístico por tick/condição da fase para trocar pedido de produto/quantidade durante execução; todos os agendamentos acessíveis antes de Start em níveis que revelam demanda futura.
- A mudança de demanda deve dar significado à SHIFT: jogador configura sensor/processor/desviador/buffer para adaptar a fábrica sem editar após começar. Evitar pedido aleatório não semeado e impossibilidades criadas por timing.
- UI mostra pedido atual, próximo (se exposto pela fase), countdown por ticks e histórico; alertas localizados, indicação 3D quando muda demanda, sem popups que bloqueiam execução.
- Definir política para itens em trânsito quando novo pedido entra, rejecões e score: por exemplo lote/etapa por produto e inventário de saída por tipo. Documentar no ADR e garantir cálculo sem duplo crédito.
- Construir pelo menos duas fases de SHIFT de produção (uma com sequência previsível e uma com mudança por evento) COM soluções de referência e thresholds calibrados. Se complexo, implementar uma fase antes de ampliar.
- Achievement `NO_HANDS` só é concedido em sucesso realmente autônomo; não exigir que a pessoa clique rápido para trocar máquina.

## Testes e provas obrigatórios

- Unit: evento no tick previsto, contagem por pedido, output após mudança, itens pendentes, empate de prioridades, replay 2× e step-by-step idêntico.
- E2E: linha reage ao pedido sem intervenção, finaliza metas e tela de resultados explica tempos e shifts.

## Critérios de aceite desta fase

- Fábrica responde automaticamente a mudança válida de demanda; dois pedidos distintos por execução comprovados por testes.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-17-pedidos-dinamicos-production-shift.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-17-pedidos-dinamicos-production-shift.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
