# PROMPT EXP-19 — Sandbox expandido e experimentação livre

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-114**  
> Prioridade: **P2**  
> Pré-requisitos: **18,15,16,17**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-19. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Expandir Sandbox reutilizando mesmos componentes do motor e editor; permitir dimensões 8×8/10×10/12×12 (ou ajustes realistas após testes de FPS), múltiplas fontes e saídas com parâmetros de emissão/objetivos simulados.
- Ao mudar tamanho do terreno, validar layout pré-existente, preservar peças válidas, pedir confirmação sobre peças fora da nova área e oferecer desfazer quando viável; não criar múltiplas engines concorrentes.
- Ferramentas de Sandbox: limpar, carregar exemplo, salvar projeto, aplicar blueprint, controlar velocidade/passo por tick, observabilidade e presets; disponibilidade de equipamentos pode ser ampla, porém peças ainda não implementadas devem permanecer indisponíveis/identificadas.
- Modo gratuito de experimentação não concede conquista de conclusão de campanha. Decidir explicitamente quais conquistas sandbox podem ganhar, evitando exploits.
- Otimizar Three.js para terrenos maiores com instancing ou geometry pooling onde necessário, raycasting consistente com câmera, sem render de objetos invisíveis.

## Testes e provas obrigatórios

- Unit: resize/limites, placement/reconciliação, alteração fonte, save/loading, isolation do progresso de campanha.
- E2E: iniciar Sandbox, construir com sensores/buffers, salvar/reabrir e rodar simulação; medir FPS no ambiente real sem prometer número universal.

## Critérios de aceite desta fase

- Sandbox permite criar automações sem objetivo obrigatório e persistir experiências, sem danificar campanha.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-19-sandbox-expandido.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-19-sandbox-expandido.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
