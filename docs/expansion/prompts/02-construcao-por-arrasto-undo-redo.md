# PROMPT EXP-02 — Construção de esteiras por arrastar, ghost, rotação, Undo/Redo

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-101**  
> Prioridade: **P0**  
> Pré-requisitos: **00,01**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-02. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

### Interação 3D
- Implementar clique+arraste contínuo sobre células válidas via raycasting em viewport Three.js; criar preview fantasma mostrando **toda rota** antes de confirmar. Respeitar direção atual da câmera, pan WASD/Q/E, zoom, limites do grid e UI sobreposta.
- Planejar rota pelo grid com política documentada: linha reta quando simples, mudanças ortogonais via segmentos em ângulo, bloqueios e ocupação. Não prometer pathfinding A* se escopo não justificar; explicitar rota de menor custo ou desenho manual por cursor de células.
- Validar orçamento de esteiras antes de efetivar operação inteira (commit atômico ou versão parcial com mensagem explicativa). Prévia deve indicar custo, peças disponíveis, conflitos, direção e entrada/saída.
- Corrigir `R` para rodar ghost e peça selecionada em EDITING; `Esc` cancela; right click remove se permitido; atalhos ignorados em campos, modal, tutoriais quando comandos não válidos.
- Agrupar placement/remoção/rotação por transações de edição; Ctrl+Z/Ctrl+Y reverte/reaplica sem perder o inventário. Se histórico limitado, documentar máximo e reset após modo de execução conforme design.
- Não permitir construir no estado RUNNING/PAUSED: após Pause, opção **Editar** deve oferecer reiniciar tentativa preservando layout e regressão válida.

## Testes e provas obrigatórios

- E2E: arrastar 6 esteiras em L01, conectar fonte-doca, confirmar, Start, completar objetivo. Reverter/reaplicar retorna inventário e portas corretas.
- Unit: path constraints, orçamento insuficiente, bloqueio, orientação em curva, zero alteração até soltar cursor, gesto fora do canvas e cancelamento.
- E2E com Q/E + zoom: seleção e preview continuam alinhados; `R` funciona em T00, sem focos indevidos; handlers não duplicam após navegação.

## Critérios de aceite desta fase

- Construção contínua verificável na cena, preview correto, sem peças fantasmas residuais; Undo/Redo atômico; L01 continua vencível e Engine imutável.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-02-construcao-por-arrasto-undo-redo.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-02-construcao-por-arrasto-undo-redo.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
