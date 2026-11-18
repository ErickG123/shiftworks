import { describe, expect, it } from 'vitest';
import { DEFAULT_EDITOR_LEVEL } from '../domain/default-level.model';
import type { Component } from '../domain/component.model';
import { createSimulationState, startSession } from '../domain/session.model';
import { step } from '../simulation/simulation-engine';
import { projectItems } from './item-projection';

describe('item scene projection', () => {
  it('maps a runtime slot item to its component grid cell without changing simulation state', () => {
    const layout: readonly Component[] = [...DEFAULT_EDITOR_LEVEL.fixedComponents, { id: 'belt-1', type: 'CONVEYOR', isFixed: false, position: { x: 1, y: 3 }, direction: 'E' }];
    const started = startSession(createSimulationState(DEFAULT_EDITOR_LEVEL, layout));
    if (!started.ok) throw new Error('Expected session to start.');
    let state = started.state;
    for (let tick = 0; tick < 5; tick += 1) state = step(state).state;
    const before = JSON.stringify(state);
    expect(projectItems(state)).toMatchObject([{ item: { id: 'source-1:0', type: 'BLUE_BLANK' }, position: { x: 1, y: 3 } }]);
    expect(JSON.stringify(state)).toBe(before);
  });
});
