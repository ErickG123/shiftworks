import type { Component, Direction, EditableComponentType, ItemType, MachineMode } from './component.model';
import type { EditorErrorCode, EditorState } from './editor.model';
import type { FactoryBlueprint } from './expansion-contracts.model';
import type { GridCell } from './grid.model';
import type { ItemInstance } from './simulation.model';
import { reduceEditor, validatePlacement } from '../editor/editor-reducer';
import { createSandboxLevel, type SandboxLevel, type SourceSequenceMode } from './sandbox-level.model';

/* --- SW-104: Programmable Sensors (EXP-14) --- */
export type SensorRule =
  | Readonly<{ id: string; kind: 'ITEM_TYPE_MATCH'; itemType: ItemType; targetMode: MachineMode }>
  | Readonly<{ id: string; kind: 'DELIVERY_COUNT_REACHED'; threshold: number; targetMode: MachineMode }>;

export function evaluateSensorRules(
  rules: readonly SensorRule[],
  context: Readonly<{ incomingItemType: ItemType | null; deliveredCount: number }>,
): MachineMode | null {
  for (const rule of rules) {
    if (rule.kind === 'ITEM_TYPE_MATCH' && context.incomingItemType === rule.itemType) {
      return rule.targetMode;
    }
    if (rule.kind === 'DELIVERY_COUNT_REACHED' && context.deliveredCount >= rule.threshold) {
      return rule.targetMode;
    }
  }
  return null;
}

/* --- SW-105: Chained Recipes (EXP-15) --- */
export type ExtendedItemType = ItemType | 'REINFORCED_PANEL' | 'MACHINED_CORE';

export function resolveChainedRecipe(
  inputType: ExtendedItemType,
  mode: MachineMode,
): ExtendedItemType | null {
  if (inputType === 'BLUE_BLANK' && mode === 'CUT') return 'CUT_PLATE';
  if (inputType === 'AMBER_BLANK' && mode === 'PRESS') return 'PRESSED_BLOCK';
  if (inputType === 'CUT_PLATE' && mode === 'PRESS') return 'REINFORCED_PANEL';
  if (inputType === 'PRESSED_BLOCK' && mode === 'CUT') return 'MACHINED_CORE';
  return null;
}

/* --- SW-107: Deterministic FIFO Buffers (EXP-16) --- */
export type FifoBufferState = Readonly<{
  capacity: number;
  queue: readonly ItemInstance[];
}>;

export function createFifoBuffer(capacity: number): FifoBufferState {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new RangeError('Buffer capacity must be a positive integer.');
  }
  return Object.freeze({ capacity, queue: Object.freeze([]) });
}

export function enqueueFifoBuffer(
  buffer: FifoBufferState,
  item: ItemInstance,
): Readonly<{ ok: boolean; buffer: FifoBufferState }> {
  if (buffer.queue.length >= buffer.capacity) {
    return Object.freeze({ ok: false, buffer });
  }
  return Object.freeze({
    ok: true,
    buffer: Object.freeze({
      capacity: buffer.capacity,
      queue: Object.freeze([...buffer.queue, item]),
    }),
  });
}

export function dequeueFifoBuffer(
  buffer: FifoBufferState,
): Readonly<{ item: ItemInstance | null; buffer: FifoBufferState }> {
  if (buffer.queue.length === 0) {
    return Object.freeze({ item: null, buffer });
  }
  const [item, ...rest] = buffer.queue;
  return Object.freeze({
    item: item ?? null,
    buffer: Object.freeze({
      capacity: buffer.capacity,
      queue: Object.freeze(rest),
    }),
  });
}

/* --- SW-106: Dynamic Production Orders (EXP-17) --- */
export type DynamicOrderPhase = Readonly<{
  phaseId: string;
  activateAtTick: number;
  requiredItemType: ItemType;
  quantity: number;
}>;

