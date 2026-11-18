# ARC-001 — Arquitetura técnica

## Contexto

Browser desktop estático, sem backend nem serviços de conta. A UI envia comandos; engine calcula snapshots/eventos; Three.js reproduz mudanças. Persistência de progresso/configuração no cliente, isolada da engine.

```text
DOM/HUD/Toolbars ──commands──> Application/GameController
          ↑                       │
          │                       ├─> Editor & Placement (immutable grid)
          │                       └─> Simulation (pure functions, ticks)
          │                                     │
          └── projections/events <─────────────┤
                                                └─> Renderer Three.js
              localStorage adapter <── application layer
```

## Stack

- Vite e TypeScript `strict` (target ES moderno com browser evergreen); pin de versões instaladas.
- Three.js: OrthographicCamera, meshes, material e raycasting; sem Three no domínio.
- CSS separado e HTML sem lógica de produção; Web Audio API para efeitos originais.
- Vitest para domínio e serviços; Playwright para fluxo E2E no browser.
- ESLint + Prettier + Husky, CI GitHub Actions, npm lockfile; biblioteca de ícones somente se licença autorizada. GSAP **opcional e exclusivamente visual**.
- Sem Rapier, Angular ou backend no MVP.

## Topologia sugerida para implementação

```text
src/
  main.ts
  app/
    game-controller.ts
    game-session.ts
  game/
    domain/
      item.model.ts
      component.model.ts
      level.model.ts
      rule.model.ts
      game-state.model.ts
      event.model.ts
      constants.ts
    simulation/
      tick-engine.ts
      movement-resolver.ts
      machine-engine.ts
      rule-evaluator.ts
      goal-evaluator.ts
      diagnostics.ts
      simulation.fixtures.ts
    editor/
      placement-validator.ts
      editor-commands.ts
    levels/
      level-01.ts
      level-02.ts
      level-03.ts
      reference-solutions/
    rendering/
      scene-manager.ts
      grid-view.ts
      component-factory.ts
      item-view.ts
      interpolation.ts
      camera-controller.ts
    interaction/
      picking-controller.ts
      controls-controller.ts
  ui/
    menus/
    toolbar/
    inspector/
    hud/
    results/
    dialog/
  persistence/
    storage-adapter.ts
    migration.ts
  audio/
    sound-manager.ts
  styles/
    tokens.css
    layout.css
    components.css
  index.html (ou root index.html, conforme Vite)
tests/
  unit/
  integration/
  e2e/
public/
```

Cada módulo deve ter responsabilidade delimitada; evitar pastas vazias e serviços genéricos. `*.model.ts` para interfaces e unions do domínio; a UI pode usar viewmodels próprios.

## Fluxo de edição

`input mouse → picking → command Place/Remove/Rotate/SetRules → validation → immutable layout → scene projection`.

## Fluxo da simulação

`Start → snapshot inicial a partir do layout → step(state, commands) → {nextState,events} → HUD/Three/Audio`. Intervalo de relógio é responsabilidade do controller; o engine aceita apenas quantidade de ticks explicitamente avançada.

## Fronteiras e responsabilidades

- **Domain:** definições e regras sem IO; funções de validação.
- **Simulation:** transições determinísticas, saída de eventos; sem `performance.now`.
- **Editor:** comandos de construção no estado `EDITING`.
- **Application:** coordena modo, relógio, snapshots e persistência.
- **Rendering:** tradução de estado em geometria e animação, sem decisão de gameplay.
- **UI:** interação, regras visuais, feedback e acessibilidade.
- **Persistence:** progresso/settings best-effort; nunca altera regras da simulação.

## Propriedades de qualidade

- Testes de engine não precisam de canvas, WebGL ou DOM.
- `dispose()` do renderer desmonta render loop, listeners, geometrias e materiais.
- Interrupção de renderização/foco não altera resultado de tick-based test; relógio pode pausar ao perder foco, com aviso claro.
- Engine serializável para replay e fixture de regressão.
- `npm run build` produz arquivo estático utilizável em hospedagem HTTPS e itch.io iframe.

## Estratégia de mudanças

Alterar arquitetura via ADR. Adicionar libs após justificar custo, bundle, manutenção e licenças. Priorizar simplicidade que funcione até o prazo.
