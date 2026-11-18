import type { Component, LevelDefinition } from './component.model';
import type { SimulationLayout } from './simulation.model';
import { isCellInBounds } from './grid.model';

export type LayoutValidationError =
  | Readonly<{ code: 'INVALID_DIMENSIONS' }>
  | Readonly<{ code: 'DUPLICATE_COMPONENT_ID'; componentId: string }>
  | Readonly<{ code: 'OUT_OF_BOUNDS'; componentId?: string; x: number; y: number }>
  | Readonly<{ code: 'CELL_OCCUPIED'; componentId: string; occupiedBy: string }>
  | Readonly<{ code: 'DUPLICATE_OBSTACLE'; x: number; y: number }>
  | Readonly<{ code: 'INVALID_SOURCE'; componentId: string }>
  | Readonly<{ code: 'TOO_MANY_RULES'; componentId: string }>
  | Readonly<{ code: 'DUPLICATE_RULE'; componentId: string; condition: string }>
  | Readonly<{ code: 'UNKNOWN_GOAL_OUTPUT'; outputId: string }>
  | Readonly<{ code: 'INVALID_GOAL'; outputId: string }>;

function cellKey(cell: Readonly<{ x: number; y: number }>): string { return `${cell.x},${cell.y}`; }

export function validateSimulationLayout(layout: Pick<SimulationLayout, 'width' | 'height' | 'components' | 'obstacles' | 'goals'>): readonly LayoutValidationError[] {
  const errors: LayoutValidationError[] = [];
  const dimensions = { width: layout.width, height: layout.height };
  if (!Number.isInteger(layout.width) || !Number.isInteger(layout.height) || layout.width < 1 || layout.height < 1) {
    errors.push(Object.freeze({ code: 'INVALID_DIMENSIONS' }));
    return Object.freeze(errors);
  }

  const ids = new Set<string>();
  const occupied = new Map<string, string>();
  for (const component of layout.components) {
    if (ids.has(component.id)) errors.push(Object.freeze({ code: 'DUPLICATE_COMPONENT_ID', componentId: component.id }));
    ids.add(component.id);
    if (!isCellInBounds(component.position, dimensions)) {
      errors.push(Object.freeze({ code: 'OUT_OF_BOUNDS', componentId: component.id, ...component.position }));
      continue;
    }
    const key = cellKey(component.position);
    const previous = occupied.get(key);
    if (previous) errors.push(Object.freeze({ code: 'CELL_OCCUPIED', componentId: component.id, occupiedBy: previous }));
    else occupied.set(key, component.id);
    validateComponent(component, errors);
  }

  const obstacleKeys = new Set<string>();
  for (const obstacle of layout.obstacles) {
    if (!isCellInBounds(obstacle, dimensions)) errors.push(Object.freeze({ code: 'OUT_OF_BOUNDS', ...obstacle }));
    const key = cellKey(obstacle);
    if (obstacleKeys.has(key)) errors.push(Object.freeze({ code: 'DUPLICATE_OBSTACLE', ...obstacle }));
    obstacleKeys.add(key);
    const componentId = occupied.get(key);
    if (componentId) errors.push(Object.freeze({ code: 'CELL_OCCUPIED', componentId, occupiedBy: 'OBSTACLE' }));
  }

  const outputs = new Map(layout.components.filter((component) => component.type === 'OUTPUT').map((component) => [component.id, component]));
  for (const goal of layout.goals) {
    const output = outputs.get(goal.outputId);
    if (!output) errors.push(Object.freeze({ code: 'UNKNOWN_GOAL_OUTPUT', outputId: goal.outputId }));
    if (!Number.isInteger(goal.quantity) || goal.quantity < 1 || (output && !output.acceptedTypes.includes(goal.itemType))) {
      errors.push(Object.freeze({ code: 'INVALID_GOAL', outputId: goal.outputId }));
    }
  }
  return Object.freeze(errors);
}

function validateComponent(component: Component, errors: LayoutValidationError[]): void {
  if (component.type === 'SOURCE' && (!Number.isInteger(component.intervalTicks) || component.intervalTicks < 1 || component.sequence.length === 0)) {
    errors.push(Object.freeze({ code: 'INVALID_SOURCE', componentId: component.id }));
  }
  if (component.type === 'PROCESSOR' || component.type === 'DIVERTER') {
    if (component.rules.length > 2) errors.push(Object.freeze({ code: 'TOO_MANY_RULES', componentId: component.id }));
    const conditions = new Set<string>();
    component.rules.forEach((rule) => {
      if (conditions.has(rule.when)) errors.push(Object.freeze({ code: 'DUPLICATE_RULE', componentId: component.id, condition: rule.when }));
      conditions.add(rule.when);
    });
  }
}

export function validateLevelDefinition(level: LevelDefinition, components: readonly Component[] = level.fixedComponents): readonly LayoutValidationError[] {
  return validateSimulationLayout({ width: level.width, height: level.height, components, obstacles: level.obstacles, goals: level.goals });
}

export class SimulationSetupError extends Error {
  constructor(readonly errors: readonly LayoutValidationError[]) {
    super(`Simulation layout has ${errors.length} validation error(s).`);
    this.name = 'SimulationSetupError';
  }
}
