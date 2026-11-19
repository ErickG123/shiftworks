import type { PlayableLevel } from './level-catalog.model';
import type { SimulationState } from './simulation.model';

export type StarRating = 0 | 1 | 2 | 3;

export type LevelBestResult = Readonly<{
  stars: StarRating;
  ticks: number;
  piecesUsed: number;
}>;

export function calculateStarRating(level: PlayableLevel, state: SimulationState): StarRating {
  if (state.mode !== 'RESULT') return 0;
  if (
    state.tick < level.threeStarMaxTicks &&
    state.metrics.piecesUsed <= level.threeStarMaxPieces &&
    state.metrics.rejectedCount === 0
  ) {
    return 3;
  }
  if (state.tick < level.twoStarMaxTicks) return 2;
  return 1;
}

export function isBetterLevelResult(
  candidate: LevelBestResult,
  previous: LevelBestResult | undefined,
): boolean {
  if (!previous) return true;
  if (candidate.stars !== previous.stars) return candidate.stars > previous.stars;
  if (candidate.ticks !== previous.ticks) return candidate.ticks < previous.ticks;
  return candidate.piecesUsed < previous.piecesUsed;
}
