# VIS-001 — Visão do produto

**Status:** baseline aprovada para planejamento da jam.  
**Alinhamento:** `docs/design/GDD.md`; deadline alvo 01/12/2026.

## Problema e oportunidade

Jogos de automação tendem a crescer em escala e gestão. SHIFTWORKS concentra a satisfação da automação em tabuleiros pequenos, nos quais a mesma infraestrutura precisa **mudar de comportamento** em resposta aos insumos. O usuário cria, testa, observa e otimiza.

## Público-alvo

Jogadores desktop de puzzles lógicos, programação visual, fábricas e optimization games. Projetado para funcionar com mouse e teclado, sem conhecimento de programação ou modelagem 3D.

## Proposição de valor

> Construa uma fábrica pequena e inteligente: em vez de clonar máquinas, ensine-as a mudar de função e de caminho automaticamente.

## Princípios de experiência

1. Entender a regra de SHIFT em menos de um minuto ao observá-la.
2. Construção rápida e reversível no modo de edição.
3. Diagnóstico explícito: todo bloqueio tem motivo compreensível.
4. Múltiplas soluções, nenhuma configuração escondida necessária.
5. Apelo visual produzido por geometria e animações, não por assets artísticos caros.

## MVP de prova (vertical slice)

No grid 8×8, Source alterna `BLUE_BLANK` e `AMBER_BLANK`; player conecta Conveyor, Processor, Diverter e dois Outputs; configura 4 condições; `Start` produz `3 CUT_PLATE` e `3 PRESSED_BLOCK` sem cliques adicionais; HUD conclui a fase e permite replay.

## Entrega-alvo da competição

3 fases didáticas, Sandbox simples sob gate, menu/resultado, áudio opcional, persistência leve para progresso, release estático itch.io. Uma demonstração polida com 1 fase completa **tem precedência** sobre 3 fases instáveis.

## Fora do escopo

Backend, login, cloud sync, analytics externo, multiplayer, árvores tecnológicas, energia complexa, economia financeira, multiplayer, robôs autônomos, infinito procedural, física de rigid bodies e mobile touch como requisito.

## Métricas de sucesso observáveis

- Playtester inicia a produção e entende por que processador comuta automaticamente.
- Completa a primeira entrega sem ajuda verbal após breve tutorial.
- Mesmo layout e input geram mesma saída e eventos em rodadas repetidas.
- Nenhum bug de duplicação/perda de itens em casos de teste.
- Build HTML5 abre diretamente na página pública do itch.io.

## Restrições operacionais

Janela curta para jam; priorizar P0, depois P1. Identidade visual original com primitivas. Compatibilidade desktop com 1280×720 como mínimo de layout. Sem envio de dados do jogador para serviços remotos.
