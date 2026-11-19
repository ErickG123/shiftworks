import { describe, expect, it } from 'vitest';
import { DEFAULT_EDITOR_LEVEL } from './default-level.model';
import { createEditorState } from './editor.model';
import {
  createEmptyHistory,
  extractBlueprintFromComponents,
  pushHistoryTransaction,
  redoHistory,
  undoHistory,
} from './expansion-contracts.model';
import { reduceEditor } from '../editor/editor-reducer';

describe('EXP-01 expansion contracts (BuildTransaction, History, Blueprints)', () => {
  it('supports atomic Undo and Redo transactions preserving inventory and components', () => {
    const initial = createEditorState(DEFAULT_EDITOR_LEVEL);
    const placed = reduceEditor(initial, {
      kind: 'PLACE',
      componentType: 'CONVEYOR',
      position: { x: 1, y: 3 },
      direction: 'E',
    });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    let history = createEmptyHistory(10);
    history = pushHistoryTransaction(history, {
      id: 'tx-1',
      kind: 'PLACE_SINGLE',
      before: initial,
      after: placed.state,
      cellsAffected: [{ x: 1, y: 3 }],
    });

    const undone = undoHistory(history);
    expect(undone.restored).toBe(initial);
    expect(undone.restored?.inventory.CONVEYOR).toBe(16);

    const redone = redoHistory(undone.history);
    expect(redone.restored).toBe(placed.state);
    expect(redone.restored?.inventory.CONVEYOR).toBe(15);
  });

  it('extracts normalized relative coordinates for FactoryBlueprint without fixed components', () => {
    const initial = createEditorState(DEFAULT_EDITOR_LEVEL);
    const p1 = reduceEditor(initial, {
      kind: 'PLACE',
      componentType: 'CONVEYOR',
      position: { x: 2, y: 3 },
      direction: 'E',
    });
    if (!p1.ok) throw new Error('placement failed');
    const p2 = reduceEditor(p1.state, {
      kind: 'PLACE',
      componentType: 'PROCESSOR',
      position: { x: 3, y: 3 },
      direction: 'E',
    });
    if (!p2.ok) throw new Error('placement failed');

    const bp = extractBlueprintFromComponents('bp-1', 'Line', p2.state.components);
    expect(bp.version).toBe(1);
    expect(bp.components).toEqual([
      { type: 'CONVEYOR', dx: 0, dy: 0, direction: 'E' },
      { type: 'PROCESSOR', dx: 1, dy: 0, direction: 'E' },
    ]);
  });
});
