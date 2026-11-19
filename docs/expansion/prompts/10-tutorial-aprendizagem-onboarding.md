# PROMPT EXP-10 — Tutorial guiado, lições interativas e ajuda contextual

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-204**  
> Prioridade: **P0**  
> Pré-requisitos: **08,09,02**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-10. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Auditar T00/T01 reais e reorganizar curso progressivo: T00 controles (selecionar, colocar, R, remover, Start/Pause/Edit); T01 entrega (source, conveyor, dock, direção); LIÇÃO Processor L02 (blue→CUT amber→PRESS); LIÇÃO Diverter L03 (regras e saídas). Não renumerar IDs existentes; o tutorial é acessível novamente pelo menu e durante gameplay.
- Para cada passo: introdução de no máximo 2 frases; alvo da UI/mesh; ação esperada checada por evento genuíno do estado; feedback após realizar; Next/Back/Skip e estado de retomada. No `R`, só concluir ao detectar rotação efetiva da peça/ghost, não por keydown ignorado.
- Incorporar `?`/"Como funciona?" com preview da fase 09 para peça relevante, mas não exigir que o jogador abra card para ganhar tutorial; teach by doing, evitar tela cheia textual.
- Onboarding adaptativo: se usuário já concluiu uma lição, pode revisar; sem bloquear campanha; permitir resetar tutorial independentemente do save do progresso principal, com confirmação.
- Estabelecer UI "Objetivo atual", checklist de tarefas, realce e feedback de erro contextual; panel pequeno recolhível, respeita canvas; impedir overlay de capturar click/atalho que precisa executar.
- Status de tutorial distingue `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`; Skip não credita achievement de conclusão; persistir versionado, corrigir estado em retorno ao menu.
- Garantir PT-BR/EN em cada passo, inclusive L02/L03, sem códigos internos e com legendas de atalhos correspondentes aos atalhos reais.

## Testes e provas obrigatórios

- E2E guiado T00: colocar → pressionar R → rotação efetiva → remover → Start. T01 entrega; abrir preview de Processor a partir de lição L02; Pause/Edit e retomada sem travar botões.
- Unit: step state machine não pula ações, Back/Skip/replay e persistência, localizações de todas as instruções e associação com itens.

## Critérios de aceite desta fase

- Primeiro jogador consegue executar T00/T01 sem intervenção do desenvolvedor; tutoriais não travam ferramentas nem simulador.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-10-tutorial-aprendizagem-onboarding.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-10-tutorial-aprendizagem-onboarding.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
