import { describe, expect, it } from 'vitest';
import type { Component } from '../domain/component.model';
import { getLevel, LEVEL_CATALOG } from '../domain/level-catalog.model';
import {
  calculateStarRating,
  isBetterLevelResult,
} from '../domain/level-scoring.model';
import { createEditorState } from '../domain/editor.model';
import { createSimulationState, startSession } from '../domain/session.model';
import { reduceEditor } from '../editor/editor-reducer';
import { runLevelReference } from './reference-runner';
import { step } from './simulation-engine';

describe('catalog level reference solutions & L02 layout flexibility', () => {
  it.each(LEVEL_CATALOG)(
    '$id reference reaches every goal deterministically with 3 stars',
    (level) => {
      const state = runLevelReference(level);
      expect(state.mode).toBe('RESULT');
      expect(
        state.goals.every(({ goal, delivered }) => delivered === goal.quantity),
      ).toBe(true);
      expect(state.metrics.rejectedCount).toBe(0);
      if (['L01', 'L02', 'L03'].includes(level.id)) {
        expect(state.slots.every((slot) => slot.item === null)).toBe(true);
      }
      expect(state.metrics.piecesUsed).toBe(
        level.referenceComponents.filter((component) => !component.isFixed).length,
      );
      expect(calculateStarRating(level, state)).toBe(3);
    },
  );

  it('provides positive conveyor budget in L02 and returns removed pieces to inventory', () => {
    const l02 = getLevel('L02')!;
    expect(l02.inventory).toEqual({ CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 0 });

    let editor = createEditorState(l02);
    const placedConveyor = reduceEditor(editor, {
      kind: 'PLACE',
      componentType: 'CONVEYOR',
      position: { x: 1, y: 3 },
      direction: 'E',
    });
    expect(placedConveyor.ok).toBe(true);
    if (!placedConveyor.ok) return;
    editor = placedConveyor.state;
    expect(editor.inventory.CONVEYOR).toBe(9);

    const removedConveyor = reduceEditor(editor, {
      kind: 'REMOVE',
      componentId: 'piece-1',
    });
    expect(removedConveyor.ok).toBe(true);
    if (!removedConveyor.ok) return;
    expect(removedConveyor.state.inventory.CONVEYOR).toBe(10);
  });

  it('supports multiple distinct valid factory layouts in L02 (Processor at x=1, x=2, x=3, or x=4 with connecting conveyors)', () => {
    const l02 = getLevel('L02')!;

    for (const processorX of [1, 2, 3, 4]) {
      const components: Component[] = [...l02.fixedComponents];
      for (const x of [1, 2, 3, 4]) {
        if (x === processorX) {
          components.push({
            id: `p-${x}`,
            type: 'PROCESSOR',
            isFixed: false,
            position: { x, y: 3 },
            direction: 'E',
            defaultMode: 'CUT',
            rules: [
              { when: 'BLUE_BLANK', then: 'CUT' },
              { when: 'AMBER_BLANK', then: 'PRESS' },
            ],
          });
        } else {
          components.push({
            id: `c-${x}`,
            type: 'CONVEYOR',
            isFixed: false,
            position: { x, y: 3 },
            direction: 'E',
          });
        }
      }

      const started = startSession(createSimulationState(l02, components));
      expect(started.ok).toBe(true);
      if (!started.ok) continue;
      let state = started.state;
      for (let tick = 0; tick < 100 && state.mode === 'RUNNING'; tick += 1) {
        state = step(state).state;
      }
      expect(state.mode).toBe('RESULT');
      expect(state.metrics.rejectedCount).toBe(0);
      expect(state.metrics.itemsProducedByType).toMatchObject({
        CUT_PLATE: 3,
        PRESSED_BLOCK: 3,
      });
      expect(calculateStarRating(l02, state)).toBe(3);
    }
  });

  it('awards 1/2/3 stars from measured ticks, piece budget and rejection count, and compares records', () => {
    const level = LEVEL_CATALOG[0]!;
    const won = runLevelReference(level);
    expect(calculateStarRating(level, { ...won, tick: level.twoStarMaxTicks })).toBe(1);
    expect(
      calculateStarRating(level, {
        ...won,
        tick: level.twoStarMaxTicks - 1,
        metrics: { ...won.metrics, piecesUsed: level.threeStarMaxPieces + 1 },
      }),
    ).toBe(2);
    expect(
      calculateStarRating(level, {
        ...won,
        metrics: { ...won.metrics, rejectedCount: 1 },
      }),
    ).toBe(2);
    expect(calculateStarRating(level, { ...won, mode: 'RUNNING' })).toBe(0);

    expect(isBetterLevelResult({ stars: 3, ticks: 30, piecesUsed: 6 }, undefined)).toBe(
      true,
    );
    expect(
      isBetterLevelResult(
        { stars: 3, ticks: 29, piecesUsed: 6 },
        { stars: 3, ticks: 30, piecesUsed: 6 },
      ),
    ).toBe(true);
    expect(
      isBetterLevelResult(
        { stars: 2, ticks: 25, piecesUsed: 5 },
        { stars: 3, ticks: 30, piecesUsed: 6 },
      ),
    ).toBe(false);
  });
});
