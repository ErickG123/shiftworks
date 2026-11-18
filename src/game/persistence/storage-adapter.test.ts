import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME_DATA, GAME_STORAGE_KEY, GameStorageAdapter, type StoragePort } from './storage-adapter';

class MemoryStorage implements StoragePort {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  seed(key: string, value: string): void { this.values.set(key, value); }
}

describe('best-effort local game storage', () => {
  it('round-trips progression and preferences in the versioned record', () => {
    const storage = new MemoryStorage();
    const adapter = new GameStorageAdapter(() => storage);
    expect(adapter.save({ ...DEFAULT_GAME_DATA, completedLevelIds: ['L01'], preferences: { gameMode: 'SANDBOX', levelId: 'L02', sourceSequenceMode: 'AMBER' } })).toBe(true);
    expect(storage.getItem(GAME_STORAGE_KEY)).toContain('"version":1');
    expect(new GameStorageAdapter(() => storage).load()).toMatchObject({ completedLevelIds: ['L01'], preferences: { gameMode: 'SANDBOX', levelId: 'L02', sourceSequenceMode: 'AMBER' } });
  });

  it('falls back to defaults for corrupt or unsupported data', () => {
    const storage = new MemoryStorage();
    storage.seed(GAME_STORAGE_KEY, '{broken');
    expect(new GameStorageAdapter(() => storage).load()).toEqual(DEFAULT_GAME_DATA);
    storage.seed(GAME_STORAGE_KEY, JSON.stringify({ ...DEFAULT_GAME_DATA, version: 9 }));
    expect(new GameStorageAdapter(() => storage).load()).toEqual(DEFAULT_GAME_DATA);
  });

  it('keeps progress in memory when storage is blocked or quota is exceeded', () => {
    const denied = new GameStorageAdapter(() => { throw new DOMException('Blocked', 'SecurityError'); });
    const data = { ...DEFAULT_GAME_DATA, completedLevelIds: ['L01'] };
    expect(denied.save(data)).toBe(false);
    expect(denied.load().completedLevelIds).toEqual(['L01']);

    const quotaExceeded = new GameStorageAdapter(() => ({ getItem: () => null, setItem: () => { throw new DOMException('Full', 'QuotaExceededError'); } }));
    expect(quotaExceeded.save(data)).toBe(false);
    expect(quotaExceeded.load().completedLevelIds).toEqual(['L01']);
  });

  it('sanitizes unknown level IDs and invalid source preferences', () => {
    const storage = new MemoryStorage();
    storage.seed(GAME_STORAGE_KEY, JSON.stringify({ version: 1, completedLevelIds: ['L01', 'L99'], preferences: { gameMode: 'invalid', levelId: 'L88', sourceSequenceMode: 'UNKNOWN' } }));
    expect(new GameStorageAdapter(() => storage).load()).toEqual({
      version: 1,
      completedLevelIds: ['L01'],
      preferences: { gameMode: 'CAMPAIGN', levelId: 'L01', sourceSequenceMode: 'ALTERNATING' },
    });
  });
});
