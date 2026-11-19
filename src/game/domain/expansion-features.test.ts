import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENT_CATALOG,
  evaluateSimulationAchievements,
  mergeAchievements,
} from './achievements.model';
import {
  computeEfficiencySnapshot,
  detectBottlenecks,
} from './diagnostics-efficiency.model';
import {
  EQUIPMENT_CATALOG,
  getEquipmentCatalogEntry,
} from './equipment-catalog.model';
import { getLevel } from './level-catalog.model';
import { createSimulationState, startSession } from './session.model';
import { runLevelReference } from '../simulation/reference-runner';

describe('Equipment Catalog, Achievements & Efficiency Models (EXP-06/07/08/11)', () => {
  it('exposes complete metadata for all 5 core equipment types', () => {
    expect(EQUIPMENT_CATALOG.map((e) => e.id)).toEqual([
      'SOURCE',
      'CONVEYOR',
      'PROCESSOR',
      'DIVERTER',
      'OUTPUT',
    ]);
    expect(getEquipmentCatalogEntry('PROCESSOR')?.unlockLevelId).toBe('L02');
    expect(getEquipmentCatalogEntry('DIVERTER')?.unlockLevelId).toBe('L03');
  });

  it('awards achievements strictly on verified simulation completion and stays idempotent', () => {
    expect(ACHIEVEMENT_CATALOG.length).toBeGreaterThanOrEqual(8);

    const l02 = getLevel('L02')!;
    const won = runLevelReference(l02);
    const first = evaluateSimulationAchievements(won, 'L02', 3, []);
    expect(first).toContain('FIRST_DELIVERY');
    expect(first).toContain('LEVEL_02_COMPLETE');
    expect(first).toContain('ZERO_REJECTIONS_WIN');
    expect(first).toContain('THREE_STAR_MASTER');
    expect(first).toContain('SHIFT_AUTOMATION');

    const merged = mergeAchievements([], first);
    const second = evaluateSimulationAchievements(won, 'L02', 3, merged);
    expect(second).toEqual([]);

    // Non-RESULT state must not award level completion achievements
    const running = startSession(createSimulationState(l02, l02.fixedComponents));
    expect(running.ok).toBe(true);
    if (running.ok) {
      expect(evaluateSimulationAchievements(running.state, 'L02', 0, [])).toEqual([]);
    }
  });

  it('computes efficiency metrics safely without division by zero and detects bottlenecks', () => {
    const l01 = getLevel('L01')!;
    const initial = createSimulationState(l01, l01.fixedComponents);
    const zeroMetrics = computeEfficiencySnapshot(initial);
    expect(zeroMetrics.throughputPer10Ticks).toBe(0);
    expect(zeroMetrics.rejectionRatePercent).toBe(0);
    expect(zeroMetrics.utilizationPercent).toBe(0);

    const won = runLevelReference(l01);
    const winMetrics = computeEfficiencySnapshot(won);
    expect(winMetrics.itemsDelivered).toBe(3);
    expect(winMetrics.ticksElapsed).toBe(30);
    expect(winMetrics.throughputPer10Ticks).toBe(1);
    expect(detectBottlenecks(won)).toEqual([]);
  });
});
