# PROMPT EXP-01 — Especificações da expansão, contratos e manutenção de .agents

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-101..SW-207**  
> Prioridade: **P0**  
> Pré-requisitos: **00**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-01. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

### Contratos e SDD
- Criar/adaptar SPECs individuais para construção, simulação/debug, catálogo 3D, tutorial, progressão, sensores/receitas/buffers/pedidos e Sandbox, com requisitos, invariantes e critérios de aceite SMART.
- Atualizar GDD/roadmap preservando escolhas existentes, diferenciando P0 jogável de P2 pós-jam, com matriz do `docs/01-MAPA-DE-REQUISITOS.md`.
- Identificar e consolidar types/interfaces constantes discriminadas já existentes, sem refatoração de massa desnecessária; definir contratos para BuildTransaction, EquipmentInfo, PreviewLifecycle, TickEvent, UnlockRule, AchievementRule, LevelScore e SaveVersion, alinhando aos tipos reais do projeto.
- Decidir ADR sobre DOM templates e 3D preview isolated, engine events vs UI, persistência/migração, progressão baseada em sucesso real e escopo dos modos.
### Governança dos agentes
- Auditar as regras reais de `.agents/rules` e `.agents/skills`/`AGENTS.md`, checar reconhecimento real por Codex. Consolidar padrões em vez de criar duplicatas: SDD sequencial; leitura do relatório da fase anterior; sem overengineering; serviços Three.js isolados; i18n PT-BR default + EN; `.model.ts`/`.types.ts`/`.constants.ts`/`.config.ts`; `.html/.css/.ts` quando fizer sentido; testes e evidências.
- Criar/atualizar skill curta para auditoria e execução faseada APENAS se a convenção do repositório suportar. Linkar do `AGENTS.md` sem tornar toda a documentação repetitiva.
### Plano de dados
- Definir versões de save com migração incremental e testes para save antigo L01–L03, progresso de tutorial, stars, achievements e blueprints.
- Desenhar IDs estáveis (independentes de tradução), compatibilidade dos dados existentes e desativação segura de features ainda não prontas.

## Testes e provas obrigatórios

- Testes de tipos, importações e módulos de invariantes propostos; checar circular dependencies se viável.
- Validar rastreabilidade entre SPEC ↔ IDs SW ↔ prompts ↔ gates.
- Provar por fixture que save antigo é preservado ao migrar, sem limpar localStorage como workaround.

## Critérios de aceite desta fase

- SPECs/ADRs e .agents coerentes, sem comandos falsos ou referências quebradas; esquema de eventos/serialização documentado; aceite do motor preservado.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-01-especificacao-contratos-e-governanca.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-01-especificacao-contratos-e-governanca.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
