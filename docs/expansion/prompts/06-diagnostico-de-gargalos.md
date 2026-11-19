# PROMPT EXP-06 — Diagnóstico visual de gargalos e causas de bloqueio

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-109**  
> Prioridade: **P1**  
> Pré-requisitos: **05**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-06. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Especificar tipos de evento/estado: `OUTPUT_BLOCKED`, `WAITING_FOR_INPUT`, `WAITING_TO_SHIFT`, `MISSING_RULE`, `WRONG_DESTINATION`, `BUFFER_FULL`, `DISCONNECTED`, `POSSIBLE_DEADLOCK` (somente o que o motor suportar).
- Derivar alertas por snapshot/eventos reais, não pelo visual do Three.js; criar serviço de diagnóstico puro testável. Identificar componente, porta, item e tick com código e mensagem traduzível.
- Mostrar alertas resumidos no HUD e ícone sobre objeto correspondente; hover/foco abre causa e ação sugerida. Exibir deadlock como hipótese, não vitória/derrota automática.
- Implementar histórico limitado (ring buffer), filtros de criticidade e limiar para evitar spam de avisos repetidos a cada tick.
- Compatibilidade com overlay de fluxo e inspetor sem multiplicar painéis ou bloquear clique nas células.

## Testes e provas obrigatórios

- Unit: testes de cada razão, casos recuperáveis, ausência de falso positivo se máquina apenas muda modo, de-dup por evento/id.
- E2E: criar rota desconectada e identificar componente errado; corrigir e sumir o alerta; pause e step atualizam sem recalcular diferente.

## Critérios de aceite desta fase

- Mensagens úteis e localizadas permitem corrigir a fábrica sem abrir DevTools; alerta condiz com o estado real.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-06-diagnostico-de-gargalos.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-06-diagnostico-de-gargalos.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
