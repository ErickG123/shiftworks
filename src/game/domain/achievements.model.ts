import type { AchievementDefinition, AchievementId } from './expansion-contracts.model';
import type { StarRating } from './level-scoring.model';
import type { SimulationState } from './simulation.model';

export const ACHIEVEMENT_CATALOG: readonly AchievementDefinition[] = Object.freeze([
  Object.freeze({
    id: 'FIRST_DELIVERY',
    titleKey: 'achievements.FIRST_DELIVERY.title',
    descriptionKey: 'achievements.FIRST_DELIVERY.desc',
  }),
  Object.freeze({
    id: 'LEVEL_01_COMPLETE',
    titleKey: 'achievements.LEVEL_01_COMPLETE.title',
    descriptionKey: 'achievements.LEVEL_01_COMPLETE.desc',
  }),
  Object.freeze({
    id: 'LEVEL_02_COMPLETE',
    titleKey: 'achievements.LEVEL_02_COMPLETE.title',
    descriptionKey: 'achievements.LEVEL_02_COMPLETE.desc',
  }),
  Object.freeze({
    id: 'LEVEL_03_COMPLETE',
    titleKey: 'achievements.LEVEL_03_COMPLETE.title',
    descriptionKey: 'achievements.LEVEL_03_COMPLETE.desc',
  }),
  Object.freeze({
    id: 'ZERO_REJECTIONS_WIN',
    titleKey: 'achievements.ZERO_REJECTIONS_WIN.title',
    descriptionKey: 'achievements.ZERO_REJECTIONS_WIN.desc',
  }),
  Object.freeze({
    id: 'THREE_STAR_MASTER',
    titleKey: 'achievements.THREE_STAR_MASTER.title',
    descriptionKey: 'achievements.THREE_STAR_MASTER.desc',
  }),
  Object.freeze({
    id: 'SHIFT_AUTOMATION',
    titleKey: 'achievements.SHIFT_AUTOMATION.title',
    descriptionKey: 'achievements.SHIFT_AUTOMATION.desc',
  }),
  Object.freeze({
    id: 'TUTORIAL_GRADUATE',
    titleKey: 'achievements.TUTORIAL_GRADUATE.title',
    descriptionKey: 'achievements.TUTORIAL_GRADUATE.desc',
  }),
]);

export const KNOWN_ACHIEVEMENT_IDS: ReadonlySet<string> = new Set(
  ACHIEVEMENT_CATALOG.map((entry) => entry.id),
);

export function isAchievementId(value: unknown): value is AchievementId {
  return typeof value === 'string' && KNOWN_ACHIEVEMENT_IDS.has(value);
}

/**
 * Evaluates newly earned achievements strictly from verified simulation completion state.
 * Never awards achievements on UI navigation or invalid/incomplete runs.
 */
export function evaluateSimulationAchievements(
  state: SimulationState,
  levelId: string,
  stars: StarRating,
  alreadyUnlocked: readonly AchievementId[],
): readonly AchievementId[] {
  const unlocked = new Set<AchievementId>(alreadyUnlocked);
  const newlyEarned: AchievementId[] = [];

  const award = (id: AchievementId): void => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      newlyEarned.push(id);
    }
  };

  const totalDelivered = Object.values(state.metrics.itemsDeliveredByOutput).reduce(
    (sum, count) => sum + count,
    0,
  );
  if (totalDelivered > 0) {
    award('FIRST_DELIVERY');
  }

  if (state.mode !== 'RESULT') {
    return Object.freeze(newlyEarned);
  }

  if (levelId === 'L01') award('LEVEL_01_COMPLETE');
  if (levelId === 'L02') award('LEVEL_02_COMPLETE');
  if (levelId === 'L03') award('LEVEL_03_COMPLETE');

  if (state.metrics.rejectedCount === 0) {
    award('ZERO_REJECTIONS_WIN');
  }
  if (stars === 3) {
    award('THREE_STAR_MASTER');
  }
  if (state.metrics.modeShiftCount >= 1) {
    award('SHIFT_AUTOMATION');
  }

  return Object.freeze(newlyEarned);
}

export function mergeAchievements(
  existing: readonly AchievementId[],
  newlyEarned: readonly AchievementId[],
): readonly AchievementId[] {
  if (newlyEarned.length === 0) return existing;
  return Object.freeze([...new Set([...existing, ...newlyEarned])]);
}
