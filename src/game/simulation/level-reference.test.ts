import { describe, expect, it } from 'vitest';
import { LEVEL_CATALOG } from '../domain/level-catalog.model';
import { calculateStarRating } from '../domain/level-scoring.model';
import { runLevelReference } from './reference-runner';

describe('catalog level reference solutions', () => {
  it.each(LEVEL_CATALOG)('$id reference reaches every goal deterministically', (level) => {
    const state = runLevelReference(level);
    expect(state.mode).toBe('RESULT');
    expect(state.goals.every(({ goal, delivered }) => delivered === goal.quantity)).toBe(true);
    expect(state.metrics.rejectedCount).toBe(0);
    expect(state.slots.every((slot) => slot.item === null)).toBe(true);
    expect(state.metrics.piecesUsed).toBe(level.referenceComponents.filter((component) => !component.isFixed).length);
    expect(calculateStarRating(level, state)).toBe(3);
  });

  it('awards 1/2/3 stars from measured ticks, piece budget and rejection count', () => {
    const level = LEVEL_CATALOG[0]!;
    const won = runLevelReference(level);
    expect(calculateStarRating(level, { ...won, tick: level.twoStarMaxTicks })).toBe(1);
    expect(calculateStarRating(level, { ...won, tick: level.twoStarMaxTicks - 1, metrics: { ...won.metrics, piecesUsed: level.threeStarMaxPieces + 1 } })).toBe(2);
    expect(calculateStarRating(level, { ...won, metrics: { ...won.metrics, rejectedCount: 1 } })).toBe(2);
    expect(calculateStarRating(level, { ...won, mode: 'RUNNING' })).toBe(0);
  });
});
