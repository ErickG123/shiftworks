import { describe, expect, it } from 'vitest';
import { getLevel } from '../domain/level-catalog.model';
import { createEditorState } from '../domain/editor.model';
import {
  buildOrthogonalCells,
  commitConveyorDragPath,
  planConveyorDragPath,
} from './drag-path-planner';

describe('drag-path-planner (EXP-02 SW-101)', () => {
  it('plans a 6-cell eastbound conveyor drag path across L01 and commits atomically', () => {
    const l01 = getLevel('L01')!;
    const state = createEditorState(l01);

    const plan = planConveyorDragPath(state, { x: 1, y: 3 }, { x: 6, y: 3 }, 'E');
    expect(plan.valid).toBe(true);
    expect(plan.cost).toBe(6);
    expect(plan.segments.every((s) => s.direction === 'E' && s.valid)).toBe(true);

    const committed = commitConveyorDragPath(state, plan);
    expect(committed.ok).toBe(true);
    if (!committed.ok) return;
    expect(committed.state.inventory.CONVEYOR).toBe(6);
    expect(committed.state.components.filter((c) => !c.isFixed)).toHaveLength(6);
  });

  it('orients L-shaped corner drags along the path direction', () => {
    const cells = buildOrthogonalCells({ x: 1, y: 1 }, { x: 3, y: 3 });
    expect(cells).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
    ]);

    const l01 = getLevel('L01')!;
    const state = createEditorState(l01);
    const plan = planConveyorDragPath(state, { x: 1, y: 1 }, { x: 3, y: 3 }, 'E');
    expect(plan.segments.map((s) => s.direction)).toEqual(['E', 'E', 'S', 'S', 'S']);
  });

  it('rejects drag path atomically when inventory is insufficient or a cell is occupied', () => {
    const l01 = getLevel('L01')!;
    const lowStock = createEditorState({
      ...l01,
      inventory: { CONVEYOR: 2, PROCESSOR: 0, DIVERTER: 0 },
    });
    const tooLong = planConveyorDragPath(lowStock, { x: 1, y: 3 }, { x: 4, y: 3 }, 'E');
    expect(tooLong.valid).toBe(false);
    expect(tooLong.error).toBe('INVENTORY_EXCEEDED');

    const failedCommit = commitConveyorDragPath(lowStock, tooLong);
    expect(failedCommit.ok).toBe(false);
    expect(failedCommit.state).toBe(lowStock);

    // Dragging over fixed source at (0, 3) is rejected
    const blocked = planConveyorDragPath(
      createEditorState(l01),
      { x: 0, y: 3 },
      { x: 2, y: 3 },
      'E',
    );
    expect(blocked.valid).toBe(false);
    expect(blocked.error).toBe('CELL_OCCUPIED');
  });
});
