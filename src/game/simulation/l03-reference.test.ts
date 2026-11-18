import { describe, expect, it } from 'vitest';
import { L03_LEVEL, L03_REFERENCE_COMPONENTS } from '../domain/l03-level.model';
import { createSimulationState, startSession } from '../domain/session.model';
import type { SimulationState } from '../domain/simulation.model';
import { step } from './simulation-engine';

function playReference(): Readonly<{ state: SimulationState; history: readonly unknown[] }> {
  const started = startSession(createSimulationState(L03_LEVEL, L03_REFERENCE_COMPONENTS));
  if (!started.ok) throw new Error('Expected L03 reference layout to start.');
  let state = started.state;
  const history: unknown[] = [];
  for (let index = 0; index < 100 && state.mode === 'RUNNING'; index += 1) {
    const result = step(state);
    state = result.state;
    history.push({ state, events: result.events });
  }
  return Object.freeze({ state, history: Object.freeze(history) });
}

describe('L03 reference factory vertical slice', () => {
  it('routes three cut plates to A and three pressed blocks to B without input after Start', () => {
    const { state, history } = playReference();
    expect(state.mode).toBe('RESULT');
    expect(state.goals.map(({ goal, delivered }) => [goal.outputId, goal.itemType, delivered])).toEqual([
      ['out-a', 'CUT_PLATE', 3], ['out-b', 'PRESSED_BLOCK', 3],
    ]);
    expect(state.metrics.itemsEmitted).toBe(6);
    expect(state.metrics).toMatchObject({ rejectedCount: 0, modeShiftCount: 5, itemsDeliveredByOutput: { 'out-a': 3, 'out-b': 3 } });
    expect(state.metrics.itemsProducedByType).toMatchObject({ CUT_PLATE: 3, PRESSED_BLOCK: 3 });
    expect(state.slots.every((slot) => slot.item === null)).toBe(true);
    expect(history.length).toBeLessThan(100);
    const replay = startSession(state);
    expect(replay.ok).toBe(true);
    if (replay.ok) {
      expect(replay.state).toMatchObject({ tick: 0, mode: 'RUNNING' });
      expect(replay.state.slots.every((slot) => slot.item === null)).toBe(true);
    }
  });

  it('replays the same reference layout into identical state and event snapshots', () => {
    expect(JSON.stringify(playReference())).toBe(JSON.stringify(playReference()));
  });
});
