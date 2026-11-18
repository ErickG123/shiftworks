import { describe, expect, it } from 'vitest';
import { DEFAULT_EDITOR_LEVEL } from '../domain/default-level.model';
import type { Component } from '../domain/component.model';
import { createSimulationState, editSession, pauseSession, resetSession, resumeSession, startSession } from '../domain/session.model';
import { EventSequencer } from './event-sequencer';
import { step } from './simulation-engine';
import type { ItemInstance, SimulationState } from '../domain/simulation.model';

const initialComponents: readonly Component[] = [
  ...DEFAULT_EDITOR_LEVEL.fixedComponents,
  { id: 'belt-1', type: 'CONVEYOR', isFixed: false, position: { x: 1, y: 3 }, direction: 'E' },
  { id: 'processor-1', type: 'PROCESSOR', isFixed: false, position: { x: 2, y: 3 }, direction: 'E', defaultMode: 'CUT', rules: [] },
];

function runTicks(ticks: number) {
  let state = createSimulationState(DEFAULT_EDITOR_LEVEL, initialComponents);
  const started = startSession(state);
  if (!started.ok) throw new Error('Expected session start to be valid.');
  state = started.state;
  const snapshots = [];
  for (let index = 0; index < ticks; index += 1) {
    const result = step(state);
    state = result.state;
    snapshots.push({ state, events: result.events });
  }
  return snapshots;
}

function runningState(components: readonly Component[]): SimulationState {
  const started = startSession(createSimulationState(DEFAULT_EDITOR_LEVEL, components));
  if (!started.ok) throw new Error('Expected session start to be valid.');
  return started.state;
}

describe('simulation session and deterministic tick core', () => {
  it('creates runtime slots separately from the immutable layout', () => {
    const state = createSimulationState(DEFAULT_EDITOR_LEVEL, initialComponents);
    expect(state.mode).toBe('EDITING');
    expect(state.slots.map((slot) => slot.componentId)).toEqual(['belt-1', 'processor-1']);
    expect(state.slots.every((slot) => slot.item === null)).toBe(true);
    expect(state.layout.components).toHaveLength(initialComponents.length);
    expect(Object.isFrozen(state.layout.components)).toBe(true);
  });

  it('replays the same N ticks into identical snapshots and events', () => {
    expect(JSON.stringify(runTicks(12))).toBe(JSON.stringify(runTicks(12)));
  });

  it('advances exactly one logical tick and does not advance while paused', () => {
    const started = startSession(createSimulationState(DEFAULT_EDITOR_LEVEL, initialComponents));
    if (!started.ok) throw new Error('Expected session start to be valid.');
    const first = step(started.state);
    expect(first.state.tick).toBe(1);
    const paused = pauseSession(first.state);
    if (!paused.ok) throw new Error('Expected pause to be valid.');
    const frozen = step(paused.state);
    expect(frozen.state).toBe(paused.state);
    expect(frozen.state.tick).toBe(1);
    expect(frozen.events).toEqual([]);
  });

  it('transitions start, pause, resume, edit and reset while preserving layout', () => {
    const initial = createSimulationState(DEFAULT_EDITOR_LEVEL, initialComponents);
    const running = startSession(initial);
    expect(running.ok && running.state.mode).toBe('RUNNING');
    if (!running.ok) return;
    const paused = pauseSession(running.state);
    expect(paused.ok && paused.state.mode).toBe('PAUSED');
    if (!paused.ok) return;
    const resumed = resumeSession(paused.state);
    expect(resumed.ok && resumed.state.mode).toBe('RUNNING');
    if (!resumed.ok) return;
    const edited = editSession(resumed.state);
    expect(edited.ok && edited.state.mode).toBe('EDITING');
    if (!edited.ok) return;
    expect(edited.state.layout).toBe(initial.layout);
    expect(edited.state.tick).toBe(0);
    expect(edited.state.slots.every((slot) => slot.item === null)).toBe(true);
    const reset = resetSession(resumed.state);
    expect(reset.mode).toBe('EDITING');
    expect(reset.layout).toBe(initial.layout);
  });

  it('rejects invalid session transitions without changing state', () => {
    const editing = createSimulationState(DEFAULT_EDITOR_LEVEL);
    expect(pauseSession(editing)).toEqual({ ok: false, state: editing, error: 'INVALID_TRANSITION' });
    const started = startSession(editing);
    if (!started.ok) throw new Error('Expected start to succeed.');
    expect(startSession(started.state)).toEqual({ ok: false, state: started.state, error: 'INVALID_TRANSITION' });
  });
});

