import { describe, expect, it } from 'vitest';
import { interpolatePosition } from './interpolation';

describe('visual position interpolation', () => {
  it('eases between snapshots without changing either snapshot', () => {
    const from = Object.freeze({ x: 0, y: 0.5, z: 0 });
    const to = Object.freeze({ x: 4, y: 0.5, z: 2 });
    expect(interpolatePosition(from, to, 0)).toEqual(from);
    expect(interpolatePosition(from, to, 0.5)).toEqual({ x: 2, y: 0.5, z: 1 });
    expect(interpolatePosition(from, to, 1)).toEqual(to);
    expect(from).toEqual({ x: 0, y: 0.5, z: 0 });
    expect(to).toEqual({ x: 4, y: 0.5, z: 2 });
  });

  it('clamps invalid and out-of-range progress', () => {
    const from = { x: 1, y: 2, z: 3 };
    const to = { x: 5, y: 6, z: 7 };
    expect(interpolatePosition(from, to, -1)).toEqual(from);
    expect(interpolatePosition(from, to, 2)).toEqual(to);
    expect(interpolatePosition(from, to, Number.NaN)).toEqual(from);
  });
});
