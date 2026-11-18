import { describe, expect, it } from 'vitest';
import { DEFAULT_EDITOR_LEVEL } from '../domain/default-level.model';
import type { Component, ItemType, MachineMode } from '../domain/component.model';
import { createSimulationState, startSession } from '../domain/session.model';
import type { SimulationState } from '../domain/simulation.model';
import { step } from './simulation-engine';

function makeProcessorState(mode: MachineMode, input: ItemType, rules: readonly { when: 'BLUE_BLANK' | 'AMBER_BLANK'; then: MachineMode }[]): SimulationState {
  const processor: Component = { id: 'processor-1', type: 'PROCESSOR', isFixed: false, position: { x: 1, y: 3 }, direction: 'E', defaultMode: mode, rules };
  const created = createSimulationState(DEFAULT_EDITOR_LEVEL, [...DEFAULT_EDITOR_LEVEL.fixedComponents, processor]);
  const started = startSession(created);
  if (!started.ok) throw new Error('Expected processor simulation to start.');
  // Seed at the input boundary to isolate processor timing from source/conveyor timing.
  return Object.freeze({ ...started.state, sources: Object.freeze([]), slots: Object.freeze(started.state.slots.map((slot) => slot.componentId === processor.id
    ? Object.freeze({ ...slot, item: Object.freeze({ id: 'test-item', type: input, sequence: 0, bornTick: 0, route: null }) })
    : slot)) });
}

function advance(state: SimulationState, count: number): SimulationState {
  for (let index = 0; index < count; index += 1) state = step(state).state;
  return state;
}

describe('processor mode shift, recipes and output retention', () => {
  it('processes BLUE in CUT mode in exactly three ticks and creates CUT_PLATE', () => {
    let state = makeProcessorState('CUT', 'BLUE_BLANK', [{ when: 'BLUE_BLANK', then: 'CUT' }]);
    const admission = step(state); state = admission.state;
    expect(state.processors[0]).toMatchObject({ phase: 'PROCESSING', ticksRemaining: 3 });
    state = advance(state, 2);
    expect(state.processors[0]).toMatchObject({ phase: 'PROCESSING', ticksRemaining: 1 });
    const completed = step(state); state = completed.state;
    expect(state.processors[0]).toMatchObject({ phase: 'READY', ticksRemaining: 0 });
    expect(state.slots.find((slot) => slot.componentId === 'processor-1')?.item?.type).toBe('CUT_PLATE');
    expect(completed.events).toContainEqual(expect.objectContaining({ kind: 'PROCESS_COMPLETED', itemType: 'CUT_PLATE' }));
    expect(state.metrics.itemsProducedByType.CUT_PLATE).toBe(1);
  });

  it('shifts a PRESS processor to CUT for blue, then processes for three more ticks', () => {
    let state = makeProcessorState('PRESS', 'BLUE_BLANK', [{ when: 'BLUE_BLANK', then: 'CUT' }]);
    state = step(state).state;
    expect(state.processors[0]).toMatchObject({ phase: 'SHIFTING', ticksRemaining: 2, mode: 'PRESS', targetMode: 'CUT' });
    state = advance(state, 1);
    expect(state.processors[0]).toMatchObject({ phase: 'SHIFTING', ticksRemaining: 1 });
    const shifted = step(state); state = shifted.state;
    expect(state.processors[0]).toMatchObject({ phase: 'PROCESSING', mode: 'CUT', ticksRemaining: 3 });
    expect(shifted.events.map((event) => event.kind)).toEqual(['MODE_SHIFT_COMPLETED', 'PROCESS_STARTED']);
    state = advance(state, 2);
    expect(state.processors[0]).toMatchObject({ phase: 'PROCESSING', ticksRemaining: 1 });
    state = step(state).state;
    expect(state.slots.find((slot) => slot.componentId === 'processor-1')?.item?.type).toBe('CUT_PLATE');
  });

  it('persists CUT mode and shifts back to PRESS for the following amber input', () => {
    let state = makeProcessorState('PRESS', 'BLUE_BLANK', [
      { when: 'BLUE_BLANK', then: 'CUT' }, { when: 'AMBER_BLANK', then: 'PRESS' },
    ]);
    state = advance(state, 6);
    expect(state.processors[0]).toMatchObject({ phase: 'READY', mode: 'CUT' });
    // Model the next item reaching the same machine after its prior product leaves.
    state = Object.freeze({ ...state,
      slots: Object.freeze(state.slots.map((slot) => slot.componentId === 'processor-1'
        ? Object.freeze({ ...slot, item: Object.freeze({ id: 'amber-next', type: 'AMBER_BLANK' as const, sequence: 1, bornTick: state.tick, route: null }) })
        : slot)),
      processors: Object.freeze(state.processors.map((runtime) => Object.freeze({ ...runtime, phase: 'IDLE' as const, ticksRemaining: 0, itemId: null }))),
    });
    state = advance(state, 1);
    expect(state.processors[0]).toMatchObject({ phase: 'SHIFTING', mode: 'CUT', targetMode: 'PRESS', ticksRemaining: 2 });
    state = advance(state, 5);
    expect(state.processors[0]).toMatchObject({ phase: 'READY', mode: 'PRESS' });
    expect(state.slots.find((slot) => slot.componentId === 'processor-1')?.item?.type).toBe('PRESSED_BLOCK');
  });

  it('keeps a completed product ready and does not process it again while output is unavailable', () => {
    let state = makeProcessorState('CUT', 'BLUE_BLANK', [{ when: 'BLUE_BLANK', then: 'CUT' }]);
    state = advance(state, 4);
    expect(state.processors[0]?.phase).toBe('READY');
    const again = step(state); state = again.state;
    expect(state.processors[0]?.phase).toBe('READY');
    expect(state.slots.find((slot) => slot.componentId === 'processor-1')?.item).toMatchObject({ id: 'test-item', type: 'CUT_PLATE' });
    expect(state.metrics.itemsProducedByType.CUT_PLATE).toBe(1);
    expect(state.diagnostics).toContainEqual({ componentId: 'processor-1', itemId: 'test-item', reason: 'NO_PORT' });
  });

  it('holds a missing-rule input and reports RULE_MISSING only once', () => {
    let state = makeProcessorState('CUT', 'BLUE_BLANK', [{ when: 'AMBER_BLANK', then: 'PRESS' }]);
    const first = step(state); state = first.state;
    expect(state.processors[0]).toMatchObject({ phase: 'RULE_MISSING', itemId: 'test-item' });
    expect(first.events).toContainEqual(expect.objectContaining({ kind: 'RULE_MISSING', itemId: 'test-item', itemType: 'BLUE_BLANK' }));
    expect(state.diagnostics).toContainEqual({ componentId: 'processor-1', itemId: 'test-item', reason: 'RULE_MISSING' });
    expect(step(state).events).toEqual([]);
    expect(state.slots.find((slot) => slot.componentId === 'processor-1')?.item?.id).toBe('test-item');
  });
});
