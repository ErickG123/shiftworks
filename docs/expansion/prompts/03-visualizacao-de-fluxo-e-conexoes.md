# PROMPT EXP-03 — Overlay de fluxo e auditoria visual de conexões

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-102**  
> Prioridade: **P1**  
> Pré-requisitos: **02**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-03. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Criar modo overlay Liga/Desliga para fluxo: setas nas esteiras, portas de entrada/saída, rotas de item previstas e conexões incompatíveis com motivo em tooltip.
- Usar exclusivamente topology e estado reais do motor; nunca calcular caminho fictício pela aparência dos meshes. Caso desviador/programação impeça traçar rota estática exata, mostrar possibilidades e indicar "condicional", sem prometer destino garantido.
- Destaque discreto para trecho desconectado, direção invertida, saída bloqueada, falta de regra e dead end. Diferenciar alertas por pictogramas e texto para acessibilidade.
- Otimizar draw calls via batching/instancing quando necessário, escondendo overlays fora da área visível e mantendo seleção/raycast correto.
- Combinar sobreposição de fluxo com ghost de construção, inspeção e câmera sem input conflitante; botão/atalho visível e tradução de todas as legendas.

## Testes e provas obrigatórios

- Testes unitários para topologia: conectável/incompatível, curva, diverter condicional, célula sem saída e rota bloqueada.
- E2E: alternar overlay durante edição/execução e ao trocar de fase; estados reais batem com indicadores; não bloquear clique para instalar máquinas.

## Critérios de aceite desta fase

- Fluxo visível e semanticamente correto, diagnósticos ancorados no tabuleiro, FPS sem regressão inaceitável e overlay desligável.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-03-visualizacao-de-fluxo-e-conexoes.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-03-visualizacao-de-fluxo-e-conexoes.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
