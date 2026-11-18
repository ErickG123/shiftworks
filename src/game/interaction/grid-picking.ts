import type { Intersection, Object3D } from 'three';
import { isCellInBounds, type GridCell, type GridDimensions } from '../domain/grid.model';

export type GridIntersection = Pick<Intersection<Object3D>, 'object'>;

export function readGridCell(userData: Readonly<Record<string, unknown>>): GridCell | null {
  const value = userData['gridCell'];

  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const candidate = value as Partial<GridCell>;
  if (!Number.isInteger(candidate.x) || !Number.isInteger(candidate.y)) {
    return null;
  }

  return Object.freeze({ x: candidate.x as number, y: candidate.y as number });
}

export function pickGridCell(
  intersections: readonly GridIntersection[],
  dimensions: GridDimensions,
): GridCell | null {
  for (const intersection of intersections) {
    const cell = readGridCell(intersection.object.userData as Readonly<Record<string, unknown>>);
    if (cell && isCellInBounds(cell, dimensions)) {
      return cell;
    }
  }

  return null;
}
