# SHIFTWORKS — Plano de validação da expansão

## Testes obrigatórios de cada competência

| Competência | Cenário de aceitação no navegador ou motor |
|---|---|
| Construção | L01 com arrasto: seis segmentos conectados, Undo e Redo, Start entrega correta |
| Simulação | Pausa + 1 tick executa uma transição; repetição em 1×/4× resulta no mesmo snapshot após N ticks |
| Fluxo | Setas refletem rota/portas do motor, inclusive Q/E e zoom; overlay desativável |
| Máquina | Processor L02 aceita BLUE/AMBER no modo certo; inspetor mostra erro de saída bloqueada |
| Tooltips | Hover e foco mostram ajuda PT/EN, IDs não aparecem crus, falta de estoque distinta de bloqueio |
| Card 3D | Clique em informação abre preview Three.js animado, pausa e fecha Esc, 20 aberturas não geram loops/canvas órfãos |
| T00/T01 | Passos de tutorial só completam depois da ação real, R gira objeto e não dá falsa conclusão |
| Progressão | L01 desbloqueia L02, L02 desbloqueia L03, reload preserva, tentativa pior não revoga progresso |
| Conquistas | Evento de motor concede uma vez; Skip tutorial não concede graduação; conquistas P2 não concedidas antes da feature |
| Sensores | Regra programada dispara no tick correto; conflito de regra gera validação, sem race ligada a animação |
| Receitas | CUT/PRESS antigas preservadas; 2 novas operações de cadeia sem items fantasmas |
| Buffers | FIFO em cheia/vazia/saída bloqueada, 1000 ticks sem perdas/duplicações |
| Pedidos | Troca determinística durante produção, fábrica vence sem interação manual, métricas corretas |
| Blueprints | Aplicação atômica com limites, undo, schema/version e import inválido seguro |
| Sandbox | Layout maior com construção, saída, câmera, save próprio, nenhum desbloqueio indevido da campanha |
| Score | 0-divisão guardado, critérios explicados, melhores pontuações não se perdem após replay |
| Conteúdo | Toda fase publicada possui solução de referência até vitória, sem inventário impossível |
| i18n | PT-BR default em primeira abertura; troca EN não perde state, textos de tutoriais, itens, achievements, modais 3D traduzidos |
| Integridade | Menu→Jogo→Menu 20 vezes sem render loops duplicados; recursos Three.js descartados e renderer.info observado |

## Capturas e verificações de layout

- Desktop mínimo: 1024×768; alvo primário: 1280×720 e 1920×1080. Verificar menu, gameplay, card 3D, menu de níveis, tutorial e tela vitória.
- Capturas com **caminhos reais dos arquivos gerados por testes**, sem imagem de referência sintética sendo tratada como implementação.
- Perf não precisa alcançar FPS rígido em todos os equipamentos: registrar medição real, hardware/browser do teste e regressão observada; manter simulação determinística.
- Resolver bugs da base antes de adicionar features P2 que dependam de motor confiável.

## Dados e testes de migração

- Caso A: perfil novo sem `localStorage`.
- Caso B: save pré-expansão com L01 concluída, L02 desbloqueada, 3 estrelas e idioma EN.
- Caso C: save com tutorial SKIPPED ou parcial.
- Caso D: progresso com dados desconhecidos/corrompidos — fallback seguro sem apagar outras preferências.
- Caso E: save de blueprint e achievements em versão antiga — migração idempotente.

## Definition of Done

- Código integrado, recursos acessíveis pelo menu, i18n completo, salvamento compatível, testes PASSANDO ou falha classificada com evidência, documentação atualizada e screenshots reais se browser suportar.
- "Compila" ou "foi criado" isoladamente não equivale a concluído.
