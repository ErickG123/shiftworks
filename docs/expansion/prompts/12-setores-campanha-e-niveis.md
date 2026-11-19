# PROMPT EXP-12 — Campanha por setores e expansão de níveis com conteúdo validado

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-111**  
> Prioridade: **P2**  
> Pré-requisitos: **11,07**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-12. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Reorganizar a **apresentação** da campanha por setores temáticos sem migrar/renumerar L01-L03. Proposta: Logística, Processamento, Roteamento, Controle, Adaptação, Otimização.
- Adicionar metadados de setor, aprendizagem introduzida, lista de levels, disponibilidade de equipamento, descrição/localização PT/EN, objetivos e requisitos de unlock. Level cards devem mostrar "o que vou aprender" e "por que está bloqueado".
- Elaborar novas fases de maneira incremental e **com prova de solubilidade automática**: L04 controle de fluxo com constraint, L05 sensor, L06 buffer, L07 receitas, L08 demanda variável, L09 otimização (nomes ilustrativos, ajustar ao que já existe e só publicar se feature implementada).
- Diferenciar level tutorial, obrigatório de campanha, side challenge e sandbox; evitar que conteúdo ainda em desenvolvimento apareça como jogável. Conteúdo flag desativada pode aparecer "Em breve" apenas se fizer sentido para uma versão publicável.
- Garantir que desbloqueio de setor usa vitórias reais de níveis obrigatórios anteriores; as conquistas e estrelas são complementos, não paredes arbitrárias.
- Construir mapa ou grade de níveis com visual de jogo, setas de progressão e acessibilidade teclado; não sobrecarregar UI com menus administrativos.

## Testes e provas obrigatórios

- Testes de schema de nível: ids únicos, saídas e receitas válidas, estoque e obstruções, sem pré-requisitos cíclicos e sem desbloqueio impossível.
- Teste determinístico de **solução de referência** de toda fase publicada: montagem → regras → execução N ticks → vitória, evitando níveis impossíveis.
- E2E: entrar numa fase por setor e concluir, desbloquear próxima, navegar setores e recarregar preservando progresso legado.

## Critérios de aceite desta fase

- Campanha por setores com conteúdo real e validado; L01-L03 compatíveis e nenhum nível publicável sem solução testada.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-12-setores-campanha-e-niveis.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-12-setores-campanha-e-niveis.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
