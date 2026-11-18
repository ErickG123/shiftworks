# ARC-002 — Contratos de domínio (TypeScript)

**Diretriz:** contratos de referência a implementar nos respectivos `*.model.ts`; este documento não é código já executado. O GDD tem tipos preliminares. Aqui foram normalizados para unions discriminadas e validação.

```ts
export type Direction = 'N' | 'E' | 'S' | 'W';
export type ItemType = 'BLUE_BLANK' | 'AMBER_BLANK' | 'CUT_PLATE' | 'PRESSED_BLOCK';
export type MachineMode = 'CUT' | 'PRESS';
export type SessionMode = 'EDITING' | 'RUNNING' | 'PAUSED' | 'RESULT';
export type ComponentKind = 'SOURCE' | 'CONVEYOR' | 'PROCESSOR' | 'DIVERTER' | 'OUTPUT';
export type GridPosition = Readonly<{ x: number; y: number }>;
export type Item = Readonly<{ id: string; type: ItemType; sequence: number }>;

type ComponentBase = Readonly<{ id: string; position: GridPosition; direction: Direction }>;
export type SourceComponent = ComponentBase & Readonly<{
  type: 'SOURCE'; sequence: readonly ('BLUE_BLANK' | 'AMBER_BLANK')[]; intervalTicks: number;
}>;
export type ConveyorComponent = ComponentBase & Readonly<{ type: 'CONVEYOR' }>;
export type ProcessorComponent = ComponentBase & Readonly<{
  type: 'PROCESSOR'; rules: readonly ProcessorRule[]; defaultMode: MachineMode;
}>;
export type DiverterComponent = ComponentBase & Readonly<{
  type: 'DIVERTER'; rules: readonly DiverterRule[];
}>;
export type OutputComponent = ComponentBase & Readonly<{
  type: 'OUTPUT'; acceptedTypes: readonly ItemType[]; label: 'DOCK' | 'A' | 'B';
}>;
export type Component = SourceComponent | ConveyorComponent | ProcessorComponent | DiverterComponent | OutputComponent;

export type ProcessorRule = Readonly<{
  when: 'BLUE_BLANK' | 'AMBER_BLANK'; then: MachineMode;
}>;
export type DiverterRule = Readonly<{
  when: 'CUT_PLATE' | 'PRESSED_BLOCK'; then: 'A' | 'B';
}>;
export type Goal = Readonly<{
  outputId: string; itemType: ItemType; quantity: number;
}>;
export type LevelDefinition = Readonly<{
  id: string; width: number; height: number;
  fixedComponents: readonly Component[];
  inventory: Readonly<Partial<Record<'CONVEYOR' | 'PROCESSOR' | 'DIVERTER', number>>>;
  goals: readonly Goal[];
  obstacles: readonly GridPosition[];
  referenceLayoutId: string;
  starThresholds?: Readonly<{ twoStarMaxTicks: number; threeStarMaxTicks: number; threeStarMaxPieces: number }>;
}>;

export type SimulationEvent = Readonly<{
  tick: number; sequence: number;
  kind: 'ITEM_EMITTED' | 'ITEM_MOVED' | 'MODE_SHIFT_STARTED' | 'MODE_SHIFT_COMPLETED' |
        'PROCESS_STARTED' | 'PROCESS_COMPLETED' | 'ROUTE_CHOSEN' | 'ITEM_DELIVERED' |
        'ITEM_REJECTED' | 'BLOCKED' | 'RULE_MISSING' | 'GOAL_COMPLETED';
  componentId?: string; itemId?: string; detail?: string;
}>;
export type StepResult = Readonly<{ state: SimulationState; events: readonly SimulationEvent[] }>;
export declare function step(state: SimulationState): StepResult;
```

`SimulationState` contém (no mínimo) tick, layout imutável, item storage por componente (capacidade 1), estado interno de processador, estado de emissão por fonte, métricas e progresso de goals. A implementação deve detalhar o tipo em `game-state.model.ts` sem expor `Record<string,unknown>` genérico para comportamentos.

## Comandos de edição (tipados)

```ts
export type EditorCommand =
 | Readonly<{ kind: 'PLACE'; component: Component }>
 | Readonly<{ kind: 'REMOVE'; componentId: string }>
 | Readonly<{ kind: 'ROTATE'; componentId: string; direction: Direction }>
 | Readonly<{ kind: 'SET_PROCESSOR_RULES'; componentId: string; rules: readonly ProcessorRule[] }>
 | Readonly<{ kind: 'SET_DIVERTER_RULES'; componentId: string; rules: readonly DiverterRule[] }>;
```

- Remover/mover fixedComponent é inválido.
- Alterar rules durante RUNNING/PAUSED é inválido; voltar para `EDITING` reinicia simulação e mantém layout.
- IDs de componentes em fixtures são estáveis; IDs de itens gerados a partir de `(sourceId, emissionSequence)` e não de RNG.
- Validar LevelDefinition e regras antes de criar uma sessão; não aceitar schema incompleto silenciosamente.

## Compatibilidade do jogo e da UX

- Ports de entrada/saída são resolvidos por tipo e orientação em funções puras (`portsFor(component)`).
- `OUTPUT` é endpoint final; não emite item. `SOURCE` origina itens; não consome material externo.
- `DIVERTER`: porta `A` = à frente, `B` = à direita relativa à sua orientação; entrada = atrás. A UI mostra labels A/B.
- `PROCESSOR`: entrada atrás; saída à frente. `CONVEYOR`: entrada atrás; saída à frente.
- `SOURCE`: saída à frente. `OUTPUT`: entrada atrás (ou aceitar de vizinho com porta configurada se documentado).
- Alterar o mapeamento de ports é mudança de contrato: atualizar diagramas, testes e documentação.

## Erros tipados (mínimo)

`OUT_OF_BOUNDS`, `CELL_OCCUPIED`, `FIXED_COMPONENT`, `NOT_EDITING`, `INVENTORY_EXCEEDED`, `INVALID_PORT`, `DUPLICATE_RULE`, `UNSUPPORTED_RULE`, `UNKNOWN_COMPONENT`, `INVALID_LEVEL`. UI traduz erro em mensagem compreensível.

## Integração e validação

As fixtures devem usar instâncias válidas desses tipos, e validação runtime na borda de import/layout. Não usar JSON de origem não confiável diretamente como `LevelDefinition` sem validação.

## Sandbox and persistence (Phase 10)

- `EditorState.unlimitedInventory` enables unlimited placement in Sandbox while leaving finite challenge inventories unchanged.
- Sandbox uses a `LevelDefinition` with no goals, the same component types and the same `step` engine; accepted Outputs count deliveries by component ID.
- `GameStorageAdapter` stores version 1 campaign completion and mode/level/source preferences best-effort. Storage access, parse, quota or privacy failures preserve in-memory operation. Sandbox layouts are not persisted in this phase.
