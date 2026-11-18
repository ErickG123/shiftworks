import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GRID_DIMENSIONS,
  gridToWorld,
  isCellInBounds,
  worldToGrid,
} from './grid.model';

describe('grid/world coordinate transforms', () => {
  it('centers the default 8×8 grid around the world origin', () => {
    expect(gridToWorld({ x: 0, y: 0 })).toEqual({ x: -3.5, z: -3.5 });
    expect(gridToWorld({ x: 7, y: 7 })).toEqual({ x: 3.5, z: 3.5 });
    expect(gridToWorld({ x: 3, y: 4 })).toEqual({ x: -0.5, z: 0.5 });
  });

  it('round-trips the center of every cell in the 8×8 grid', () => {
    for (let y = 0; y < DEFAULT_GRID_DIMENSIONS.height; y += 1) {
      for (let x = 0; x < DEFAULT_GRID_DIMENSIONS.width; x += 1) {
        const cell = { x, y };
        expect(worldToGrid(gridToWorld(cell))).toEqual(cell);
      }
    }
  });

  it('supports non-square grids and a non-default cell size', () => {
    const dimensions = { width: 4, height: 6 };
    const cell = { x: 3, y: 0 };
    const world = gridToWorld(cell, dimensions, 2);

    expect(world).toEqual({ x: 3, z: -5 });
    expect(worldToGrid(world, dimensions, 2)).toEqual(cell);
  });

  it('rejects coordinates outside the half-open world bounds', () => {
    expect(worldToGrid({ x: -4.001, z: 0 })).toBeNull();
    expect(worldToGrid({ x: 4, z: 0 })).toBeNull();
    expect(worldToGrid({ x: 0, z: Number.POSITIVE_INFINITY })).toBeNull();
  });

  it('validates cell bounds and dimensions', () => {
    expect(isCellInBounds({ x: 0, y: 0 }, DEFAULT_GRID_DIMENSIONS)).toBe(true);
    expect(isCellInBounds({ x: 8, y: 0 }, DEFAULT_GRID_DIMENSIONS)).toBe(false);
    expect(isCellInBounds({ x: 1.2, y: 0 }, DEFAULT_GRID_DIMENSIONS)).toBe(false);
    expect(() => gridToWorld({ x: 0, y: 0 }, { width: 0, height: 8 })).toThrow(RangeError);
    expect(() => gridToWorld({ x: 0, y: 0 }, DEFAULT_GRID_DIMENSIONS, 0)).toThrow(RangeError);
  });
});
