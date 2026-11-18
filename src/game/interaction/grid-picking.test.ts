import { describe, expect, it } from 'vitest';
import type { Object3D } from 'three';
import { DEFAULT_GRID_DIMENSIONS } from '../domain/grid.model';
import { pickGridCell, readGridCell, type GridIntersection } from './grid-picking';

function hit(userData: Readonly<Record<string, unknown>>): GridIntersection {
  return { object: { userData } as unknown as Object3D };
}

describe('grid raycast result selection', () => {
  it('skips decorative meshes and returns the first valid cell collider', () => {
    const decorative = hit({ decoration: true });
    const cellCollider = hit({ gridCell: { x: 4, y: 6 } });

    expect(pickGridCell([decorative, cellCollider], DEFAULT_GRID_DIMENSIONS)).toEqual({ x: 4, y: 6 });
  });

  it('rejects malformed and out-of-bounds collider metadata', () => {
    expect(readGridCell({ gridCell: { x: '2', y: 3 } })).toBeNull();
    expect(pickGridCell([hit({ gridCell: { x: -1, y: 3 } })], DEFAULT_GRID_DIMENSIONS)).toBeNull();
    expect(pickGridCell([hit({ gridCell: { x: 2.4, y: 3 } })], DEFAULT_GRID_DIMENSIONS)).toBeNull();
  });
});