export function resolveActiveOrderPhase(
  phases: readonly DynamicOrderPhase[],
  tick: number,
): DynamicOrderPhase | null {
  const eligible = phases
    .filter((phase) => tick >= phase.activateAtTick)
    .sort((a, b) => a.activateAtTick - b.activateAtTick);
  return eligible.at(-1) ?? null;
}

/* --- SW-111 & SW-112 & SW-115: Campaign Sectors & Optional Challenges (EXP-12/13/20) --- */
export type CampaignSector = Readonly<{
  id: string;
  titleKey: string;
  levelIds: readonly string[];
}>;

export const CAMPAIGN_SECTORS: readonly CampaignSector[] = Object.freeze([
  Object.freeze({
    id: 'SECTOR-01',
    titleKey: 'levelSelect.title',
    levelIds: Object.freeze(['L01', 'L02', 'L03']),
  }),
]);

export type OptionalChallengeResult = Readonly<{
  id: string;
  passed: boolean;
}>;

export function evaluateOptionalChallenges(
  metrics: Readonly<{ ticks: number; rejectedCount: number; piecesUsed: number }>,
  limits: Readonly<{ maxTicks: number; maxPieces: number }>,
): readonly OptionalChallengeResult[] {
  return Object.freeze([
    Object.freeze({ id: 'CHALLENGE-ZERO-REJECT', passed: metrics.rejectedCount === 0 }),
    Object.freeze({ id: 'CHALLENGE-FAST-RUN', passed: metrics.ticks <= limits.maxTicks }),
    Object.freeze({ id: 'CHALLENGE-COMPACT-LINE', passed: metrics.piecesUsed <= limits.maxPieces }),
  ]);
}

/* --- SW-113: Atomic Blueprint Application (EXP-18) --- */
export function applyBlueprintAtomically(
  state: EditorState,
  blueprint: FactoryBlueprint,
  anchor: GridCell,
): Readonly<{ ok: true; state: EditorState } | { ok: false; state: EditorState; error: EditorErrorCode }> {
  if (state.mode !== 'EDITING') {
    return Object.freeze({ ok: false, state, error: 'NOT_EDITING' });
  }
  const requiredByType: Record<EditableComponentType, number> = {
    CONVEYOR: 0,
    PROCESSOR: 0,
    DIVERTER: 0,
    BUFFER: 0,
    SENSOR: 0,
    SPLITTER: 0,
    MERGER: 0,
    ASSEMBLER: 0,
  };
  for (const entry of blueprint.components) {
    const pos = { x: anchor.x + entry.dx, y: anchor.y + entry.dy };
    const err = validatePlacement(state, entry.type, pos);
    if (err) {
      return Object.freeze({ ok: false, state, error: err });
    }
    requiredByType[entry.type] += 1;
    if (!state.unlimitedInventory && requiredByType[entry.type] > (state.inventory[entry.type] ?? 0)) {
      return Object.freeze({ ok: false, state, error: 'INVENTORY_EXCEEDED' });
    }
  }

  let nextState = state;
  for (const entry of blueprint.components) {
    const res = reduceEditor(nextState, {
      kind: 'PLACE',
      componentType: entry.type,
      position: { x: anchor.x + entry.dx, y: anchor.y + entry.dy },
      direction: entry.direction as Direction,
    });
    if (!res.ok) {
      return Object.freeze({ ok: false, state, error: res.error.code });
    }
    nextState = res.state;
  }

  return Object.freeze({ ok: true, state: nextState });
}

/* --- SW-114: Expanded Configurable Sandbox Grid (EXP-19) --- */
export function createExpandedSandboxLevel(
  sourceMode: SourceSequenceMode,
  gridSize: 8 | 10 | 12 = 10,
): SandboxLevel {
  const base = createSandboxLevel(sourceMode);
  return Object.freeze({
    ...base,
    width: gridSize,
    height: gridSize,
    referenceComponents: base.referenceComponents as readonly Component[],
  });
}
