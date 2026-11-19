# PROMPT EXP-18 — Projetos/blueprints de fábrica e reaproveitamento

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-113**  
> Prioridade: **P2**  
> Pré-requisitos: **02,11,15,16**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-18. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Definir serialização tipada de blueprint (id, schemaVersion, title, components, positions relativas, orientations, rules, requisitos de desbloqueio, gridBounds, version), separando de save de progresso.
- Permitir Salvar seleção/layout, listar, nomear, renomear, duplicar, deletar (com confirmação), pré-visualizar ghost e aplicar se espaço/inventário/limites do nível permitirem.
- Aplicação deve ser transação atômica ou apresentar modo de inserção parcial explícito, sem peças fantasma e sem bypass de limites/cadeados. Não permitir itens dinâmicos da simulação como parte de blueprint.
- Usar `localStorage` versão compatível, verificar limites de tamanho/erros, proteger contra JSON malformado, dados inesperados, IDs duplicados e tipos de equipamento não suportados; export/import JSON opcional apenas se core estiver sólido.
- Editor suporta Undo/Redo na aplicação do blueprint; o jogador pode reutilizar no Sandbox e onde fase permitir. Conquista de primeiro blueprint só após salvar/aplicar validamente.

## Testes e provas obrigatórios

- Unit: round-trip, migração, validação e rejeição de blueprint inválido, falta de estoque, conflito de células, feature bloqueada e undo atômico.
- E2E: construir layout → salvar → limpar → aplicar → produzir; persistir após reload, sem alterar `campaignProgress`.

## Critérios de aceite desta fase

- Blueprints reutilizáveis com validação transparente, consistentes em saves e sem violar regras de fase.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-18-blueprints-de-fabrica.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-18-blueprints-de-fabrica.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
