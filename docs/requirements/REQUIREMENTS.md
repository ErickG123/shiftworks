# REQ-001 — Requisitos rastreáveis

**Situação inicial:** todos os requisitos começam como `PLANNED`, não implementados.  
**Prioridade:** P0 = vertical slice; P1 = submissão desejada; P2 = opcional; POST = pós-jam.  
**Referências:** especificações `SPEC-*`, matriz em `docs/qa/TRACEABILITY.md`.

## Requisitos funcionais

| ID | Prioridade | Requisito verificável | SPEC |
|---|---|---|---|
| RF-001 | P0 | Exibir grid 8×8 com câmera isométrica, seleção de célula e zoom limitado | 001 |
| RF-002 | P0 | Colocar/remover/rotacionar peças apenas em edição e células válidas | 001 |
| RF-003 | P0 | Conectar automaticamente portas direcionais adjacentes válidas | 001 |
| RF-004 | P0 | Executar simulação em ticks independentes de FPS | 002 |
| RF-005 | P0 | Transportar itens com capacidade 1 por componente e backpressure | 002 |
| RF-006 | P0 | Source emitir sequência e aguardar quando bloqueado | 002 |
| RF-007 | P0 | Processor alternar CUT/PRESS com custo e receita correta | 003 |
| RF-008 | P0 | Configurar até duas regras tipadas por Processor/Diverter, com validação | 003 |
| RF-009 | P0 | Diverter rotear para portas A/B por tipo e Output aceitar/rejeitar | 003 |
| RF-010 | P0 | Mostrar objetivos, ciclos, diagnósticos e vitória automática | 004,005 |
| RF-011 | P0 | Start, Pause, Reset e Edit com transições de estados definidas | 002,005 |
| RF-012 | P0 | Completar vertical slice `3 plates + 3 blocks` sem intervenção | 004 |
| RF-013 | P1 | Oferecer três fases com onboarding incremental e seleção | 004 |
| RF-014 | P1 | Exibir resultados e estrelas calibradas com soluções referência | 004 |
| RF-015 | P1 | Apresentar feedback procedural de modo, transporte, erro e entrega | 006 |
| RF-016 | P1 | Oferecer interface legível e controles de teclado, volume e ajuda | 005,006 |
| RF-017 | P1 | Oferecer Sandbox com componentes ilimitados e exemplos | 007 |
| RF-018 | P1 | Salvar progresso e preferências localmente sem bloquear gameplay | 007 |
| RF-019 | P1 | Publicar build web estática e documentação de jogo/licenças | 008 |
| RF-020 | P2 | Salvar/carregar layout versionado do Sandbox e 2× speed | 007 |
| RF-021 | POST | Ampliar receitas, editor de regras e sistemas produtivos | 009 |

## Requisitos não funcionais

| ID | Prioridade | Requisito verificável |
|---|---|---|
| RNF-001 | P0 | Determinismo por snapshot + comandos + ticks, evento reproduzível |
| RNF-002 | P0 | Domínio/simulação sem import de Three.js, DOM, timers ou APIs de rede |
| RNF-003 | P0 | TypeScript `strict`, sem `any` no domínio e models tipados |
| RNF-004 | P0 | Lint, typecheck, tests e build executáveis local e CI |
| RNF-005 | P0 | Sem item duplicado/perdido e capacidade sempre respeitada |
| RNF-006 | P0 | Fluxo central operável em Chrome/Edge desktop modernos |
| RNF-007 | P1 | Interface legível a 1280×720 e 1920×1080, sem overlays truncados |
| RNF-008 | P1 | Estado não comunicado só por cor; navegação por teclado em painéis |
| RNF-009 | P1 | 60 FPS como meta (não gate absoluto); simulação estável sob FPS baixo |
| RNF-010 | P1 | Preferências/progresso sem servidor, falha de storage não quebra sessão |
| RNF-011 | P1 | Assets/licenças rastreados; uso de IA declarado conforme regras da jam |
| RNF-012 | P1 | Publicação auditada na URL pública do itch.io, sem erros críticos |
| RNF-013 | P0 | Testes de regras cobrindo cenários negativos, limites e determinismo |
| RNF-014 | P1 | Logs de diagnóstico em dev sem expor informações sensíveis e sem flood |

## Aceitação transversal

- Cada RF/RNF implementado tem teste associado e evidência no relatório.
- Mudanças em regra de negócio atualizam SPEC, testes e rastreabilidade antes do gate.
- Nenhuma fase é `PASS` com defeito P0 conhecido ou teste de aceitação crítico não executado.
- Os detalhes dos casos e fixtures estão em `docs/qa/TEST-PLAN.md`.

