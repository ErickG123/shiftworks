import { describe, expect, it } from 'vitest';
import { completeLevel, isLevelUnlocked, nextUnlockedLevelId } from './level-progression.model';

describe('level progression', () => {
  it('starts with only L01 unlocked and unlocks one next level on completion', () => {
    let completed: readonly string[] = [];
    expect(isLevelUnlocked('L01', completed)).toBe(true);
    expect(isLevelUnlocked('L02', completed)).toBe(false);
    expect(nextUnlockedLevelId('L01', completed)).toBeNull();
    completed = completeLevel(completed, 'L01');
    expect(isLevelUnlocked('L02', completed)).toBe(true);
    expect(isLevelUnlocked('L03', completed)).toBe(false);
    expect(nextUnlockedLevelId('L01', completed)).toBe('L02');
    completed = completeLevel(completed, 'L02');
    expect(isLevelUnlocked('L03', completed)).toBe(true);
  });

  it('does not add unknown or duplicate level IDs', () => {
    expect(completeLevel(['L01'], 'L01')).toEqual(['L01']);
    expect(completeLevel([], 'L99')).toEqual([]);
    expect(isLevelUnlocked('L99', [])).toBe(false);
  });
});
