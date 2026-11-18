# QA-001 — Plano de testes executáveis

> Todos os casos abaixo são **planejados**, não executados. Preencher resultados reais nos relatórios e na matriz de rastreabilidade.

## Unidade e integração — engine e editor

| ID | Área | Caso | Saída esperada |
|---|---|---|---|
| TC-000 | Fundação | Renderizar status da engine e fallback quando WebGL não está disponível | Estado de scaffold explícito; falha WebGL não deixa a página em branco |
| TC-001 | Grid | Coordenadas fora dos limites | Rejeita placement, estado intacto |
| TC-002 | Grid | Colocar em célula ocupada | CELL_OCCUPIED |
| TC-003 | Editor | Remover fixed Source | FIXED_COMPONENT |
| TC-004 | Editor | Rotacionar 4 vezes | Orientação original, ports compatíveis |
| TC-005 | Portas | Porta sem vizinho compatível | Item aguarda; diagnóstico, sem teleport |
| TC-006 | Tick | Mesma fixture N steps em 2 runs | Snapshots e eventos equivalentes |
| TC-007 | Fluxo | Dois itens no mesmo destino | Reserva única, deterministic tie-break |
| TC-008 | Fluxo | Destino bloqueado por 10 ticks | Item persiste e não se duplica |
| TC-009 | Source | Bloqueio de emissão | Sequence não avança; emite mais tarde |
| TC-010 | Source | Emissões intercaladas | BLUE/AMBER estáveis, IDs determinísticos |
| TC-011 | Processor | BLUE com default CUT | 3 ticks process, produz CUT_PLATE |
| TC-012 | Processor | BLUE com default PRESS | 2 ticks shift + 3 process, CUT_PLATE |
| TC-013 | Processor | AMBER após BLUE | Nova comutação, PRESSED_BLOCK |
| TC-014 | Processor | Saída bloqueada após process | Mantém produto pronto sem reprocessar |
| TC-015 | Rules | Condições duplicadas | Erro de configuração; Start bloqueado |
| TC-016 | Rules | Sem match para insumo | ITEM held, RULE_MISSING |
| TC-017 | Diverter | A=frente, B=direita após rotação | Ports corretos, sem destino mágico |
| TC-018 | Outputs | Tipo incorreto | Reject+1, meta não avança |
| TC-019 | Goals | Entrega parcial | Não vence prematuramente |
| TC-020 | Goals | Todas as metas concluídas | Uma transição para RESULT |
| TC-021 | Session | RUNNING→PAUSED→RUNNING | Tick só aumenta em RUNNING |
| TC-022 | Session | Edit após running | Layout/regras preservados, itens resetados |
| TC-023 | Level | L01 referência | Goal completo dentro do limite teste |
| TC-024 | Level | L02 referência | Goal completo com modo alternado |
| TC-025 | Level | L03 referência | 3 CUT_PLATE A + 3 PRESSED_BLOCK B |
| TC-026 | Storage | Bloqueio/quota/corrupção | fallback sem crash |
| TC-027 | Inventory | Limite atingido | Não coloca peça; contagem correta |
| TC-028 | Runtime | FPS baixo / pausa tab | No duplicate steps; engine continua determinística |
| TC-029 | Grid/world | Centros e limites de todas as células | Transformação reversível; coordenadas externas retornam fora do grid |
| TC-030 | Picking | Raycast com objetos decorativos próximos | Seleciona apenas collider de célula com coordenada válida |
| TC-031 | Camera | Wheel em limites de zoom e viewport resize | Zoom fica no clamp; frustum acompanha a proporção do canvas |
| TC-032 | Editor | Place válido, rotação N→E→S→W→N e remove | Estado muda de forma imutável; inventário decrementa e retorna ao remover |
| TC-033 | Editor | CellOccupied, OutOfBounds, FixedComponent, InventoryExceeded e RUNNING | Cada comando é recusado com código estável e mensagem clara na UI |
| TC-034 | Ports | Source/conveyor/output e saídas laterais do diverter | Ports adjacentes só conectam quando posição e orientação coincidem; sem cabos |
| TC-035 | Editor UI | Toolbar por mouse, direção, ghost válido/inválido e inventário | Ferramentas e preview visíveis; portas identificadas; layout usável a 1280×720 |
| TC-036 | Simulation | Mesmo layout e 12 ticks em duas sessões | Snapshots e eventos serializados são idênticos |
| TC-037 | Session | Start→Pause→Resume→Edit→Reset | Modos válidos; Edit/Reset zeram runtime e preservam layout |
| TC-038 | Events | Dois eventos criados no mesmo tick | Sequence inicia em zero e cresce pela ordem produzida |
| TC-039 | Reservation | Propostas invertidas competem pelo mesmo destino | Mesmo vencedor por prioridade canônica; capacidade não excede um |
| TC-040 | Level/session | Goal incompatível, coordenada duplicada e regra repetida | Layout rejeitado com erros tipados antes de iniciar a sessão |
| TC-041 | Rendering projection | Item em slot de componente | Snapshot projeta item para célula correta sem mutar o estado do motor |
| TC-042 | Visual | Interpolar movimentos entre snapshots | Transformação visual suavizada sem mutar snapshots nem avançar ticks |

## E2E navegador

