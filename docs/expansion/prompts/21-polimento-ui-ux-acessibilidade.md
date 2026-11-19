# PROMPT EXP-21 — Polimento global de gameplay, ajuda, feedback, câmera e resultados

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-206**  
> Prioridade: **P1**  
> Pré-requisitos: **02..20 concluídas ou planejadas, 10,11**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-21. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Revisar experiência do jogador end-to-end, partindo das capturas e feedbacks conhecidos: HUD muito técnico, informações pequenas, tabuleiro central de contraste baixo, nomes crús em inglês, conclusão lateral. Auditar código real e corrigir o que ainda persistir.
- Criar hierarchy de UI: topo objetivo/nível, barra esquerda ferramentas com badges de estoque, centro canvas 3D, lateral contextual com instrutor e inspetor alternável, rodapé compacto Start/Pause/Step/Edit/Reset e dicas. Priorizar espaço 3D, responsividade 1024×768/1280×720/1920×1080.
- Melhorar materiais e silhuetas low-poly de Source, Conveyor, Processor, Diverter, Sensor, Buffer e Output que realmente existem, com animações e estados legíveis; não introduzir arte de terceiros sem licença.
- Pan WASD relativo à orientação, Q/E rotacionam câmera 90°, R rotaciona peças/ghost, Esc cancela, scroll zoom, botão Centralizar; desativar atalhos em inputs/dialog. Se já estiver implementado, testes de regressão.
- Tela de vitória centrada apresenta estrelas, entregues, rejeitados, ticks, shifts, peças, desafio bônus, próxima fase e replay, com foco acessível e todos os dados reais.
- Garantir que card 3D, tooltip, tutorial e overlay de fluxo não se sobreponham nem roubem ações. Estados de feedback sem cores exclusivamente; loaders/erros/fallback para WebGL e armazenamento indisponível.
- Enxugar conteúdo para parecer jogo, não dashboards ou avisos de debug; nenhuma interface deve dizer `CONVEYOR`/`BLUE_BLANK` onde existe label PT/EN.

## Testes e provas obrigatórios

- E2E: sequência L01-L03, Pause/Edit, tooltip, preview, diálogo Vitória, troca idioma no meio da partida, navegação menus, câmera e viewport.
- Capturar comparativos reais nas três resoluções e estimar se UI cobre tabuleiro; inspecionar foco, scroll, zoom, inventário e variação de espaço.

## Critérios de aceite desta fase

- O jogador constrói, programa e entende feedback sem consultar DevTools. UX, 3D e textos visualmente consistentes.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-21-polimento-ui-ux-acessibilidade.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-21-polimento-ui-ux-acessibilidade.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
