import { describe, expect, it } from 'vitest';
import { createSandboxLevel, type SourceSequenceMode } from '../domain/sandbox-level.model';
import type { FixedComponent } from '../domain/component.model';
import { createSimulationState, startSession } from '../domain/session.model';
import { step } from './simulation-engine';

function runSandbox(mode: SourceSequenceMode) {
  const level = createSandboxLevel(mode);
  const started = startSession(createSimulationState(level, level.referenceComponents));
  if (!started.ok) throw new Error('Expected the Sandbox example to start.');
  let state = started.state;
  const emitted: string[] = [];
  for (let tick = 0; tick < 180; tick += 1) {
    const result = step(state);
    state = result.state;
    emitted.push(...result.events.filter((event) => event.kind === 'ITEM_EMITTED').map((event) => event.item.type));
  }
  return { state, emitted };
}

describe('shared Sandbox simulation', () => {
  it.each([
    ['BLUE', 'BLUE_BLANK'],
    ['AMBER', 'AMBER_BLANK'],
    ['ALTERNATING', 'BLUE_BLANK'],
  ] as const)('uses the normal engine with the %s source profile', (mode, firstItem) => {
    const { state, emitted } = runSandbox(mode);
    expect(state.mode).toBe('RUNNING');
    expect(state.goals).toEqual([]);
    expect(emitted[0]).toBe(firstItem);
    expect(Object.values(state.metrics.itemsDeliveredByOutput).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0);
    expect(state.metrics.rejectedCount).toBe(0);
  });

  it('counts accepted alternating products independently at Output A and Output B', () => {
    const { state } = runSandbox('ALTERNATING');
    expect(state.metrics.itemsDeliveredByOutput['out-a']).toBeGreaterThan(0);
    expect(state.metrics.itemsDeliveredByOutput['out-b']).toBeGreaterThan(0);
  });

  it('still rejects items that an output does not accept when the Sandbox has no goals', () => {
    const level = createSandboxLevel('BLUE');
    const components: readonly FixedComponent[] = [
      Object.freeze({ id: 'source-test', type: 'SOURCE', isFixed: true, position: { x: 0, y: 0 }, direction: 'E', sequence: Object.freeze(['BLUE_BLANK' as const]), intervalTicks: 1 }),
      Object.freeze({ id: 'output-test', type: 'OUTPUT', isFixed: true, position: { x: 1, y: 0 }, direction: 'E', acceptedTypes: Object.freeze(['CUT_PLATE' as const]), label: 'DOCK' }),
    ];
    let state = startSession(createSimulationState({ ...level, fixedComponents: components }, components));
    if (!state.ok) throw new Error('Expected the no-goal layout to start.');
    state = { ok: true, state: step(state.state).state };
    expect(state.state.metrics.rejectedCount).toBe(1);
    expect(state.state.metrics.itemsDeliveredByOutput['output-test']).toBeUndefined();
  });
});
