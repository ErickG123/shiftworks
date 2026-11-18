import type {
  Component,
  ComponentInventory,
  DiverterRule,
  EditableComponentType,
  LevelDefinition,
  ProcessorRule,
} from './component.model';
import type { GridCell } from './grid.model';

export type EditorMode = 'EDITING' | 'RUNNING' | 'PAUSED' | 'RESULT';

export type EditorState = Readonly<{
  levelId: string;
  width: number;
  height: number;
  mode: EditorMode;
  components: readonly Component[];
  inventory: ComponentInventory;
  unlimitedInventory: boolean;
  nextComponentOrdinal: number;
}>;

export type EditorCommand =
  | Readonly<{
      kind: 'PLACE';
      componentType: EditableComponentType;
      position: GridCell;
      direction: 'N' | 'E' | 'S' | 'W';
    }>
  | Readonly<{ kind: 'ROTATE'; componentId: string }>
  | Readonly<{ kind: 'REMOVE'; componentId: string }>
  | Readonly<{ kind: 'SET_PROCESSOR_RULES'; componentId: string; rules: readonly ProcessorRule[] }>
  | Readonly<{ kind: 'SET_DIVERTER_RULES'; componentId: string; rules: readonly DiverterRule[] }>
  | Readonly<{ kind: 'SET_MODE'; mode: EditorMode }>;

export type EditorErrorCode =
  | 'NOT_EDITING'
  | 'OUT_OF_BOUNDS'
  | 'CELL_OCCUPIED'
  | 'FIXED_COMPONENT'
  | 'INVENTORY_EXCEEDED'
  | 'UNKNOWN_COMPONENT'
  | 'DUPLICATE_RULE'
  | 'TOO_MANY_RULES'
  | 'UNSUPPORTED_RULE';

export type EditorError = Readonly<{ code: EditorErrorCode; componentId?: string }>;

export type EditorResult =
  | Readonly<{ ok: true; state: EditorState }>
  | Readonly<{ ok: false; state: EditorState; error: EditorError }>;

export function createEditorState(level: LevelDefinition, options: Readonly<{ unlimitedInventory?: boolean; components?: readonly Component[] }> = {}): EditorState {
  return Object.freeze({
    levelId: level.id,
    width: level.width,
    height: level.height,
    mode: 'EDITING',
    components: Object.freeze([...(options.components ?? level.fixedComponents)]),
    inventory: Object.freeze({ ...level.inventory }),
    unlimitedInventory: options.unlimitedInventory ?? false,
    nextComponentOrdinal: 1,
  });
}
