import { LEVEL_CATALOG } from '../domain/level-catalog.model';
import { isAchievementId } from '../domain/achievements.model';
import type { AchievementId } from '../domain/expansion-contracts.model';
import type { LevelBestResult, StarRating } from '../domain/level-scoring.model';
import { isSourceSequenceMode, type SourceSequenceMode } from '../domain/sandbox-level.model';

export const GAME_STORAGE_KEY = 'shiftworks.game-state.v1';
export type GameModePreference = 'CAMPAIGN' | 'SANDBOX';
export type GameData = Readonly<{
  version: 1;
  completedLevelIds: readonly string[];
  preferences: Readonly<{
    gameMode: GameModePreference;
    levelId: string;
    sourceSequenceMode: SourceSequenceMode;
  }>;
  bestResultsByLevel?: Readonly<Record<string, LevelBestResult>>;
  unlockedAchievements?: readonly AchievementId[];
  tutorialCompletedIds?: readonly string[];
  collectedItemsByType?: Readonly<Record<string, number>>;
}>;
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

export const DEFAULT_GAME_DATA: GameData = Object.freeze({
  version: 1,
  completedLevelIds: Object.freeze([]),
  preferences: Object.freeze({
    gameMode: 'CAMPAIGN',
    levelId: 'L01',
    sourceSequenceMode: 'ALTERNATING',
  }),
});

function isStarRating(value: unknown): value is StarRating {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

function decodeBestResults(
  raw: unknown,
  knownIds: ReadonlySet<string>,
): Readonly<Record<string, LevelBestResult>> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const entries: [string, LevelBestResult][] = [];
  for (const [levelId, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!knownIds.has(levelId) || !entry || typeof entry !== 'object') continue;
    const rec = entry as Record<string, unknown>;
    const stars = rec['stars'];
    const ticks = rec['ticks'];
    const piecesUsed = rec['piecesUsed'];
    if (
      isStarRating(stars) &&
      typeof ticks === 'number' &&
      Number.isInteger(ticks) &&
      ticks > 0 &&
      typeof piecesUsed === 'number' &&
      Number.isInteger(piecesUsed) &&
      piecesUsed >= 0
    ) {
      entries.push([
        levelId,
        Object.freeze({ stars, ticks, piecesUsed }),
      ]);
    }
  }
  return entries.length > 0 ? Object.freeze(Object.fromEntries(entries)) : undefined;
}

function decodeGameData(raw: string | null): GameData | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const record = value as Record<string, unknown>;
    if (
      record['version'] !== 1 ||
      !Array.isArray(record['completedLevelIds']) ||
      !record['preferences'] ||
      typeof record['preferences'] !== 'object'
    ) {
      return null;
    }
    const preferences = record['preferences'] as Record<string, unknown>;
    const knownIds = new Set(LEVEL_CATALOG.map((level) => level.id));
    const completedLevelIds = [
      ...new Set(
        record['completedLevelIds'].filter(
          (id): id is string => typeof id === 'string' && knownIds.has(id),
        ),
      ),
    ];
    const levelId =
      typeof preferences['levelId'] === 'string' && knownIds.has(preferences['levelId'])
        ? preferences['levelId']
        : 'L01';
    const gameMode: GameModePreference =
      preferences['gameMode'] === 'SANDBOX' ? 'SANDBOX' : 'CAMPAIGN';
    const sourceSequenceMode = isSourceSequenceMode(preferences['sourceSequenceMode'])
      ? preferences['sourceSequenceMode']
      : 'ALTERNATING';
    const bestResultsByLevel = decodeBestResults(record['bestResultsByLevel'], knownIds);
    const unlockedAchievements = Array.isArray(record['unlockedAchievements'])
      ? [...new Set(record['unlockedAchievements'].filter(isAchievementId))]
      : [];
    const tutorialCompletedIds = Array.isArray(record['tutorialCompletedIds'])
      ? [
          ...new Set(
            record['tutorialCompletedIds'].filter(
              (id): id is string => typeof id === 'string' && id.trim().length > 0,
            ),
          ),
        ]
      : [];
    const collectedEntries: [string, number][] = [];
    if (record['collectedItemsByType'] && typeof record['collectedItemsByType'] === 'object') {
      for (const [k, v] of Object.entries(
        record['collectedItemsByType'] as Record<string, unknown>,
      )) {
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
          collectedEntries.push([k, Math.floor(v)]);
        }
      }
    }
    const collectedItemsByType =
      collectedEntries.length > 0
        ? Object.freeze(Object.fromEntries(collectedEntries))
        : undefined;

    return Object.freeze({
      version: 1,
      completedLevelIds: Object.freeze(completedLevelIds),
      preferences: Object.freeze({ gameMode, levelId, sourceSequenceMode }),
      ...(bestResultsByLevel ? { bestResultsByLevel } : {}),
      ...(unlockedAchievements.length > 0
        ? { unlockedAchievements: Object.freeze(unlockedAchievements) }
        : {}),
      ...(tutorialCompletedIds.length > 0
        ? { tutorialCompletedIds: Object.freeze(tutorialCompletedIds) }
        : {}),
      ...(collectedItemsByType ? { collectedItemsByType } : {}),
    });
  } catch {
    return null;
  }
}

export class GameStorageAdapter {
  private memory: GameData = DEFAULT_GAME_DATA;

  constructor(
    private readonly getStorage: () => StoragePort | null = () => globalThis.localStorage,
  ) {}

  load(): GameData {
    try {
      const stored = decodeGameData(this.getStorage()?.getItem(GAME_STORAGE_KEY) ?? null);
      if (stored) this.memory = stored;
    } catch {
      // Storage can be disabled by privacy settings; keep the in-memory copy.
    }
    return this.memory;
  }

  save(data: GameData): boolean {
    this.memory = decodeGameData(JSON.stringify(data)) ?? DEFAULT_GAME_DATA;
    try {
      const storage = this.getStorage();
      if (!storage) return false;
      storage.setItem(GAME_STORAGE_KEY, JSON.stringify(this.memory));
      return true;
    } catch {
      return false;
    }
  }
}
