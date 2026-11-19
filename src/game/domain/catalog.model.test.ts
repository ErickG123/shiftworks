import { describe, expect, it } from 'vitest';
import { buildCatalogEntries, filterAndSortCatalog } from './catalog.model';

describe('catalog.model', () => {
  it('derives LOCKED, UNLOCKED, and DISCOVERED states from real campaign progress without leaking locked items', () => {
    const freshEntries = buildCatalogEntries([]);
    const conveyor = freshEntries.find((e) => e.id === 'CONVEYOR')!;
    const processor = freshEntries.find((e) => e.id === 'PROCESSOR')!;
    const assembler = freshEntries.find((e) => e.id === 'ASSEMBLER')!;
    const blueBlank = freshEntries.find((e) => e.id === 'BLUE_BLANK')!;
    const circuit = freshEntries.find((e) => e.id === 'CIRCUIT')!;

    expect(conveyor.status).toBe('UNLOCKED');
    expect(conveyor.unlockLevelId).toBe('L01');
    expect(processor.status).toBe('LOCKED');
    expect(processor.unlockLevelId).toBe('L02');
    expect(assembler.status).toBe('LOCKED');
    expect(blueBlank.status).toBe('UNLOCKED');
    expect(circuit.status).toBe('LOCKED');

    const afterL01 = buildCatalogEntries(['L01'], { BLUE_BLANK: 4 });
    expect(afterL01.find((e) => e.id === 'CONVEYOR')?.status).toBe('DISCOVERED');
    expect(afterL01.find((e) => e.id === 'PROCESSOR')?.status).toBe('UNLOCKED');
    expect(afterL01.find((e) => e.id === 'BLUE_BLANK')?.status).toBe('DISCOVERED');
    expect(afterL01.find((e) => e.id === 'BLUE_BLANK')?.collectedCount).toBe(4);
  });

  it('filters by category, status, query and sorts deterministically', () => {
    const entries = buildCatalogEntries(['L01', 'L02'], { BLUE_BLANK: 4, CUT_PLATE: 3 });

    const unlockedMachines = filterAndSortCatalog(entries, {
      category: 'MACHINES',
      query: '',
      status: 'DISCOVERED',
      sortBy: 'CAMPAIGN',
      getLabel: (e) => e.id,
    });
    expect(unlockedMachines.map((e) => e.id)).toEqual(['CONVEYOR', 'PROCESSOR']);

    const searchRes = filterAndSortCatalog(entries, {
      category: 'RESOURCES',
      query: 'cut',
      status: 'ALL',
      sortBy: 'NAME',
      getLabel: (e) => e.id,
    });
    expect(searchRes.map((e) => e.id)).toEqual(['CUT_PLATE']);

    const byProgress = filterAndSortCatalog(entries, {
      category: 'RESOURCES',
      query: '',
      status: 'ALL',
      sortBy: 'PROGRESS',
      getLabel: (e) => e.id,
    });
    expect(byProgress[0]?.id).toBe('BLUE_BLANK');
    expect(byProgress[1]?.id).toBe('CUT_PLATE');
  });
});
