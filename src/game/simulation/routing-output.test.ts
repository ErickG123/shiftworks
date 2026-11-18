import { describe, expect, it } from 'vitest';
import { DEFAULT_EDITOR_LEVEL } from '../domain/default-level.model';
import type { Component, LevelDefinition } from '../domain/component.model';
import { createSimulationState, startSession } from '../domain/session.model';
import type { SimulationState } from '../domain/simulation.model';
import { step } from './simulation-engine';

function start(level: LevelDefinition, components: readonly Component[]): SimulationState {
  const result = startSession(createSimulationState(level, components));
  if (!result.ok) throw new Error('Expected simulation to start.');
  return result.state;
}

function withItem(state: SimulationState, componentId: string, type: 'CUT_PLATE' | 'PRESSED_BLOCK'): SimulationState {
  return Object.freeze({ ...state, slots: Object.freeze(state.slots.map((slot) => slot.componentId === componentId
    ? Object.freeze({ ...slot, item: Object.freeze({ id: 'routed-item', type, sequence: 0, bornTick: 0, route: null }) })
    : slot)) });
}

describe('diverter routing and output goals', () => {
  it('routes a pressed block through B to the diverter right after rotation', () => {
    const diverter: Component = { id: 'diverter-1', type: 'DIVERTER', isFixed: false, position: { x: 3, y: 3 }, direction: 'N', rules: [{ when: 'PRESSED_BLOCK', then: 'B' }] };
    const belt: Component = { id: 'belt-right', type: 'CONVEYOR', isFixed: false, position: { x: 4, y: 3 }, direction: 'E' };
    let state = start(DEFAULT_EDITOR_LEVEL, [...DEFAULT_EDITOR_LEVEL.fixedComponents, diverter, belt]);
    state = withItem(state, diverter.id, 'PRESSED_BLOCK');
    const choice = step(state); state = choice.state;
    expect(choice.events).toContainEqual(expect.objectContaining({ kind: 'ROUTE_CHOSEN', route: 'B' }));
    expect(state.slots.find((slot) => slot.componentId === diverter.id)?.item?.route).toBe('B');
    const moved = step(state); state = moved.state;
    expect(moved.events).toContainEqual(expect.objectContaining({ kind: 'ITEM_MOVED', componentId: diverter.id, destinationId: belt.id }));
    expect(state.slots.find((slot) => slot.componentId === belt.id)?.item?.id).toBe('routed-item');
  });

  function outputFixture(goalQuantity = 1): { level: LevelDefinition; components: readonly Component[] } {
    const source = { ...DEFAULT_EDITOR_LEVEL.fixedComponents[0]!, position: { x: 0, y: 3 } };
    const output: Component = { id: 'target', type: 'OUTPUT', isFixed: true, position: { x: 2, y: 3 }, direction: 'E', acceptedTypes: ['CUT_PLATE'], label: 'A' };
    const level: LevelDefinition = { ...DEFAULT_EDITOR_LEVEL, fixedComponents: [source, output], goals: [{ outputId: output.id, itemType: 'CUT_PLATE', quantity: goalQuantity }] };
    const belt: Component = { id: 'delivery-belt', type: 'CONVEYOR', isFixed: false, position: { x: 1, y: 3 }, direction: 'E' };
    return { level, components: [...level.fixedComponents, belt] };
  }

  it('consumes an accepted product, advances only its goal and enters RESULT when complete', () => {
    const fixture = outputFixture();
    let state = withItem(start(fixture.level, fixture.components), 'delivery-belt', 'CUT_PLATE');
    const delivered = step(state); state = delivered.state;
    expect(delivered.events).toContainEqual(expect.objectContaining({ kind: 'ITEM_DELIVERED', goalOutputId: 'target', itemType: 'CUT_PLATE' }));
    expect(delivered.events).toContainEqual(expect.objectContaining({ kind: 'GOAL_COMPLETED', outputId: 'target' }));
    expect(state.mode).toBe('RESULT');
    expect(state.goals[0]?.delivered).toBe(1);
    expect(state.slots.find((slot) => slot.componentId === 'delivery-belt')?.item).toBeNull();
    expect(state.metrics.itemsDeliveredByOutput.target).toBe(1);
  });

  it('rejects a wrong output type and leaves goal progress unchanged', () => {
    const fixture = outputFixture();
    let state = withItem(start(fixture.level, fixture.components), 'delivery-belt', 'PRESSED_BLOCK');
    const rejected = step(state); state = rejected.state;
    expect(rejected.events).toContainEqual(expect.objectContaining({ kind: 'ITEM_REJECTED', reason: 'WRONG_TYPE' }));
    expect(state.metrics.rejectedCount).toBe(1);
    expect(state.goals[0]?.delivered).toBe(0);
    expect(state.mode).toBe('RUNNING');
  });

  it('tracks partial goals without declaring victory early', () => {
    const fixture = outputFixture(2);
    let state = withItem(start(fixture.level, fixture.components), 'delivery-belt', 'CUT_PLATE');
    state = step(state).state;
    expect(state.goals[0]?.delivered).toBe(1);
    expect(state.mode).toBe('RUNNING');
  });
});