## Gestão de mudança

`PROPOSED → REVIEWED → APPROVED → IMPLEMENTED → VERIFIED`. A documentação atual é o estado `APPROVED FOR IMPLEMENTATION` de planejamento, não `VERIFIED`. Não inventar percentuais de cobertura ou resultados.

### Evidência de UX (Fase 11)

- Foram implementados controles de zoom acessíveis, proteção de atalhos diante de controles focados, anúncios somente para mudanças relevantes, feedback visível separado da prévia e casos E2E para 1280×720, 1920×1080 e teclado.
- Lint, typecheck, 82 testes unitários e build passaram em 2026-11-18. O E2E e a inspeção visual não foram executados porque o Playwright falha ao criar workers (`spawn EPERM`); RF-016, RNF-007 e RNF-008 seguem sem verificação de gate.

### Evidência visual/áudio (Fase 12)

- Componentes e produtos têm silhuetas procedurais, movimentos entre snapshots e estados visuais de máquinas; efeitos Web Audio originais iniciam mutados e só são ativados por ação explícita, com volume ajustável.
- Typecheck, lint, 86 testes unitários e build passaram em 2026-11-18. E2E, screenshots, perfil de performance e inspeção de vazamentos continuam NOT_RUN devido ao mesmo bloqueio Playwright; RF-015 e RNF-009 não estão verificados.

### Evidência de QA/release (Fase 13)

- CI foi ampliado para instalar Chromium e executar os E2E; `npm run test:fixtures` reproduziu L01/L02/L03 em 30/65/70 ticks, 6/1/6 peças, zero rejeições e 3 estrelas.
- Lint, typecheck, 86 unit tests, build e smoke estático de `dist/` passaram localmente. Playwright segue bloqueado ao criar worker (`spawn EPERM`), e CI remota não foi executada; G13 permanece PARTIAL.

### Evidência de playtest (Fase 14)

- Duas sessões humanas foram marcadas NOT_RUN porque não houve participante disponível; nenhuma observação de UX ou balanceamento foi fabricada. Tempos de fixture permanecem métricas técnicas, não feedback humano. RF-013/RF-014 continuam sem validação de usabilidade.

### Evidência de release candidate (Fase 15)

- Revisados 233 metadados de licença, sem lacunas; `npm audit --offline` encontrou 0 vulnerabilidades no snapshot local. O lockfile instalou 201 pacotes numa pasta isolada com lifecycle hooks desativados; `npm ci` na raiz ficou bloqueado por um binário nativo em uso.
- Regras do Game Off conferidas em 2026-11-18; IA foi declarada no README/rascunho. Sem screenshots reais, browser E2E, página pública ou submissão; RF-019/RNF-011/RNF-012 permanecem não verificados.
- Fase 16 (2026-11-18): lint, typecheck, 86 testes unitários, build e fixtures passaram; E2E bloqueado por `spawn EPERM`. Não há commits nem remote Git, página pública, upload, screenshot ou confirmação da jam. RF-019/RNF-012 e G16 permanecem BLOCKED; ver `docs/reports/REPORT-PHASE-16-release.md`.

### Evidência de estabilização integrada — Controles, Câmera, Estados, L02, Vitória e i18n (2026-11-18)

- Implementados e verificados: rotação de prévia (`ghost`) e peça selecionada com `R` (`EditorController`), tutorial `T00` orientado a eventos reais de domínio/editor, `CameraController` (`WASD` pan relativo à câmera + `Q/E` rotação orbital de 90° + clamp + reset), transição explícita `PAUSED → EDITING` via CTA **Editar fábrica** com inspeção somente leitura durante pausa, rebalanceamento da Fase `L02` (`CONVEYOR: 10, PROCESSOR: 1`, Doca em `(5, 3)`, 4 layouts válidos testados, solução de referência em 68 ciclos / 3 estrelas), overlay central dedicado de vitória (`#result-panel` com estrelas SVG, recorde persistido e 5 ações) e localização 100% `pt-BR`/`en` de itens, componentes e diagnósticos.
- Verificação executada localmente: `npm run lint` (PASS), `npm run typecheck` (PASS), `npm test` (PASS — 26 arquivos, 111 testes), `npm run test:fixtures` (PASS — L01 30 ticks, L02 68 ticks, L03 70 ticks, 3 estrelas), `npm run build` (PASS) e `npm run test:e2e` (PASS — 11/11 testes Playwright em `1024×768`, `1280×720`, `1600×900` e `1920×1080` com screenshots reais em `artifacts/`). Ver `docs/reports/REPORT-gameplay-controls-camera-level02-victory.md`.
