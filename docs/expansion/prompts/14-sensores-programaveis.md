# PROMPT EXP-14 — Sensores independentes e regras visuais de automação

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-104**  
> Prioridade: **P2**  
> Pré-requisitos: **01,05,06,11**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-14. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Criar sensor como novo componente de domínio com posição, portas, orientação, alcance de leitura (célula/adjacente conforme ADR), capacidade e ação sobre alvo autorizado. Sem retórica de sensores remotos não implementados.
- Regras visuais simples: `IF item.type == BLUE_BLANK THEN set PROCESSOR to CUT`; `IF count >= N THEN set DIVERTER to route A`; condições e ações com validação tipada, prioridades explícitas e limites por nível.
- Definir momento do sinal por tick: observação em t, efeito em t+1 (ou ADR equivalente), sem dependência de FPS; relação com processor switch delay e backpressure. Não permitir target desaparecido, conexão impossível ou regra em conflito sem explicação.
- Renderizar sensor low-poly procedural, indicação de alcance/cabo lógico se existir, pulso e LED de estado. Modelos no catálogo, tooltip e card 3D animado; fase tutorial de controle após engine pronta.
- L01–L03 não exigem sensor nem são alteradas silenciosamente. Feature flag e inventário por fase para não mostrar botão "funciona" antes de integração completa.

## Testes e provas obrigatórios

- Vitest: sinais com entrada/sensor em posições variadas, comparação por tipo, contador, conflitos, tick de aplicação e pausa; 100 ticks sem item duplicado.
- E2E: programar sensor na fase de controle, observar comando acionando máquina, fluxo concluindo pedido sem interação manual após Start.

## Critérios de aceite desta fase

- Sensor controla componente real e é depurável via overlay, inspetor e tutorial, sem romper determinismo.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-14-sensores-programaveis.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-14-sensores-programaveis.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
