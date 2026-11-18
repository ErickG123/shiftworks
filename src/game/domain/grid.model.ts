export type GridCell = Readonly<{ x: number; y: number }>;

export type GridDimensions = Readonly<{ width: number; height: number }>;

export type WorldPoint = Readonly<{ x: number; z: number }>;

export const DEFAULT_GRID_DIMENSIONS: GridDimensions = Object.freeze({ width: 8, height: 8 });
export const DEFAULT_CELL_SIZE = 1;

function assertGridDimensions(dimensions: GridDimensions, cellSize: number): void {
  if (
    !Number.isInteger(dimensions.width) ||
    !Number.isInteger(dimensions.height) ||
    dimensions.width < 1 ||
    dimensions.height < 1
  ) {
    throw new RangeError('Grid dimensions must be positive integers.');
  }

  if (!Number.isFinite(cellSize) || cellSize <= 0) {
    throw new RangeError('Cell size must be a positive finite number.');
  }
}

export function isCellInBounds(cell: GridCell, dimensions: GridDimensions): boolean {
  return (
    Number.isInteger(cell.x) &&
    Number.isInteger(cell.y) &&
    cell.x >= 0 &&
    cell.y >= 0 &&
    cell.x < dimensions.width &&
    cell.y < dimensions.height
  );
}

export function gridToWorld(
  cell: GridCell,
  dimensions: GridDimensions = DEFAULT_GRID_DIMENSIONS,
  cellSize = DEFAULT_CELL_SIZE,
): WorldPoint {
  assertGridDimensions(dimensions, cellSize);
  return Object.freeze({
    x: (cell.x - (dimensions.width - 1) / 2) * cellSize,
    z: (cell.y - (dimensions.height - 1) / 2) * cellSize,
  });
}

export function worldToGrid(
  point: WorldPoint,
  dimensions: GridDimensions = DEFAULT_GRID_DIMENSIONS,
  cellSize = DEFAULT_CELL_SIZE,
): GridCell | null {
  assertGridDimensions(dimensions, cellSize);

  const x = Math.floor(point.x / cellSize + dimensions.width / 2);
  const y = Math.floor(point.z / cellSize + dimensions.height / 2);
  const cell = { x, y };

  return isCellInBounds(cell, dimensions) ? Object.freeze(cell) : null;
}
