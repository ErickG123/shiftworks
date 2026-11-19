# PROMPT EXP-22 — Auditoria final de regressão, determinismo, testes e performance

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **SW-207 + validação SW-101..SW-206**  
> Prioridade: **P0 gate final**  
> Pré-requisitos: **00..21 conforme escopo executado**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-22. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Confrontar TODAS as entradas da matriz `docs/01-MAPA-DE-REQUISITOS.md` com evidências do código real. Diferenciar CONCLUÍDO / PARCIAL / NÃO INICIADO, inclusive se fases P2 foram adiadas.
- Suite abrangente Vitest de domínio: build drag, topologia, processor/diverter, sensores, FIFO buffer, receitas, pedidos dinâmicos, timing, desbloqueios, achievements, scores e schema/save/migrações; propriedades de conservação de itens, determinismo e estabilidade.
- Suite UI/E2E: navegação L01→L02→L03, tutorials T00/T01, tooltip foco/hover, preview 3D rodando e desmontando, Sandbox, blueprints, vitória, i18n, câmera com Q/E e escopo de atalhos; screenshots reais nas resoluções aprovadas.
- Stress test: simulação por 1000 ticks com buffers, rotas e pedidos; comparar 1×/4×/step ao mesmo tick; medir memoria e renderer.info antes/depois de abrir 20x preview e de 20 transições menu-jogo.
- Revisar vulnerabilidade a `innerHTML` não confiável, import JSON, race conditions de storage, listeners órfãos, perdas de foco e acessibilidade. Validar ci/test scripts e build estático itch.io.
- Não eliminar testes falhando, não inventar métricas e não declarar % de cobertura sem relatório real. Registrar limites do ambiente e problemas conhecidos.

## Testes e provas obrigatórios

- Exigir lint, typecheck, Vitest, E2E, build e smoke de release; com saída real preservada no relatório.
- Tabela com requisito, fase, implementação, testes e aceite por ID. Scripts existentes devem ser reutilizados e CI corrigido se necessário.

## Critérios de aceite desta fase

- Sem regressões críticas conhecidas nos módulos publicados, relatório rastreável com evidências e prioridade para todos os pendentes.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-22-qualidade-regressao-performance.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-22-qualidade-regressao-performance.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
