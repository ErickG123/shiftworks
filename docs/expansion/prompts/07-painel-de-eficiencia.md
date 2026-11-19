# PROMPT EXP-07 — Painel de eficiência e métricas honestas

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-110**  
> Prioridade: **P1**  
> Pré-requisitos: **05,06**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-07. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Definir no ADR o significado de eficiência, throughput, utilização, tempo total, shifts, rejected, delivered, peças utilizadas, consumo de orçamento e o tratamento de denominador zero. Não inventar "85%" como métrica sem fórmula.
- Adicionar agregador determinístico de métricas a partir de snapshot/eventos de engine, com estado único compartilhado pelo HUD, vitória e recorde.
- Painel compacto durante execução (quando expandido) e relatório detalhado após vitória; plotar séries por tick apenas se houver ganho concreto e custo aceitável, no máximo histórico limitado.
- Destacar gargalos por tempo ocioso e ciclos de SHIFT, incluindo recomendações explicáveis "Este Processador gastou X ticks mudando de modo", sem IA e sem heurísticas mágicas.
- Internacionalização PT/EN e unidades/casas decimais coerentes; evitar poluir a tela central com números.

## Testes e provas obrigatórios

- Vitest fórmulas com cenários de produção zero, rejeição, mudanças de modo, pausa, replay e término.
- Validação de determinismo: mesma seed/layout após N ticks gera mesmas métricas; reload preserva melhor pontuação e não altera resultados atuais.

## Critérios de aceite desta fase

- Métricas explicadas por fórmula, calculadas pelo motor real e reproduzíveis; nenhuma métrica decorativa.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-07-painel-de-eficiencia.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-07-painel-de-eficiencia.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
