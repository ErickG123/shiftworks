# AUDIT-EXP-00 — Auditoria de Baseline, Bugs Históricos e Inventário da Expansão

> **Data:** 2026-11-18  
> **Fase:** `EXP-00` (`docs/expansion/prompts/00-auditoria-baseline-e-bugs.md`)  
> **Requisitos:** `SW-207` + baseline de `SW-101..SW-115` e `SW-201..SW-206`

---

## 1. Estado Real do Repositório (Auditoria Técnica)

- **Stack confirmada (`package.json`):** Vite `8.3.8`, TypeScript `5.9.3` (`strict`), Three.js `0.187.0`, Vitest `5.1.1`, Playwright `1.65.1`, ESLint `9.39.2`, Prettier `3.6.2`. Sem React/Angular, sem engine de física, sem backend.
- **Separação de camadas confirmada:**
  - `src/game/domain/`: modelos puros `*.model.ts` (zero imports de Three.js, DOM ou `localStorage`).
  - `src/game/simulation/`: motor determinístico `step()` (`simulation-engine.ts`, `transfer-resolver.ts`, `event-sequencer.ts`) completamente isolado da renderização.
  - `src/game/rendering/`: `SceneManager`, `CameraController`, `GridView`, `ComponentView`, `ItemView`, `MenuDiorama` (um único `WebGLRenderer` e um único loop `requestAnimationFrame`).
  - `src/game/editor/`: `editor-reducer.ts`, `tool-availability.ts`, `editor-controller.ts`.
  - `src/game/interaction/`: `grid-picking.ts`, `keyboard-shortcuts.ts`.
  - `src/game/persistence/`: `storage-adapter.ts` (`shiftworks.game-state.v1`, retrocompatível com `bestResultsByLevel`).
  - `src/game/ui/` e `src/i18n/`: templates `.html` importados via `?raw`, `navigation-controller.ts`, `i18n.service.ts` (`pt-BR` default, `en` secundário) e `formatters.ts`.

---

## 2. Verificação dos Bugs Históricos Relatados no Prompt EXP-00

| Bug Relatado | Status Atual na Baseline | Evidência Real (Código + Testes) |
|---|---|---|
| `R` não gira esteira na construção/tutorial | **JÁ RESOLVIDO** | `EditorController.rotateActiveOrSelected()` gira prévia (`ghost`) e peça selecionada (`N→E→S→W→N`); `T00` avança apenas por eventos reais (`editor-interaction.test.ts` + `e2e/keyboard-ux.spec.ts`). |
| Ao pausar não retorna à edição / ferramentas travadas | **JÁ RESOLVIDO** | `SimulationController` exibe `#paused-callout-banner` com CTA primário **Editar fábrica**, inspeção somente leitura em `PAUSED` e `ensureEditingMode()` ao trocar de tela (`editor-interaction.test.ts` + `e2e/l03-victory.spec.ts`). |
| `L02` sem esteiras (`CONVEYOR: 0`) | **JÁ RESOLVIDO** | `L02` rebalanceada com `CONVEYOR: 10, PROCESSOR: 1`, Doca em `(5, 3)`, 4 layouts válidos testados e referência em 68 ciclos / 3★ (`level-reference.test.ts` + `e2e/l03-victory.spec.ts`). |
| Câmera e HUD com layout instável | **JÁ RESOLVIDO** | `CameraController` (`WASD` + `Q/E` 90° + clamp + reset), raycasting recalculado e layout validado em `1024×768`, `1280×720`, `1600×900` e `1920×1080` (`camera-controller.test.ts` + `e2e/responsive-ux.spec.ts`). |
| Win-card lateral estreito | **JÁ RESOLVIDO** | Overlay modal central `#result-panel.victory-overlay` (`role="dialog"`) com 3 estrelas SVG, recorde e 5 ações (`e2e/l03-victory.spec.ts`, `artifacts/victory-overlay-1280x720.png`). |
| Mensagens com `BLUE_BLANK` / `CONVEYOR` crus em `pt-BR` | **JÁ RESOLVIDO** | `src/i18n/formatters.ts` localiza itens, componentes, direções, modos e diagnósticos em `pt-BR`/`en` sem alterar IDs internos (`i18n.service.test.ts` + `e2e/responsive-ux.spec.ts`). |

---

## 3. Inventário de Features da Expansão (`SW-101..SW-115` e `SW-201..SW-207`)

| ID | Feature | Estado Atual | Prompt Alvo | Prioridade |
|---|---|---|---|---|
| `SW-101` | Construção de esteiras por arrasto + Undo/Redo | **AUSENTE** | `EXP-02` | P0 |
| `SW-102` | Overlay de fluxo e conexões | **AUSENTE** | `EXP-03` | P1 |
| `SW-103` | Inspetor contextual avançado de máquinas | **PARCIAL** (inspetor básico + receitas/rotas existentes) | `EXP-04` | P1 |
| `SW-108` | Passo a passo por tick (`+1 tick` em pausa) | **AUSENTE** | `EXP-05` | P0 |
| `SW-109` | Diagnóstico de gargalos | **PARCIAL** (diagnósticos básicos de bloqueio existem) | `EXP-06` | P1 |
| `SW-110` | Painel de eficiência | **PARCIAL** (métricas básicas existem no rodapé/vitória) | `EXP-07` | P1 |
| `SW-201/202` | Catálogo de equipamentos e tooltips educativos | **PARCIAL** (tooltips básicos de disponibilidade existem) | `EXP-08` | P0 |
| `SW-203` | Card flutuante com preview 3D animado | **AUSENTE** | `EXP-09` | P0 |
| `SW-204` | Tutoriais guiados (`T00`/`T01` + lições) | **PARCIAL** (`T00` implementado; `T01` e lições de máquinas pendentes) | `EXP-10` | P0 |
| `SW-205` | Progressão, unlocks e conquistas persistentes | **PARCIAL** (unlock `L01→L02→L03` e `bestResultsByLevel` existem; conquistas pendentes) | `EXP-11` | P0 |
| `SW-111..SW-115`, `SW-104..SW-107` | Setores, desafios opcionais, sensores, receitas encadeadas, buffers, pedidos dinâmicos, blueprints, sandbox expandido, desafios de eficiência | **AUSENTE** | `EXP-12..EXP-20` | P2 |
| `SW-206` | Polimento final HUD/UX/acessibilidade | **PARCIAL** (base sólida já entregue) | `EXP-21` | P1 |
| `SW-207` | Qualidade transversal, regressão e release | **EM ANDAMENTO** (baseline verde: 111 unit + 10 E2E) | `EXP-22..23` | P0 |

---

## 4. Auditoria de Governança (`AGENTS.md` e `.agents/`)

- `AGENTS.md` e `.agents/rules/` (`global.md`, `simulation.md`, `rendering-ux.md`, `sdd-execution.md`, `typescript-ui-conventions.md`) estão coerentes e sem contradições com a separação `.html/.ts/.css`, contratos `*.model.ts` e `i18n` (`pt-BR` padrão).
- Decisões contratuais para a expansão (`Undo/Redo`, `+1 tick`, catálogo/preview 3D, conquistas e migração de schema `v1 → v2`) ficam formalmente reservadas à fase `EXP-01`.