describe('simulation event sequence', () => {
  it('assigns stable, zero-based sequence numbers within the tick', () => {
    const log = new EventSequencer(5);
    const first = log.push({ kind: 'BLOCKED', componentId: 'belt-1', reason: 'NO_PORT' });
    const second = log.push({ kind: 'GOAL_COMPLETED', outputId: 'out-a', itemType: 'CUT_PLATE' });
    expect([first.tick, first.sequence, second.tick, second.sequence]).toEqual([5, 0, 5, 1]);
    expect(log.snapshot()).toEqual([first, second]);
  });
});

describe('source emission and conveyor transport', () => {
  it('emits the first sequence item on tick five and moves at most one cell per tick', () => {
    const components: readonly Component[] = [
      ...DEFAULT_EDITOR_LEVEL.fixedComponents,
      { id: 'belt-1', type: 'CONVEYOR', isFixed: false, position: { x: 1, y: 3 }, direction: 'E' },
      { id: 'belt-2', type: 'CONVEYOR', isFixed: false, position: { x: 2, y: 3 }, direction: 'E' },
      { id: 'belt-3', type: 'CONVEYOR', isFixed: false, position: { x: 3, y: 3 }, direction: 'E' },
    ];
    let state = runningState(components);
    for (let tick = 0; tick < 4; tick += 1) {
      const result = step(state); state = result.state; expect(result.events).toEqual([]);
    }
    const emitted = step(state); state = emitted.state;
    expect(emitted.state.tick).toBe(5);
    expect(emitted.events).toMatchObject([{ kind: 'ITEM_EMITTED', componentId: 'source-1', item: { id: 'source-1:0', type: 'BLUE_BLANK', sequence: 0 } }]);
    expect(state.slots.find((slot) => slot.componentId === 'belt-1')?.item?.id).toBe('source-1:0');
    const moved = step(state);
    expect(moved.events).toMatchObject([{ kind: 'ITEM_MOVED', componentId: 'belt-1', destinationId: 'belt-2', itemId: 'source-1:0' }]);
    expect(moved.state.slots.find((slot) => slot.componentId === 'belt-2')?.item?.id).toBe('source-1:0');
    expect(moved.state.slots.find((slot) => slot.componentId === 'belt-3')?.item).toBeNull();
  });

  it('preserves a blocked source ordinal and emits that same item when congestion clears', () => {
    const belts: readonly Component[] = Array.from({ length: 7 }, (_, index) => ({ id: `belt-${index + 1}`, type: 'CONVEYOR' as const, isFixed: false as const, position: { x: index + 1, y: 3 }, direction: 'E' as const }));
    let state = runningState([...DEFAULT_EDITOR_LEVEL.fixedComponents, ...belts]);
    const seeded: ItemInstance[] = Array.from({ length: 6 }, (_, index) => ({ id: `seed:${index}`, type: 'BLUE_BLANK', sequence: index, bornTick: 0, route: null }));
    state = Object.freeze({ ...state, slots: Object.freeze(state.slots.map((slot) => {
      const index = Number(slot.componentId.replace('belt-', '')) - 1;
      return Object.freeze({ ...slot, item: index >= 0 && index < seeded.length ? seeded[index]! : null });
    })) });

    for (let tick = 0; tick < 4; tick += 1) state = step(state).state;
    const firstBlocked = step(state); state = firstBlocked.state;
    expect(firstBlocked.events).toContainEqual(expect.objectContaining({ kind: 'BLOCKED', componentId: 'source-1', itemId: 'source-1:0', reason: 'SOURCE_BLOCKED' }));
    expect(state.sources[0]).toMatchObject({ emissionOrdinal: 0, pending: true, nextDueTick: 5 });
    const resumed = step(state);
    expect(resumed.events).toContainEqual(expect.objectContaining({ kind: 'ITEM_EMITTED', item: expect.objectContaining({ id: 'source-1:0', type: 'BLUE_BLANK' }) }));
    expect(resumed.state.sources[0]).toMatchObject({ emissionOrdinal: 1, pending: false, nextDueTick: 11 });
    expect(resumed.state.slots.filter((slot) => slot.item?.id === 'source-1:0')).toHaveLength(1);
  });

  it('reports a conveyor without an output port once and keeps its item in place', () => {
    const components: readonly Component[] = [
      ...DEFAULT_EDITOR_LEVEL.fixedComponents,
      { id: 'belt-1', type: 'CONVEYOR', isFixed: false, position: { x: 1, y: 3 }, direction: 'E' },
    ];
    let state = runningState(components);
    for (let tick = 0; tick < 5; tick += 1) state = step(state).state;
    const firstBlocked = step(state); state = firstBlocked.state;
    expect(firstBlocked.events).toContainEqual(expect.objectContaining({ kind: 'BLOCKED', componentId: 'belt-1', itemId: 'source-1:0', reason: 'NO_PORT' }));
    const repeatedEvents = [];
    let nextBlocked = step(state);
    repeatedEvents.push(...firstBlocked.events, ...nextBlocked.events);
    state = nextBlocked.state;
    for (let tick = 0; tick < 9; tick += 1) {
      nextBlocked = step(state);
      repeatedEvents.push(...nextBlocked.events);
      state = nextBlocked.state;
    }
    expect(repeatedEvents.filter((event) => event.kind === 'BLOCKED' && event.componentId === 'belt-1')).toHaveLength(1);
    expect(state.slots.find((slot) => slot.componentId === 'belt-1')?.item?.id).toBe('source-1:0');
    expect(state.diagnostics).toContainEqual({ componentId: 'belt-1', itemId: 'source-1:0', reason: 'NO_PORT' });
    expect(state.metrics).toMatchObject({ itemsEmitted: 1, itemsMoved: 0 });
  });

  it('keeps a conveyor item blocked by an occupied destination for ten ticks', () => {
    const components: readonly Component[] = [
      ...DEFAULT_EDITOR_LEVEL.fixedComponents,
      { id: 'belt-1', type: 'CONVEYOR', isFixed: false, position: { x: 1, y: 3 }, direction: 'E' },
      { id: 'belt-2', type: 'CONVEYOR', isFixed: false, position: { x: 2, y: 3 }, direction: 'E' },
    ];
    let state = runningState(components);
    state = Object.freeze({ ...state, slots: Object.freeze(state.slots.map((slot) => Object.freeze({
      ...slot,
      item: slot.componentId === 'belt-1'
        ? { id: 'seed:1', type: 'BLUE_BLANK' as const, sequence: 1, bornTick: 0, route: null }
        : slot.componentId === 'belt-2'
          ? { id: 'seed:2', type: 'AMBER_BLANK' as const, sequence: 2, bornTick: 0, route: null }
          : null,
    }))) });
    const events = [];
    for (let tick = 0; tick < 10; tick += 1) {
      const result = step(state); state = result.state; events.push(...result.events);
    }
    expect(state.slots.find((slot) => slot.componentId === 'belt-1')?.item?.id).toBe('seed:1');
    expect(state.slots.find((slot) => slot.componentId === 'belt-2')?.item?.id).toBe('seed:2');
    expect(state.diagnostics).toContainEqual({ componentId: 'belt-1', itemId: 'seed:1', reason: 'DESTINATION_OCCUPIED' });
    expect(events.filter((event) => event.kind === 'BLOCKED' && event.componentId === 'belt-1')).toHaveLength(1);
    expect(state.metrics).toMatchObject({ itemsEmitted: 0, itemsMoved: 0 });
  });

  it('cycles source material and deterministic IDs at each successful interval', () => {
    const components: readonly Component[] = [
      ...DEFAULT_EDITOR_LEVEL.fixedComponents,
      { id: 'belt-1', type: 'CONVEYOR', isFixed: false, position: { x: 1, y: 3 }, direction: 'E' },
      { id: 'belt-2', type: 'CONVEYOR', isFixed: false, position: { x: 2, y: 3 }, direction: 'E' },
      { id: 'belt-3', type: 'CONVEYOR', isFixed: false, position: { x: 3, y: 3 }, direction: 'E' },
      { id: 'belt-4', type: 'CONVEYOR', isFixed: false, position: { x: 4, y: 3 }, direction: 'E' },
    ];
    let state = runningState(components);
    const emissions = [];
    for (let tick = 0; tick < 15; tick += 1) {
      const result = step(state); state = result.state;
      emissions.push(...result.events.filter((event) => event.kind === 'ITEM_EMITTED'));
    }
    expect(emissions.map((event) => event.kind === 'ITEM_EMITTED' ? [event.item.id, event.item.type] : null)).toEqual([
      ['source-1:0', 'BLUE_BLANK'], ['source-1:1', 'AMBER_BLANK'], ['source-1:2', 'BLUE_BLANK'],
    ]);
    const liveIds = state.slots.flatMap((slot) => slot.item ? [slot.item.id] : []);
    expect(new Set(liveIds).size).toBe(liveIds.length);
    expect(state.metrics.itemsEmitted).toBe(3);
  });
});
