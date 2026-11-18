import type { LevelDefinition } from './component.model';

export const DEFAULT_EDITOR_LEVEL: LevelDefinition = Object.freeze({
  id: 'editor-preview',
  width: 8,
  height: 8,
  fixedComponents: Object.freeze([
    Object.freeze({
      id: 'source-1',
      type: 'SOURCE' as const,
      isFixed: true as const,
      position: Object.freeze({ x: 0, y: 3 }),
      direction: 'E' as const,
      sequence: Object.freeze(['BLUE_BLANK' as const, 'AMBER_BLANK' as const]),
      intervalTicks: 5,
    }),
    Object.freeze({
      id: 'out-a',
      type: 'OUTPUT' as const,
      isFixed: true as const,
      position: Object.freeze({ x: 7, y: 2 }),
      direction: 'E' as const,
      acceptedTypes: Object.freeze(['CUT_PLATE' as const]),
      label: 'A' as const,
    }),
    Object.freeze({
      id: 'out-b',
      type: 'OUTPUT' as const,
      isFixed: true as const,
      position: Object.freeze({ x: 6, y: 6 }),
      direction: 'S' as const,
      acceptedTypes: Object.freeze(['PRESSED_BLOCK' as const]),
      label: 'B' as const,
    }),
  ]),
  inventory: Object.freeze({ CONVEYOR: 16, PROCESSOR: 1, DIVERTER: 1 }),
  goals: Object.freeze([]),
  obstacles: Object.freeze([]),
  referenceLayoutId: 'editor-preview-reference',
});
