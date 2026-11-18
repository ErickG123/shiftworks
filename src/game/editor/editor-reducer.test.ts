import { describe, expect, it } from 'vitest';
import { DEFAULT_EDITOR_LEVEL } from '../domain/default-level.model';
import { createEditorState } from '../domain/editor.model';
import { reduceEditor, validatePlacement } from './editor-reducer';

describe('editor reducer', () => {
  it('places a component and consumes inventory', () => {
    const initial = createEditorState(DEFAULT_EDITOR_LEVEL);
    const result = reduceEditor(initial, { kind: 'PLACE', componentType: 'CONVEYOR', position: { x: 1, y: 1 }, direction: 'E' });
    expect(result.ok).toBe(true);
    if (result.ok) { expect(result.state.components).toHaveLength(4); expect(result.state.inventory.CONVEYOR).toBe(15); }
  });

  it('places a processor with the two default recipes and lets the player replace them', () => {
    const initial = createEditorState(DEFAULT_EDITOR_LEVEL);
    const placed = reduceEditor(initial, { kind: 'PLACE', componentType: 'PROCESSOR', position: { x: 2, y: 2 }, direction: 'E' });
    if (!placed.ok) throw new Error('Expected processor placement to succeed.');
    const processor = placed.state.components.find((component) => component.id === 'piece-1');
    expect(processor?.type === 'PROCESSOR' && processor.rules).toEqual([
      { when: 'BLUE_BLANK', then: 'CUT' }, { when: 'AMBER_BLANK', then: 'PRESS' },
    ]);
    const changed = reduceEditor(placed.state, { kind: 'SET_PROCESSOR_RULES', componentId: 'piece-1', rules: [{ when: 'BLUE_BLANK', then: 'PRESS' }] });
    expect(changed.ok && changed.state.components.find((component) => component.id === 'piece-1')).toMatchObject({ rules: [{ when: 'BLUE_BLANK', then: 'PRESS' }] });
  });

  it('rejects duplicate and over-limit processor rules without changing the editor state', () => {
    const placed = reduceEditor(createEditorState(DEFAULT_EDITOR_LEVEL), { kind: 'PLACE', componentType: 'PROCESSOR', position: { x: 2, y: 2 }, direction: 'E' });
    if (!placed.ok) throw new Error('Expected processor placement to succeed.');
    const duplicate = reduceEditor(placed.state, { kind: 'SET_PROCESSOR_RULES', componentId: 'piece-1', rules: [
      { when: 'BLUE_BLANK', then: 'CUT' }, { when: 'BLUE_BLANK', then: 'PRESS' },
    ] });
    expect(duplicate).toMatchObject({ ok: false, error: { code: 'DUPLICATE_RULE' } });
    const tooMany = reduceEditor(placed.state, { kind: 'SET_PROCESSOR_RULES', componentId: 'piece-1', rules: [
      { when: 'BLUE_BLANK', then: 'CUT' }, { when: 'AMBER_BLANK', then: 'PRESS' }, { when: 'BLUE_BLANK', then: 'PRESS' },
    ] });
    expect(tooMany).toMatchObject({ ok: false, error: { code: 'TOO_MANY_RULES' } });
  });

  it('places default diverter routes and validates route configuration duplicates', () => {
    const placed = reduceEditor(createEditorState(DEFAULT_EDITOR_LEVEL), { kind: 'PLACE', componentType: 'DIVERTER', position: { x: 2, y: 2 }, direction: 'E' });
    if (!placed.ok) throw new Error('Expected diverter placement to succeed.');
    const diverter = placed.state.components.find((component) => component.id === 'piece-1');
    expect(diverter?.type === 'DIVERTER' && diverter.rules).toEqual([
      { when: 'CUT_PLATE', then: 'A' }, { when: 'PRESSED_BLOCK', then: 'B' },
    ]);
    const duplicate = reduceEditor(placed.state, { kind: 'SET_DIVERTER_RULES', componentId: 'piece-1', rules: [
      { when: 'CUT_PLATE', then: 'A' }, { when: 'CUT_PLATE', then: 'B' },
    ] });
    expect(duplicate).toMatchObject({ ok: false, error: { code: 'DUPLICATE_RULE' } });
  });

  it.each([
    ['outside board', { x: -1, y: 1 }, 'OUT_OF_BOUNDS'],
    ['occupied cell', { x: 0, y: 3 }, 'CELL_OCCUPIED'],
  ] as const)('rejects placement on %s', (_label, position, code) => {
    expect(validatePlacement(createEditorState(DEFAULT_EDITOR_LEVEL), 'CONVEYOR', position)).toBe(code);
  });

  it('rejects placement when inventory is empty', () => {
    const state = createEditorState({ ...DEFAULT_EDITOR_LEVEL, inventory: { CONVEYOR: 0, PROCESSOR: 0, DIVERTER: 0 } });
    expect(validatePlacement(state, 'PROCESSOR', { x: 2, y: 2 })).toBe('INVENTORY_EXCEEDED');
  });

  it('allows unlimited sandbox placement without consuming inventory', () => {
    const initial = createEditorState({ ...DEFAULT_EDITOR_LEVEL, inventory: { CONVEYOR: 0, PROCESSOR: 0, DIVERTER: 0 } }, { unlimitedInventory: true });
    const placed = reduceEditor(initial, { kind: 'PLACE', componentType: 'CONVEYOR', position: { x: 1, y: 1 }, direction: 'E' });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;
    expect(placed.state.inventory).toEqual(initial.inventory);
    const removed = reduceEditor(placed.state, { kind: 'REMOVE', componentId: 'piece-1' });
    expect(removed.ok && removed.state.inventory).toEqual(initial.inventory);
  });

  it('blocks edits outside EDITING mode', () => {
    const initial = createEditorState(DEFAULT_EDITOR_LEVEL);
    const state = reduceEditor(initial, { kind: 'SET_MODE', mode: 'RUNNING' });
    expect(state.ok && validatePlacement(state.state, 'CONVEYOR', { x: 2, y: 2 })).toBe('NOT_EDITING');
  });

  it('rejects fixed components and returns removed pieces to inventory', () => {
    const initial = createEditorState(DEFAULT_EDITOR_LEVEL);
    const fixed = reduceEditor(initial, { kind: 'REMOVE', componentId: 'source-1' });
    expect(fixed).toMatchObject({ ok: false, error: { code: 'FIXED_COMPONENT' } });
    const placed = reduceEditor(initial, { kind: 'PLACE', componentType: 'DIVERTER', position: { x: 2, y: 2 }, direction: 'N' });
    if (!placed.ok) throw new Error('Expected placement to succeed.');
    const removed = reduceEditor(placed.state, { kind: 'REMOVE', componentId: 'piece-1' });
    expect(removed.ok && removed.state.inventory.DIVERTER).toBe(1);
  });

  it('rotates clockwise and restores direction after four rotations', () => {
    let state = createEditorState(DEFAULT_EDITOR_LEVEL);
    const placed = reduceEditor(state, { kind: 'PLACE', componentType: 'CONVEYOR', position: { x: 2, y: 2 }, direction: 'N' });
    if (!placed.ok) throw new Error('Expected placement to succeed.');
    state = placed.state;
    for (const expected of ['E', 'S', 'W', 'N']) {
      const rotated = reduceEditor(state, { kind: 'ROTATE', componentId: 'piece-1' });
      if (!rotated.ok) throw new Error('Expected rotation to succeed.');
      state = rotated.state;
      expect(state.components.find((component) => component.id === 'piece-1')?.direction).toBe(expected);
    }
  });
});
