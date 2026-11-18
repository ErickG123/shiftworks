import { describe, expect, it } from 'vitest';
import type { Component } from './component.model';
import { findPortConnections, portsFor } from './ports.model';

const conveyor = (id: string, x: number, y: number, direction: 'N' | 'E' | 'S' | 'W'): Component => ({ id, type: 'CONVEYOR', isFixed: false, position: { x, y }, direction });

describe('component ports', () => {
  it('creates input and output ports for all four conveyor directions', () => {
    for (const direction of ['N', 'E', 'S', 'W'] as const) expect(portsFor(conveyor('c', 3, 3, direction))).toHaveLength(2);
    expect(portsFor(conveyor('c', 3, 3, 'N'))).toMatchObject([{ kind: 'INPUT', cell: { x: 3, y: 4 } }, { kind: 'OUTPUT', cell: { x: 3, y: 2 } }]);
  });

  it('rotates the diverter side output clockwise with its facing', () => {
    const expected = [
      ['N', 'E', { x: 4, y: 3 }], ['E', 'S', { x: 3, y: 4 }],
      ['S', 'W', { x: 2, y: 3 }], ['W', 'N', { x: 3, y: 2 }],
    ] as const;
    for (const [direction, side, cell] of expected) {
      const diverter: Component = { id: 'd', type: 'DIVERTER', isFixed: false, position: { x: 3, y: 3 }, direction, rules: [] };
      expect(portsFor(diverter)[2]).toMatchObject({ kind: 'OUTPUT', direction: side, cell });
    }
  });

  it('detects adjacent facing ports and ignores incompatible spacing', () => {
    const source: Component = { id: 's', type: 'SOURCE', isFixed: true, position: { x: 0, y: 0 }, direction: 'E', sequence: [], intervalTicks: 5 };
    const near = conveyor('near', 1, 0, 'E');
    expect(findPortConnections([source, near])).toHaveLength(1);
    expect(findPortConnections([source, conveyor('far', 2, 0, 'E')])).toHaveLength(0);
  });

  it('keeps an empty-acceptance Output physically connected so the engine can reject items', () => {
    const belt = conveyor('belt', 1, 0, 'E');
    const output: Component = { id: 'out', type: 'OUTPUT', isFixed: true, position: { x: 2, y: 0 }, direction: 'E', acceptedTypes: [], label: 'A' };
    expect(findPortConnections([belt, output])).toHaveLength(1);
  });
});
