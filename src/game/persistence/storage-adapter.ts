import { LEVEL_CATALOG } from '../domain/level-catalog.model';
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
}>;
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

export const DEFAULT_GAME_DATA: GameData = Object.freeze({
  version: 1,
  completedLevelIds: Object.freeze([]),
  preferences: Object.freeze({ gameMode: 'CAMPAIGN', levelId: 'L01', sourceSequenceMode: 'ALTERNATING' }),
});

function decodeGameData(raw: string | null): GameData | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const record = value as Record<string, unknown>;
    if (record['version'] !== 1 || !Array.isArray(record['completedLevelIds']) || !record['preferences'] || typeof record['preferences'] !== 'object') return null;
    const preferences = record['preferences'] as Record<string, unknown>;
    const knownIds = new Set(LEVEL_CATALOG.map((level) => level.id));
    const completedLevelIds = [...new Set(record['completedLevelIds'].filter((id): id is string => typeof id === 'string' && knownIds.has(id)))];
    const levelId = typeof preferences['levelId'] === 'string' && knownIds.has(preferences['levelId']) ? preferences['levelId'] : 'L01';
    const gameMode: GameModePreference = preferences['gameMode'] === 'SANDBOX' ? 'SANDBOX' : 'CAMPAIGN';
    const sourceSequenceMode = isSourceSequenceMode(preferences['sourceSequenceMode']) ? preferences['sourceSequenceMode'] : 'ALTERNATING';
    return Object.freeze({ version: 1, completedLevelIds: Object.freeze(completedLevelIds), preferences: Object.freeze({ gameMode, levelId, sourceSequenceMode }) });
  } catch {
    return null;
  }
}

export class GameStorageAdapter {
  private memory: GameData = DEFAULT_GAME_DATA;

  constructor(private readonly getStorage: () => StoragePort | null = () => globalThis.localStorage) {}

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
