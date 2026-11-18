import type { PlayableLevel } from './level-catalog.model';
import type { SimulationState } from './simulation.model';

export type StarRating = 0 | 1 | 2 | 3;

export function calculateStarRating(level: PlayableLevel, state: SimulationState): StarRating {
  if (state.mode !== 'RESULT') return 0;
  if (state.tick < level.threeStarMaxTicks
    && state.metrics.piecesUsed <= level.threeStarMaxPieces
    && state.metrics.rejectedCount === 0) return 3;
  if (state.tick < level.twoStarMaxTicks) return 2;
  return 1;
}
