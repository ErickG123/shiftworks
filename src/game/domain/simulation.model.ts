import type { Component, Direction, Goal, ItemType, LevelDefinition, MachineMode } from './component.model';
import type { GridCell } from './grid.model';

export type SessionMode = 'EDITING' | 'RUNNING' | 'PAUSED' | 'RESULT';
export type ProductionItemType = ItemType;
export type ProcessPhase = 'IDLE' | 'SHIFTING' | 'PROCESSING' | 'READY' | 'RULE_MISSING';
export type ItemInstance = Readonly<{
  id: string;
  type: ItemType;
  sequence: number;
  bornTick: number;
  route: 'A' | 'B' | null;
}>;

export type SimulationLayout = Readonly<{
  levelId: string;
  width: number;
  height: number;
  components: readonly Component[];
  obstacles: readonly GridCell[];
  goals: readonly Goal[];
  referenceLayoutId: string;
}>;

export type ComponentSlot = Readonly<{ componentId: string; item: ItemInstance | null }>;
export type ProcessorRuntime = Readonly<{
  componentId: string;
  mode: MachineMode;
  phase: ProcessPhase;
  ticksRemaining: number;
  targetMode: MachineMode | null;
  itemId: string | null;
}>;
export type SourceRuntime = Readonly<{
  componentId: string;
  emissionOrdinal: number;
  nextDueTick: number;
  pending: boolean;
}>;
export type DiverterRuntime = Readonly<{ componentId: string; itemId: string | null; route: 'A' | 'B' | null }>;
export type GoalProgress = Readonly<{ goal: Goal; delivered: number }>;
export type BlockingReason = 'NO_PORT' | 'DESTINATION_OCCUPIED' | 'DESTINATION_RESERVED' | 'SOURCE_BLOCKED' | 'DESTINATION_NO_STORAGE' | 'RULE_MISSING';
export type SimulationDiagnostic = Readonly<{ componentId: string; itemId: string | null; reason: BlockingReason }>;
export type SimulationMetrics = Readonly<{
  itemsEmitted: number;
  itemsMoved: number;
  itemsProducedByType: Readonly<Record<ItemType, number>>;
  itemsDeliveredByOutput: Readonly<Record<string, number>>;
  rejectedCount: number;
  modeShiftCount: number;
  piecesUsed: number;
}>;

export type SimulationState = Readonly<{
  tick: number;
  mode: SessionMode;
  layout: SimulationLayout;
  slots: readonly ComponentSlot[];
  processors: readonly ProcessorRuntime[];
  sources: readonly SourceRuntime[];
  diverters: readonly DiverterRuntime[];
  goals: readonly GoalProgress[];
  diagnostics: readonly SimulationDiagnostic[];
  metrics: SimulationMetrics;
}>;

export type SimulationEventPayload =
  | Readonly<{ kind: 'ITEM_EMITTED'; componentId: string; item: ItemInstance }>
  | Readonly<{ kind: 'ITEM_MOVED'; componentId: string; destinationId: string; itemId: string }>
  | Readonly<{ kind: 'MODE_SHIFT_STARTED' | 'MODE_SHIFT_COMPLETED'; componentId: string; itemId: string; mode: MachineMode }>
  | Readonly<{ kind: 'PROCESS_STARTED' | 'PROCESS_COMPLETED'; componentId: string; itemId: string; itemType?: ItemType }>
  | Readonly<{ kind: 'ROUTE_CHOSEN'; componentId: string; itemId: string; route: 'A' | 'B' }>
  | Readonly<{ kind: 'ITEM_DELIVERED'; componentId: string; itemId: string; itemType: ItemType; goalOutputId: string }>
  | Readonly<{ kind: 'ITEM_REJECTED'; componentId: string; itemId: string; itemType: ItemType; reason: 'WRONG_TYPE' | 'NO_GOAL' }>
  | Readonly<{ kind: 'BLOCKED'; componentId: string; itemId?: string; reason: BlockingReason }>
  | Readonly<{ kind: 'RULE_MISSING'; componentId: string; itemId: string; itemType: ItemType }>
  | Readonly<{ kind: 'GOAL_COMPLETED'; outputId: string; itemType: ItemType }>;

export type SimulationEvent = SimulationEventPayload & Readonly<{ tick: number; sequence: number }>;
export type StepResult = Readonly<{ state: SimulationState; events: readonly SimulationEvent[] }>;

export type SessionErrorCode = 'INVALID_TRANSITION';
export type SessionResult = Readonly<{ ok: true; state: SimulationState }> | Readonly<{ ok: false; state: SimulationState; error: SessionErrorCode }>;

export function emptySimulationMetrics(): SimulationMetrics {
  return Object.freeze({
    itemsEmitted: 0,
    itemsMoved: 0,
    itemsProducedByType: Object.freeze({ BLUE_BLANK: 0, AMBER_BLANK: 0, CUT_PLATE: 0, PRESSED_BLOCK: 0 }),
    itemsDeliveredByOutput: Object.freeze({}),
    rejectedCount: 0,
    modeShiftCount: 0,
    piecesUsed: 0,
  });
}

export function snapshotLevel(level: LevelDefinition, components: readonly Component[] = level.fixedComponents): SimulationLayout {
  const frozenComponents: readonly Component[] = components.map((component): Component => {
    const position = Object.freeze({ ...component.position });
    switch (component.type) {
      case 'SOURCE': return Object.freeze({ ...component, position, sequence: Object.freeze([...component.sequence]) });
      case 'OUTPUT': return Object.freeze({ ...component, position, acceptedTypes: Object.freeze([...component.acceptedTypes]) });
      case 'PROCESSOR': return Object.freeze({ ...component, position, rules: Object.freeze(component.rules.map((rule) => Object.freeze({ ...rule }))) });
      case 'DIVERTER': return Object.freeze({ ...component, position, rules: Object.freeze(component.rules.map((rule) => Object.freeze({ ...rule }))) });
      case 'CONVEYOR': return Object.freeze({ ...component, position });
    }
  });
  return Object.freeze({
    levelId: level.id,
    width: level.width,
    height: level.height,
    components: Object.freeze(frozenComponents),
    obstacles: Object.freeze(level.obstacles.map((cell) => Object.freeze({ ...cell }))),
    goals: Object.freeze(level.goals.map((goal) => Object.freeze({ ...goal }))),
    referenceLayoutId: level.referenceLayoutId,
  });
}

export function isSimulationItem(value: ItemInstance): boolean {
  return Boolean(value.id) && Number.isInteger(value.sequence) && value.sequence >= 0 && Number.isInteger(value.bornTick) && value.bornTick >= 0;
}

export type { Direction };
