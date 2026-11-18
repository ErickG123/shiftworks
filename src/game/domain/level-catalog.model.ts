import type { Component, LevelDefinition } from './component.model';
import { L03_LEVEL, L03_REFERENCE_COMPONENTS } from './l03-level.model';

export type PlayableLevel = LevelDefinition & Readonly<{
  title: string;
  lesson: string;
  tutorial: string;
  referenceComponents: readonly Component[];
  twoStarMaxTicks: number;
  threeStarMaxTicks: number;
  threeStarMaxPieces: number;
}>;

const l01Source = Object.freeze({ id: 'source-1', type: 'SOURCE' as const, isFixed: true as const, position: Object.freeze({ x: 0, y: 3 }), direction: 'E' as const, sequence: Object.freeze(['BLUE_BLANK' as const]), intervalTicks: 8 });
const l01Output = Object.freeze({ id: 'dock', type: 'OUTPUT' as const, isFixed: true as const, position: Object.freeze({ x: 7, y: 3 }), direction: 'E' as const, acceptedTypes: Object.freeze(['BLUE_BLANK' as const]), label: 'DOCK' as const });
const L01_BASE: LevelDefinition = Object.freeze({
  id: 'L01', width: 8, height: 8, fixedComponents: Object.freeze([l01Source, l01Output]),
  inventory: Object.freeze({ CONVEYOR: 12, PROCESSOR: 0, DIVERTER: 0 }),
  goals: Object.freeze([Object.freeze({ outputId: 'dock', itemType: 'BLUE_BLANK' as const, quantity: 3 })]),
  obstacles: Object.freeze([]), referenceLayoutId: 'l01-reference',
});
const L01_REFERENCE: readonly Component[] = Object.freeze([
  ...L01_BASE.fixedComponents,
  ...Array.from({ length: 6 }, (_, index) => Object.freeze({ id: `belt-${index + 1}`, type: 'CONVEYOR' as const, isFixed: false as const, position: Object.freeze({ x: index + 1, y: 3 }), direction: 'E' as const })),
]);

const l02Source = Object.freeze({ id: 'source-1', type: 'SOURCE' as const, isFixed: true as const, position: Object.freeze({ x: 0, y: 3 }), direction: 'E' as const, sequence: Object.freeze(['BLUE_BLANK' as const, 'AMBER_BLANK' as const]), intervalTicks: 10 });
const l02Output = Object.freeze({ id: 'dock', type: 'OUTPUT' as const, isFixed: true as const, position: Object.freeze({ x: 2, y: 3 }), direction: 'E' as const, acceptedTypes: Object.freeze(['CUT_PLATE' as const, 'PRESSED_BLOCK' as const]), label: 'DOCK' as const });
const L02_BASE: LevelDefinition = Object.freeze({
  id: 'L02', width: 8, height: 8, fixedComponents: Object.freeze([l02Source, l02Output]),
  inventory: Object.freeze({ CONVEYOR: 0, PROCESSOR: 1, DIVERTER: 0 }),
  goals: Object.freeze([
    Object.freeze({ outputId: 'dock', itemType: 'CUT_PLATE' as const, quantity: 3 }),
    Object.freeze({ outputId: 'dock', itemType: 'PRESSED_BLOCK' as const, quantity: 3 }),
  ]),
  obstacles: Object.freeze([]), referenceLayoutId: 'l02-reference',
});
const L02_REFERENCE: readonly Component[] = Object.freeze([
  ...L02_BASE.fixedComponents,
  Object.freeze({ id: 'processor-1', type: 'PROCESSOR' as const, isFixed: false as const, position: Object.freeze({ x: 1, y: 3 }), direction: 'E' as const, defaultMode: 'CUT' as const, rules: Object.freeze([
    Object.freeze({ when: 'BLUE_BLANK' as const, then: 'CUT' as const }), Object.freeze({ when: 'AMBER_BLANK' as const, then: 'PRESS' as const }),
  ]) }),
]);

export const LEVEL_CATALOG: readonly PlayableLevel[] = Object.freeze([
  Object.freeze({ ...L01_BASE, title: 'First Line', lesson: 'Connect the source to the dock.', tutorial: 'Place six eastbound conveyors between the source and dock. Items move one cell each tick.', referenceComponents: L01_REFERENCE, twoStarMaxTicks: 31, threeStarMaxTicks: 31, threeStarMaxPieces: 6 }),
  Object.freeze({ ...L02_BASE, title: 'One Machine, Two Jobs', lesson: 'Teach one processor to change modes.', tutorial: 'Place a Processor beside the source. Its BLUE rule selects CUT and its AMBER rule selects PRESS; the same machine shifts automatically.', referenceComponents: L02_REFERENCE, twoStarMaxTicks: 66, threeStarMaxTicks: 66, threeStarMaxPieces: 1 }),
  Object.freeze({ ...L03_LEVEL, title: 'Smart Routing', lesson: 'Send each product to the matching output.', tutorial: 'Connect Source → Processor → Diverter. Route cut plates to A (front) and pressed blocks to B (right).', referenceComponents: L03_REFERENCE_COMPONENTS, twoStarMaxTicks: 71, threeStarMaxTicks: 71, threeStarMaxPieces: 6 }),
]);

export function getLevel(levelId: string): PlayableLevel | undefined {
  return LEVEL_CATALOG.find((level) => level.id === levelId);
}
