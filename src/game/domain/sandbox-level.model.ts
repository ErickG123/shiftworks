import type { Component, LevelDefinition, SourceComponent } from './component.model';
import { createEditorState, type EditorState } from './editor.model';
import { L03_LEVEL, L03_REFERENCE_COMPONENTS } from './l03-level.model';

export type SourceSequenceMode = 'BLUE' | 'AMBER' | 'ALTERNATING';
export type SandboxLevel = LevelDefinition & Readonly<{
  title: string;
  lesson: string;
  tutorial: string;
  referenceComponents: readonly Component[];
  twoStarMaxTicks: number;
  threeStarMaxTicks: number;
  threeStarMaxPieces: number;
}>;

type SourceSequence = SourceComponent['sequence'];
const sequenceFor: Readonly<Record<SourceSequenceMode, SourceSequence>> = Object.freeze({
  BLUE: Object.freeze(['BLUE_BLANK' as const]),
  AMBER: Object.freeze(['AMBER_BLANK' as const]),
  ALTERNATING: Object.freeze(['BLUE_BLANK' as const, 'AMBER_BLANK' as const]),
});

export const SANDBOX_EXAMPLE_COMPONENTS: readonly Component[] = L03_REFERENCE_COMPONENTS;

export function createSandboxLevel(sourceMode: SourceSequenceMode): SandboxLevel {
  const referenceComponents = SANDBOX_EXAMPLE_COMPONENTS.map((component) => component.type === 'SOURCE'
    ? Object.freeze({ ...component, sequence: sequenceFor[sourceMode] })
    : component);
  const fixedComponents = L03_LEVEL.fixedComponents.map((component) => component.type === 'SOURCE'
    ? Object.freeze({ ...component, sequence: sequenceFor[sourceMode] })
    : component);
  return Object.freeze({
    ...L03_LEVEL,
    id: 'SANDBOX',
    fixedComponents: Object.freeze(fixedComponents),
    inventory: Object.freeze({ CONVEYOR: 0, PROCESSOR: 0, DIVERTER: 0 }),
    goals: Object.freeze([]),
    referenceLayoutId: 'sandbox-example-v1',
    title: 'Sandbox',
    lesson: 'Experiment freely with the factory systems.',
    tutorial: 'Place unlimited components, choose a source sequence, then Start. Outputs count every accepted delivery; there is no win condition.',
    referenceComponents: Object.freeze(referenceComponents),
    twoStarMaxTicks: Number.MAX_SAFE_INTEGER,
    threeStarMaxTicks: Number.MAX_SAFE_INTEGER,
    threeStarMaxPieces: Number.MAX_SAFE_INTEGER,
  });
}

export function isSourceSequenceMode(value: unknown): value is SourceSequenceMode {
  return value === 'BLUE' || value === 'AMBER' || value === 'ALTERNATING';
}

export function createSandboxEditorState(level: SandboxLevel, components: readonly Component[] = level.fixedComponents): EditorState {
  return createEditorState(level, { unlimitedInventory: true, components });
}
