# AUDIT-SHIFTWORKS-POST-EXPANSION-ARCHITECTURE

- **Data:** 2026-11-18
- **Escopo:** Auditoria arquitetural global pós-expansões (`EXP-00..23`, `CNT-00..22`, Redesign UI & Catálogo).

## 1. Baseline Real Verificado

- `npm run lint`: PASS (0 erros)
- `npm run typecheck`: PASS (`tsc --noEmit`)
- `npm test`: PASS (32 arquivos / 144 testes Vitest)
- `npm run test:fixtures`: PASS (20/20 fases `L01–L20` com 0 rejeições e 3 estrelas)
- `npm run build`: PASS (`dist/assets/index-*.js` ~746 kB)
- `npm run test:e2e`: 10/11 na rodada pré-ajuste de `e2e/sandbox.spec.ts` (corrigido para navegar na aba `Recursos` do novo painel contextual).

## 2. Inventário dos Maiores Módulos (`.ts`)

| Arquivo | Linhas | Responsabilidade Principal | Diagnóstico |
|---|---:|---|---|
| `src/game/editor/editor-controller.ts` | 1194 | Controller do editor, toolbar, seleção, persistência | P1: mistura persistência de preferências com binding DOM |
| `src/game/simulation/simulation-controller.ts` | 940 | Loop de simulação, HUD inferior, overlay de vitória | P1: orquestração + formatação de vitória no mesmo arquivo |
| `src/game/ui/navigation-controller.ts` | 912 | Navegação, Menu, Level Select, Catálogo, Tutorial, Inspetor | **P0/P1**: múltiplas telas + `MutationObserver` sem `disconnect()` |
| `src/game/simulation/simulation-engine.ts` | 827 | Motor determinístico puro (`step()`) | P2: puro e bem testado; manter coeso sem quebrar determinismo |
| `src/game/domain/campaign-levels.model.ts` | 676 | Definições data-driven de `L04–L20` | Não alterar: arquivo puramente declarativo de dados |
| `src/game/rendering/scene-manager.ts` | 482 | Cena Three.js, renderer, iluminação, resize | P2: coeso e com `dispose()` explícito |

## 3. Tabela de Achados

| ID | Evidência (`arquivo:linha`) | Impacto | Severidade | Ação Proposta | Teste de Regressão | Estado |
|---|---|---|---|---|---|---|
| ARCH-01 | `src/game/ui/navigation-controller.ts:220-238` | `MutationObserver` do inspetor não era desconectado no `dispose()` | P0 | Extrair `InspectorPanelController` (`inspector-panel.ts`) com `dispose()` chamando `observer.disconnect()` | `npm test` + `e2e/responsive-ux.spec.ts` | **Corrigido** |
| ARCH-02 | `src/game/ui/navigation-controller.ts:696-912` | Tela de Catálogo (215+ linhas) acoplada ao `NavigationController` | P1 | Extrair `CatalogViewController` (`catalog-view.ts`) com interface tipada | `catalog.model.test.ts` + `npm run build` | **Corrigido** |
| ARCH-03 | `e2e/sandbox.spec.ts:15` | Teste E2E assumia `#storage-status` sempre visível antes das abas do inspetor | P0 | Atualizar teste para navegar nas abas `Recursos` e `Objetivo` | `npx playwright test e2e/sandbox.spec.ts` | **Corrigido** |
| ARCH-04 | `src/game/editor/editor-controller.ts:1-1194` | Concentração de persistência + DOM do editor | P1 | Adiar extração de `EditorPersistenceService` para próximo ciclo após estabilização de release | `editor-interaction.test.ts` | Adiado (justificado) |
| ARCH-05 | `src/game/simulation/simulation-controller.ts:1-940` | Overlay de vitória + loop de simulação juntos | P2 | Adiar extração de `VictoryOverlayView` para manter baixo risco | `l03-victory.spec.ts` | Adiado (justificado) |
