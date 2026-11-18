import { describe, expect, it } from 'vitest';
import { createSandboxEditorState, createSandboxLevel, type SourceSequenceMode } from './sandbox-level.model';
import { reduceEditor } from '../editor/editor-reducer';

describe('Sandbox level state', () => {
  it.each([
    ['BLUE', ['BLUE_BLANK']],
    ['AMBER', ['AMBER_BLANK']],
    ['ALTERNATING', ['BLUE_BLANK', 'AMBER_BLANK']],
  ] as const)('applies the %s source profile to the default example', (mode: SourceSequenceMode, sequence) => {
    const level = createSandboxLevel(mode);
    const source = level.referenceComponents.find((component) => component.type === 'SOURCE');
    expect(source?.type === 'SOURCE' && source.sequence).toEqual(sequence);
    expect(level.goals).toEqual([]);
  });

  it('clears only the layout to fixed pieces and keeps unlimited inventory enabled', () => {
    const level = createSandboxLevel('ALTERNATING');
    const example = createSandboxEditorState(level, level.referenceComponents);
    const placed = reduceEditor(example, { kind: 'PLACE', componentType: 'CONVEYOR', position: { x: 0, y: 0 }, direction: 'E' });
    expect(placed.ok).toBe(true);
    const cleared = createSandboxEditorState(level);
    expect(cleared.components).toEqual(level.fixedComponents);
    expect(cleared.unlimitedInventory).toBe(true);
    expect(cleared.inventory).toEqual(level.inventory);
  });
});
