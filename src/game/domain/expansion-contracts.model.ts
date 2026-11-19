import type { Component, ComponentType, Direction, EditableComponentType } from './component.model';
import type { EditorState } from './editor.model';
import type { GridCell } from './grid.model';
import type { LevelBestResult } from './level-scoring.model';
import type { SourceSequenceMode } from './sandbox-level.model';

export type BuildTransactionKind =
  | 'PLACE_SINGLE'
  | 'PLACE_DRAG_PATH'
  | 'REMOVE'
  | 'ROTATE'
  | 'SET_RULES'
  | 'APPLY_BLUEPRINT';

export type BuildTransaction = Readonly<{
  id: string;
  kind: BuildTransactionKind;
  before: EditorState;
  after: EditorState;
  cellsAffected: readonly GridCell[];
}>;

export type EditorHistoryState = Readonly<{
  past: readonly BuildTransaction[];
  future: readonly BuildTransaction[];
  maxEntries: number;
}>;

export type EquipmentId = ComponentType;

export type EquipmentCatalogEntry = Readonly<{
  id: EquipmentId;
  editable: boolean;
  nameKey: string;
  summaryKey: string;
  usageKey: string;
  portsSummaryKey: string;
  unlockLevelId: string | null;
  previewScenario: 'SOURCE_EMIT' | 'CONVEYOR_FLOW' | 'PROCESSOR_SHIFT' | 'DIVERTER_SPLIT' | 'OUTPUT_DOCK';
}>;

export type PreviewLifecycleState = 'IDLE' | 'MOUNTED' | 'PLAYING' | 'PAUSED' | 'DISPOSED';

export type BottleneckSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type BottleneckEntry = Readonly<{
  componentId: string;
  position: GridCell;
  reason: string;
  severity: BottleneckSeverity;
  stalledTicks: number;
}>;

export type EfficiencySnapshot = Readonly<{
  ticksElapsed: number;
  itemsDelivered: number;
  itemsRejected: number;
  throughputPer10Ticks: number;
  rejectionRatePercent: number;
  modeShiftCount: number;
  piecesUsed: number;
  utilizationPercent: number;
}>;

export type AchievementId =
  | 'FIRST_DELIVERY'
  | 'LEVEL_01_COMPLETE'
  | 'LEVEL_02_COMPLETE'
  | 'LEVEL_03_COMPLETE'
  | 'ZERO_REJECTIONS_WIN'
  | 'THREE_STAR_MASTER'
  | 'SHIFT_AUTOMATION'
  | 'TUTORIAL_GRADUATE';

export type AchievementDefinition = Readonly<{
  id: AchievementId;
  titleKey: string;
  descriptionKey: string;
}>;

export type BlueprintComponentEntry = Readonly<{
  type: EditableComponentType;
  dx: number;
  dy: number;
  direction: Direction;
}>;

export type FactoryBlueprint = Readonly<{
  id: string;
  name: string;
  version: 1;
  components: readonly BlueprintComponentEntry[];
}>;

export type SaveVersion = 1 | 2;

export type GameDataV2 = Readonly<{
  version: 2;
  completedLevelIds: readonly string[];
  preferences: Readonly<{
    gameMode: 'CAMPAIGN' | 'SANDBOX';
    levelId: string;
    sourceSequenceMode: SourceSequenceMode;
  }>;
  bestResultsByLevel: Readonly<Record<string, LevelBestResult>>;
  tutorialCompletedIds: readonly string[];
  unlockedAchievements: readonly AchievementId[];
  blueprints: readonly FactoryBlueprint[];
}>;

export function createEmptyHistory(maxEntries = 40): EditorHistoryState {
  return Object.freeze({
    past: Object.freeze([]),
    future: Object.freeze([]),
    maxEntries,
  });
}

export function pushHistoryTransaction(
  history: EditorHistoryState,
  transaction: BuildTransaction,
): EditorHistoryState {
  const nextPast = [...history.past, transaction].slice(-history.maxEntries);
  return Object.freeze({
    past: Object.freeze(nextPast),
    future: Object.freeze([]),
    maxEntries: history.maxEntries,
  });
}

export function undoHistory(
  history: EditorHistoryState,
): Readonly<{ history: EditorHistoryState; restored: EditorState | null }> {
  if (history.past.length === 0) {
    return Object.freeze({ history, restored: null });
  }
  const last = history.past[history.past.length - 1]!;
  return Object.freeze({
    history: Object.freeze({
      past: Object.freeze(history.past.slice(0, -1)),
      future: Object.freeze([last, ...history.future]),
      maxEntries: history.maxEntries,
    }),
    restored: last.before,
  });
}

export function redoHistory(
  history: EditorHistoryState,
): Readonly<{ history: EditorHistoryState; restored: EditorState | null }> {
  if (history.future.length === 0) {
    return Object.freeze({ history, restored: null });
  }
  const next = history.future[0]!;
  return Object.freeze({
    history: Object.freeze({
      past: Object.freeze([...history.past, next].slice(-history.maxEntries)),
      future: Object.freeze(history.future.slice(1)),
      maxEntries: history.maxEntries,
    }),
    restored: next.after,
  });
}

export function extractBlueprintFromComponents(
  id: string,
  name: string,
  components: readonly Component[],
): FactoryBlueprint {
  const editable = components.filter(
    (c): c is Exclude<Component, { isFixed: true }> => !c.isFixed,
  );
  if (editable.length === 0) {
    return Object.freeze({ id, name, version: 1, components: Object.freeze([]) });
  }
  const minX = Math.min(...editable.map((c) => c.position.x));
  const minY = Math.min(...editable.map((c) => c.position.y));
  return Object.freeze({
    id,
    name,
    version: 1,
    components: Object.freeze(
      editable.map((c) =>
        Object.freeze({
          type: c.type,
          dx: c.position.x - minX,
          dy: c.position.y - minY,
          direction: c.direction,
        }),
      ),
    ),
  });
}
