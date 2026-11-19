# PROMPT EXP-08 — Catálogo de equipamentos, tooltips e microdescrições

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-201, SW-202**  
> Prioridade: **P0**  
> Pré-requisitos: **04,07**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-08. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Implementar catálogo tipado com ids `SOURCE`, `CONVEYOR`, `PROCESSOR`, `DIVERTER`, `OUTPUT` e equipamentos futuros só quando implementados, a partir de `docs/02-ESPEC-CATALOGO-TOOLTIP-3D.md`.
- Nome, descrição curta, detalhamento, usos, limitações, porta de entrada/saída, modo de operação, exemplo, origem do desbloqueio e disponibilidade REAL no inventário; chaves de i18n PT-BR default / EN.
- Ao hover na ferramenta (com delay e posicionamento seguro) e no foco de teclado, tooltip claro, sem capturar eventos nem obstruir placement; em HUD compacto deve permitir acesso por botão `?`/informações.
- Distinguir tooltips: peça bloqueada por progresso, sem peças na fase, disponível, selecionada. Evitar mensagens contraditórias como "Processor 0" sem explicação.
- Acoplar botão visível "Ver funcionamento" à infraestrutura de card 3D da próxima fase, inicialmente sem criar preview falso; preferir API interface de `EquipmentHelpPanel` com fallback textual.
- Revisar T00/T01 e objetivos para explicar as peças pelo nome do jogo, não códigos internos. Tooltips não devem disparar compra, desbloqueio ou editar simulação.

## Testes e provas obrigatórios

- Vitest: presença de traduções PT/EN e descrições para todo equipamento do motor, estados indisponível/sem estoque/unlocked, permissão e conteúdo seguro.
- E2E: hover/foco nas ferramentas, ver tooltip e operabilidade via teclado; posicionamento não é afetado; troca idioma atualiza sem recarregar.

## Critérios de aceite desta fase

- Descrição de todas as peças existentes é útil e correta; tooltip acessível e sem travar editor; separação de texto/estado preservada.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-08-catalogo-e-tooltips-educativos.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-08-catalogo-e-tooltips-educativos.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
