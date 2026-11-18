import type { Component, LevelDefinition } from './component.model';

const source = Object.freeze({
  id: 'source-1', type: 'SOURCE' as const, isFixed: true as const,
  position: Object.freeze({ x: 0, y: 3 }), direction: 'E' as const,
  sequence: Object.freeze(['BLUE_BLANK' as const, 'AMBER_BLANK' as const]), intervalTicks: 10,
});
const outputA = Object.freeze({
  id: 'out-a', type: 'OUTPUT' as const, isFixed: true as const,
  position: Object.freeze({ x: 6, y: 3 }), direction: 'E' as const,
  acceptedTypes: Object.freeze(['CUT_PLATE' as const]), label: 'A' as const,
});
const outputB = Object.freeze({
  id: 'out-b', type: 'OUTPUT' as const, isFixed: true as const,
  position: Object.freeze({ x: 5, y: 5 }), direction: 'S' as const,
  acceptedTypes: Object.freeze(['PRESSED_BLOCK' as const]), label: 'B' as const,
});

export const L03_LEVEL: LevelDefinition = Object.freeze({
  id: 'L03', width: 8, height: 8,
  fixedComponents: Object.freeze([source, outputA, outputB]),
  inventory: Object.freeze({ CONVEYOR: 16, PROCESSOR: 1, DIVERTER: 1 }),
  goals: Object.freeze([
    Object.freeze({ outputId: 'out-a', itemType: 'CUT_PLATE' as const, quantity: 3 }),
    Object.freeze({ outputId: 'out-b', itemType: 'PRESSED_BLOCK' as const, quantity: 3 }),
  ]),
  obstacles: Object.freeze([]),
  referenceLayoutId: 'l03-route-reference',
});

export const L03_REFERENCE_COMPONENTS: readonly Component[] = Object.freeze([
  ...L03_LEVEL.fixedComponents,
  Object.freeze({ id: 'processor-1', type: 'PROCESSOR' as const, isFixed: false as const, position: Object.freeze({ x: 1, y: 3 }), direction: 'E' as const, defaultMode: 'CUT' as const, rules: Object.freeze([
    Object.freeze({ when: 'BLUE_BLANK' as const, then: 'CUT' as const }),
    Object.freeze({ when: 'AMBER_BLANK' as const, then: 'PRESS' as const }),
  ]) }),
  Object.freeze({ id: 'belt-1', type: 'CONVEYOR' as const, isFixed: false as const, position: Object.freeze({ x: 2, y: 3 }), direction: 'E' as const }),
  Object.freeze({ id: 'belt-2', type: 'CONVEYOR' as const, isFixed: false as const, position: Object.freeze({ x: 3, y: 3 }), direction: 'E' as const }),
  Object.freeze({ id: 'belt-3', type: 'CONVEYOR' as const, isFixed: false as const, position: Object.freeze({ x: 4, y: 3 }), direction: 'E' as const }),
  Object.freeze({ id: 'diverter-1', type: 'DIVERTER' as const, isFixed: false as const, position: Object.freeze({ x: 5, y: 3 }), direction: 'E' as const, rules: Object.freeze([
    Object.freeze({ when: 'CUT_PLATE' as const, then: 'A' as const }),
    Object.freeze({ when: 'PRESSED_BLOCK' as const, then: 'B' as const }),
  ]) }),
  Object.freeze({ id: 'belt-b', type: 'CONVEYOR' as const, isFixed: false as const, position: Object.freeze({ x: 5, y: 4 }), direction: 'S' as const }),
]);
