import type { GridCell, GridDimensions } from './grid.model';

export type Direction = 'N' | 'E' | 'S' | 'W';
export type ItemType = 'BLUE_BLANK' | 'AMBER_BLANK' | 'CUT_PLATE' | 'PRESSED_BLOCK';
export type MachineMode = 'CUT' | 'PRESS';
export type ProcessorRule = Readonly<{ when: 'BLUE_BLANK' | 'AMBER_BLANK'; then: MachineMode }>;
export type DiverterRule = Readonly<{ when: 'CUT_PLATE' | 'PRESSED_BLOCK'; then: 'A' | 'B' }>;
export type ComponentType = 'SOURCE' | 'CONVEYOR' | 'PROCESSOR' | 'DIVERTER' | 'OUTPUT';
export type EditableComponentType = 'CONVEYOR' | 'PROCESSOR' | 'DIVERTER';

export type ComponentBase = Readonly<{
  id: string;
  position: GridCell;
  direction: Direction;
}>;

export type SourceComponent = ComponentBase &
  Readonly<{
    type: 'SOURCE';
    isFixed: true;
    sequence: readonly ('BLUE_BLANK' | 'AMBER_BLANK')[];
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

export type OutputComponent = ComponentBase &
  Readonly<{
    type: 'OUTPUT';
    isFixed: true;
    acceptedTypes: readonly ItemType[];
    label: 'DOCK' | 'A' | 'B';
  }>;

export type EditableComponent = ConveyorComponent | ProcessorComponent | DiverterComponent;
export type FixedComponent = SourceComponent | OutputComponent;
export type Component = EditableComponent | FixedComponent;

export type ComponentInventory = Readonly<Record<EditableComponentType, number>>;
export type Goal = Readonly<{ outputId: string; itemType: ItemType; quantity: number }>;

export type LevelDefinition = Readonly<{
  id: string;
  width: number;
  height: number;
  fixedComponents: readonly FixedComponent[];
  inventory: ComponentInventory;
  goals: readonly Goal[];
  obstacles: readonly GridCell[];
  referenceLayoutId: string;
}>;

export function getCellKey(position: GridCell): string {
  return `${position.x},${position.y}`;
}

export function isEditableType(type: ComponentType): type is EditableComponentType {
  return type === 'CONVEYOR' || type === 'PROCESSOR' || type === 'DIVERTER';
}

export function gridDimensionsForLevel(level: LevelDefinition): GridDimensions {
  return Object.freeze({ width: level.width, height: level.height });
}