| ID | Jornada | Aceite |
|---|---|---|
| E2E-001 | Home → L01 → placement → Start → Result | Tutorial e controle consistentes |
| E2E-002 | L03 → regras → Start → goal | Mesma vertical slice P0 end-to-end |
| E2E-003 | RUNNING → Pause → Edit → Reset | Sem contagem residual e UI íntegra |
| E2E-004 | 1280×720 e 1920×1080 | HUD, toolbar e inspector visíveis |
| E2E-005 | Navegar somente com teclado pelos painéis | Foco e labels corretos, sem Space involuntário |
| E2E-006 | Reload com localStorage indisponível | Jogo segue funcional |
| E2E-007 | Abrir `dist/` por servidor estático | Sem dependência do dev server |
| E2E-008 | Clicar dentro do iframe público itch.io | Input, audio activation e resize corretos |
| E2E-009 | Sound starts muted → explicit enable → mute | Sem áudio antes do gesto; volume e mute acessíveis |

### Implementação E2E adicionada na Fase 08

- `E2E-002`: `e2e/l03-victory.spec.ts` constrói o caminho de referência por interações no canvas, configura Processor/Diverter, inicia e aguarda a tela de resultado. `npm run test:e2e` usa Playwright; execução e evidência estão registradas no relatório da fase, sem inferir sucesso a partir da existência do teste.

### Implementação E2E adicionada na Fase 11

- `E2E-004`: `e2e/responsive-ux.spec.ts` confere controles principais, ausência de scroll horizontal e grava screenshots em 1280×720 e 1920×1080 quando executado.
- `E2E-005`: `e2e/keyboard-ux.spec.ts` cobre Escape para cancelar ferramenta, Space com foco no board e comportamento nativo de botão; a proteção de shortcuts em campos é coberta por `keyboard-shortcuts.test.ts`.
- Em 2026-11-18, o runner Playwright falhou antes de iniciar qualquer teste (`spawn EPERM`); nenhum screenshot ou resultado E2E foi produzido.

### Implementação visual/áudio adicionada na Fase 12

- `TC-042`: `src/game/rendering/interpolation.test.ts` cobre easing, limites e imutabilidade das posições de origem/destino.
- `sound-effects.test.ts` garante mapeamento de eventos significativos e silêncio para movimento rotineiro.
- `E2E-009`: `e2e/visual-audio.spec.ts` verifica estado inicial mutado e ativação/desativação após clique. Discovery passou; execução permanece bloqueada com `spawn EPERM`.

### Auditoria de fixtures e CI (Fase 13)

- `npm run test:fixtures` executa as soluções de referência usando `reference-runner.ts` e imprime resultado/ciclos/peças/itens/rejeições/estrelas: L01 RESULT, 30 ticks, 6 peças, 3 emitidos, 0 rejects, 3 estrelas; L02 RESULT, 65 ticks, 1 peça, 6 emitidos, 0 rejects, 3 estrelas; L03 RESULT, 70 ticks, 6 peças, 6 emitidos, 0 rejects, 3 estrelas.
- O workflow CI instala Chromium para Playwright e inclui E2E após build. Execução local continuou falhando em `spawn EPERM`; nenhum teste de navegador foi considerado aprovado.
- Smoke local do release build: `npm run preview -- --host 127.0.0.1 --port 3002 --strictPort`; GET de `/` e do asset JS retornaram 200. A porta 3001 já estava ocupada e não foi usada.

## Ensaios visuais e funcionais

- Construção com mouse em limites de célula e em diferentes zooms.
- Comportamento de tela em dark UI, textos e foco dos diálogos.
- Verificar labels A/B após rotacionar diverter; dicas sobre rota física.
- Inspecionar buffer/espera/shift/process/rejected em conjunto com events.
- Detectar resize, memory leak aparente ao reiniciar repetidamente.

## Registro de execução

Registrar cenário, comando/versão, `PASS/FAIL/NOT_RUN`, data, logs reais, screenshot/trace quando aplicável. Não confundir testes existentes com verdes: executar e registrar.

### Phase 09 evidence update

- TC-023 through TC-025 are implemented in `src/game/simulation/level-reference.test.ts`; reference runs assert RESULT, all goals, no rejects or stranded items, measured pieces and three-star score.
- Progression and unlock behavior are covered in `src/game/domain/level-progression.test.ts`.
- The Playwright scenario `e2e/l03-victory.spec.ts` now exercises L01 -> L02 -> L03. Its discovery passes; execution is blocked before test startup by Playwright worker `spawn EPERM` (see Phase 09 report).

### Phase 10 evidence update

- `TC-026`: `src/game/persistence/storage-adapter.test.ts` covers round-trip, corrupt/unsupported records, blocked storage, quota failure and sanitization; `src/game/domain/sandbox-level.test.ts` covers source profiles and clean layout reset; `src/game/simulation/sandbox.test.ts` covers per-output goal-free deliveries and invalid-output rejection; `src/game/editor/editor-reducer.test.ts` covers unlimited placement/removal.
- `E2E-006`: `e2e/sandbox.spec.ts` boots with a blocked localStorage getter, clears and reloads the example, checks output counters, and exercises Start/Pause/Reset. Execution status is recorded in the Phase 10 report.
