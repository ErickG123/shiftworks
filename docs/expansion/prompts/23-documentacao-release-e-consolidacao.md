# PROMPT EXP-23 — Consolidação SDD, release seguro e estratégia pós-jam

> Projeto: **SHIFTWORKS**, Vite + TypeScript + Three.js; expandir o jogo de automação 3D com SDD.  
> Requisitos: **todos os SW, documentação e publicação**  
> Prioridade: **P0/P2**  
> Pré-requisitos: **22**

## Missão

Você é o agente responsável pela **implementação real** da fase EXP-23. Não responda somente com plano. Audite o código real, implemente, integre, valide e documente; evite mexer no que já está correto.


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

- Consolidar GDD, SPECs e ADRs incluindo mudanças de design, descrevendo jogabilidade REAL existente; não editar relatórios históricos nem copiar planos como implementação concluída.
- Atualizar README, controles (WASD/Q/E/R/zoom se confirmados), ferramenta de ajuda, modos e fotos reais; CHANGELOG, LICENSE, créditos/licenças, declaração de IA onde exigida e guia de contribuição se útil.
- Gerar roadmap pós-jam com fases P2 pendentes, riscos, custos e priorização; preservar build já publicável com tags/feature flags se necessário. Não sacrificar baseline da game jam por sensor/receita não terminados.
- Verificar política oficial atual do Game Off e exigências da plataforma de submissão antes da publicação. Não presumir prazo/localização temporal no script; registrar quando revisado.
- Testar build de produção servida estaticamente, sem servidor de desenvolvimento ou APIs internas, clicabilidade em itch.io e viewport de embed, áudio permitido pelo navegador, save e cena Three.js; reportar o que não pôde ser testado.
- Revisar arquivos em `.agents/` e AGENTS.md: remover duplicatas/desatualizações, atualizar matrizes de leitura e critérios de validação de fase. Consolidar checklists redundantes em um sumário de testes com links e resultados reais.

## Testes e provas obrigatórios

- Smoke em build de produção: menu → tutorial → campanha L01→L02→L03 (se publicadas) → vitória → reload progresso; Sandbox e 3D cards se publicados.
- Checar referências e links Markdown, manifest de dependências, licenças, imagens e size build. CI green se disponível; caso contrário reportar bloqueio.

## Critérios de aceite desta fase

- Pacote de lançamento documentado e testado; backlog honesto de expansão não concluída; nenhuma alegação de envio efetivo sem confirmação.

## Entregáveis SDD desta execução

- Criar/atualizar **docs/audits/AUDIT-EXP-23-documentacao-release-e-consolidacao.md** com diagnóstico baseado no repositório e diferença para a baseline anterior.
- Criar/atualizar **docs/reports/REPORT-EXP-23-documentacao-release-e-consolidacao.md** usando `shiftworks-expansion-prompts/templates/REPORT-EXP-TEMPLATE.md`; incluir tabelas requisito → mudança → teste → evidência, arquivos, comandos, bugs resolvidos, riscos e status.
- Atualizar SPEC, ADR, GDD, matriz de rastreabilidade e `.agents/` somente onde realmente afetados. Nunca reescrever relatórios históricos como se fossem desta fase.
- Ao terminar, entregar um resumo curto com **CONCLUÍDO / PARCIAL / BLOQUEADO** e motivo; incluir caminho dos relatórios e próximos passos reais. Para iniciar a fase seguinte, ela deve primeiro LER este relatório e verificar gates.

## Gate de saída para avançar

- Os critérios acima foram demonstrados (testes e, para UI, comportamento observável), sem regressões críticas em L01–L03.
- Build compilou, testes de regressão afetados foram executados, migrações passaram e o estado da documentação reflete o que EXISTE, não o que foi idealizado.
- Se houve limitação de tempo/ambiente, manter status PARCIAL e pendências precisas; não afirmar que está 100%.
