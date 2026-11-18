import { LEVEL_CATALOG } from './level-catalog.model';

export type CompletedLevelIds = readonly string[];

export function isLevelUnlocked(levelId: string, completedLevels: CompletedLevelIds): boolean {
  const index = LEVEL_CATALOG.findIndex((level) => level.id === levelId);
  if (index < 0) return false;
  return index === 0 || completedLevels.includes(LEVEL_CATALOG[index - 1]!.id);
}

export function completeLevel(completedLevels: CompletedLevelIds, levelId: string): CompletedLevelIds {
  if (!LEVEL_CATALOG.some((level) => level.id === levelId) || completedLevels.includes(levelId)) return Object.freeze([...completedLevels]);
  return Object.freeze([...completedLevels, levelId]);
}

export function nextUnlockedLevelId(currentLevelId: string, completedLevels: CompletedLevelIds): string | null {
  const index = LEVEL_CATALOG.findIndex((level) => level.id === currentLevelId);
  const next = LEVEL_CATALOG[index + 1];
  return next && isLevelUnlocked(next.id, completedLevels) ? next.id : null;
}
