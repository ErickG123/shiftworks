# Progressão, unlocks e conquistas — regras propostas

## Setores e desbloqueio

- Setores: fundamentos (01–04), eficiência (05–08), inteligente (09–12), avançada (13–16), SHIFT Master (17–20).
- Campanha abre em L01, salvo progresso anterior válido.
- Para `Lnn`, requisito de acesso é concluir `L(n-1)`; L01 sem requisito. Se L03 concluída num save antigo, L04 já deve estar disponível.
- Equipamento se torna conhecido no tutorial/fase de introdução: Conveyor L01, Processor L02, Diverter L03, Buffer L05, Sensor L09, Splitter L10, Merger L11, Assembler L14.
- `unlocked` global não equivale a orçamento disponível na fase. Uma peça pode estar desbloqueada e ter estoque 0 nessa missão.
- Conquistas são extras; a campanha principal **não** depende de badges/estrelas para avançar.
- Setores concluídos podem liberar badges, sandbox presets e desafios bônus, com recompensa clara e persistência idempotente.

## Pontuação

- 1 estrela: objetivos completos sem cheat; rejeições não impedem vitória se regras da fase permitirem.
- 2 estrelas: terminar dentro de threshold de ticks/calibrado e cumprir objetivo principal.
- 3 estrelas: tempo, orçamento e rejeições dentro de limites medidos em fixture; nunca publicar 3★ impossível.
- Melhor marca por fase: comparação determinística e estável; resultado pior nunca sobrescreve melhor.
- Métricas sugeridas: ticks, produtos, trocas SHIFT, componentes colocados, throughput, rejeições, congestionamentos, wave IDs.

## Achievements

Auditar e manter as 8 conquistas já relatadas em `achievements.model.ts` antes de adicionar novas. Não duplicar IDs/recompensas; triggers devem vir dos eventos reais de motor (entrega, conclusão de fase, setor, zero rejeições, operação automática, etc.). `achievements` não devem ser concedidas por visualizar layout, importar save ou selecionar botão.

## Migração

- Versionar payload, validar schema e fallback para dados parciais/corrompidos.
- `completedLevelIds` L01–L03, `unlockedLevelIds`, `bestScores`, `tutorialCompleted` e preferências PT-BR/EN permanecem intactos.
- Rodar testes com save antigo, novo e payload inválido; nunca apagar dados reais do jogador durante migração.

## Critérios E2E

Completar L03 deve liberar L04; L04 L05; repetir L01 não desbloqueia além do necessário; derrotas não liberam próximo; tela de seleção com cards reais e status coerente; refresh preserva progresso; Sandbox separado.
