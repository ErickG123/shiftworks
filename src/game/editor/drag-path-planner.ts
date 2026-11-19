import type { Direction } from '../domain/component.model';
import type { EditorErrorCode, EditorState } from '../domain/editor.model';
import type { GridCell } from '../domain/grid.model';
import { reduceEditor, validatePlacement } from './editor-reducer';

export type PlannedConveyorSegment = Readonly<{
  position: GridCell;
  direction: Direction;
  valid: boolean;
  error: EditorErrorCode | null;
}>;

export type DragPathPlan = Readonly<{
  segments: readonly PlannedConveyorSegment[];
  valid: boolean;
  cost: number;
  error: EditorErrorCode | null;
}>;

function directionBetween(from: GridCell, to: GridCell, fallback: Direction): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx > 0) return 'E';
    if (dx < 0) return 'W';
  }
  if (dy > 0) return 'S';
  if (dy < 0) return 'N';
  return fallback;
}

/**
 * Plans an orthogonal grid path from `start` to `end` (horizontal-first when |dx| >= |dy|,
 * vertical-first otherwise) and orients each conveyor segment along the flow direction.
 */
export function buildOrthogonalCells(start: GridCell, end: GridCell): readonly GridCell[] {
  const cells: GridCell[] = [Object.freeze({ x: start.x, y: start.y })];
  let cx = start.x;
  let cy = start.y;
  const horizontalFirst = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y);

  const stepX = (): void => {
    const dir = end.x > cx ? 1 : -1;
    while (cx !== end.x) {
      cx += dir;
      cells.push(Object.freeze({ x: cx, y: cy }));
    }
  };

  const stepY = (): void => {
    const dir = end.y > cy ? 1 : -1;
    while (cy !== end.y) {
      cy += dir;
      cells.push(Object.freeze({ x: cx, y: cy }));
    }
  };

  if (horizontalFirst) {
    stepX();
    stepY();
  } else {
    stepY();
    stepX();
  }

  return Object.freeze(cells);
}

export function planConveyorDragPath(
  state: EditorState,
  start: GridCell,
  end: GridCell,
  fallbackDirection: Direction,
): DragPathPlan {
  const rawCells = buildOrthogonalCells(start, end);
  let remainingBudget = state.unlimitedInventory ? Number.MAX_SAFE_INTEGER : state.inventory.CONVEYOR;
  let firstError: EditorErrorCode | null = null;

  const segments: PlannedConveyorSegment[] = rawCells.map((cell, index) => {
    const nextCell = rawCells[index + 1];
    const prevCell = rawCells[index - 1];
    const direction = nextCell
      ? directionBetween(cell, nextCell, fallbackDirection)
      : prevCell
        ? directionBetween(prevCell, cell, fallbackDirection)
        : fallbackDirection;

    let error = validatePlacement(state, 'CONVEYOR', cell);
    if (!error && remainingBudget <= 0) {
      error = 'INVENTORY_EXCEEDED';
    }
    if (!error) {
      remainingBudget -= 1;
    } else if (!firstError) {
      firstError = error;
    }

    return Object.freeze({
      position: cell,
      direction,
      valid: error === null,
      error,
    });
  });

  return Object.freeze({
    segments: Object.freeze(segments),
    valid: firstError === null && segments.length > 0,
    cost: segments.length,
    error: firstError,
  });
}

export function commitConveyorDragPath(
  state: EditorState,
  plan: DragPathPlan,
): Readonly<{ ok: true; state: EditorState } | { ok: false; state: EditorState; error: EditorErrorCode }> {
  if (!plan.valid) {
    return Object.freeze({
      ok: false,
      state,
      error: plan.error ?? 'CELL_OCCUPIED',
    });
  }

  let nextState = state;
  for (const segment of plan.segments) {
    const result = reduceEditor(nextState, {
      kind: 'PLACE',
      componentType: 'CONVEYOR',
      position: segment.position,
      direction: segment.direction,
    });
    if (!result.ok) {
      return Object.freeze({ ok: false, state, error: result.error.code });
    }
    nextState = result.state;
  }

  return Object.freeze({ ok: true, state: nextState });
}
