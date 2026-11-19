import type { GridCell, GridDimensions } from './grid.model';

export type Direction = 'N' | 'E' | 'S' | 'W';

export type ItemType =
  | 'BLUE_BLANK'
  | 'AMBER_BLANK'
  | 'CUT_PLATE'
  | 'PRESSED_BLOCK'
  | 'COPPER_BLANK'
  | 'COPPER_STRIP'
  | 'INSULATOR'
  | 'CIRCUIT'
  | 'FRAME'
  | 'CONTROL_MODULE'
  | 'AUTOMATION_UNIT';

export type MachineMode = 'CUT' | 'PRESS';

export type ProcessorRule = Readonly<{
  when: 'BLUE_BLANK' | 'AMBER_BLANK' | 'COPPER_BLANK';
  then: MachineMode;
}>;

export type DiverterRule = Readonly<{
  when: ItemType;
  then: 'A' | 'B';
}>;

export type AssemblerRecipeId =
  | 'CIRCUIT'
  | 'FRAME'
  | 'CONTROL_MODULE'
  | 'AUTOMATION_UNIT';

export type EditableComponentType =
  | 'CONVEYOR'
  | 'PROCESSOR'
  | 'DIVERTER'
  | 'BUFFER'
  | 'SENSOR'
  | 'SPLITTER'
  | 'MERGER'
  | 'ASSEMBLER';

export type ComponentType = 'SOURCE' | 'OUTPUT' | EditableComponentType;

export type ComponentBase = Readonly<{
  id: string;
  position: GridCell;
  direction: Direction;
}>;

export type SourceComponent = ComponentBase &
  Readonly<{
    type: 'SOURCE';
    isFixed: true;
    sequence: readonly ItemType[];
    intervalTicks: number;
  }>;

export type ConveyorComponent = ComponentBase &
  Readonly<{
    type: 'CONVEYOR';
    isFixed: false;
  }>;

export type ProcessorComponent = ComponentBase &
  Readonly<{
    type: 'PROCESSOR';
    isFixed: false;
    defaultMode: MachineMode;
    rules: readonly ProcessorRule[];
  }>;

export type DiverterComponent = ComponentBase &
  Readonly<{
    type: 'DIVERTER';
    isFixed: false;
    rules: readonly DiverterRule[];
  }>;

export type BufferComponent = ComponentBase &
  Readonly<{
    type: 'BUFFER';
    isFixed: false;
    capacity: number;
  }>;

export type SensorComponent = ComponentBase &
  Readonly<{
    type: 'SENSOR';
    isFixed: false;
    watchItemType: ItemType;
  }>;

export type SplitterComponent = ComponentBase &
  Readonly<{
    type: 'SPLITTER';
    isFixed: false;
  }>;

export type MergerComponent = ComponentBase &
  Readonly<{
    type: 'MERGER';
    isFixed: false;
  }>;

export type AssemblerComponent = ComponentBase &
  Readonly<{
    type: 'ASSEMBLER';
    isFixed: false;
    recipeId: AssemblerRecipeId;
  }>;

export type OutputComponent = ComponentBase &
  Readonly<{
    type: 'OUTPUT';
    isFixed: true;
    acceptedTypes: readonly ItemType[];
    label: 'DOCK' | 'A' | 'B';
  }>;

export type EditableComponent =
  | ConveyorComponent
  | ProcessorComponent
  | DiverterComponent
  | BufferComponent
  | SensorComponent
  | SplitterComponent
  | MergerComponent
  | AssemblerComponent;

export type FixedComponent = SourceComponent | OutputComponent;
export type Component = EditableComponent | FixedComponent;

export type ComponentInventory = Readonly<
  Record<'CONVEYOR' | 'PROCESSOR' | 'DIVERTER', number> &
    Partial<Record<'BUFFER' | 'SENSOR' | 'SPLITTER' | 'MERGER' | 'ASSEMBLER', number>>
>;

export type Goal = Readonly<{ outputId: string; itemType: ItemType; quantity: number }>;

export type LevelDefinition = Readonly<{
  id: string;
  sectorId?: string;
  width: number;
  height: number;
  fixedComponents: readonly FixedComponent[];
  inventory: ComponentInventory;
  goals: readonly Goal[];
  obstacles: readonly GridCell[];
  referenceLayoutId: string;
}>;

export const ALL_EDITABLE_TYPES: readonly EditableComponentType[] = Object.freeze([
  'CONVEYOR',
  'PROCESSOR',
  'DIVERTER',
  'BUFFER',
  'SENSOR',
  'SPLITTER',
  'MERGER',
  'ASSEMBLER',
]);

export function getInventoryCount(
  inventory: ComponentInventory,
  type: EditableComponentType,
): number {
  return inventory[type] ?? 0;
}

export function getCellKey(position: GridCell): string {
  return `${position.x},${position.y}`;
}

export function isEditableType(type: ComponentType): type is EditableComponentType {
  return (
    type === 'CONVEYOR' ||
    type === 'PROCESSOR' ||
    type === 'DIVERTER' ||
    type === 'BUFFER' ||
    type === 'SENSOR' ||
    type === 'SPLITTER' ||
    type === 'MERGER' ||
    type === 'ASSEMBLER'
  );
}

export function gridDimensionsForLevel(level: LevelDefinition): GridDimensions {
  return Object.freeze({ width: level.width, height: level.height });
}
