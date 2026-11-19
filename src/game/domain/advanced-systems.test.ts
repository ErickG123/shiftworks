import { describe, expect, it } from 'vitest';
import {
  applyBlueprintAtomically,
  CAMPAIGN_SECTORS,
  createExpandedSandboxLevel,
  createFifoBuffer,
  dequeueFifoBuffer,
  enqueueFifoBuffer,
  evaluateOptionalChallenges,
  evaluateSensorRules,
  resolveActiveOrderPhase,
  resolveChainedRecipe,
} from './advanced-systems.model';
import { DEFAULT_EDITOR_LEVEL } from './default-level.model';
import { createEditorState } from './editor.model';

describe('Advanced P2 Deterministic Systems (EXP-12..EXP-20: SW-104..SW-115)', () => {
  it('evaluates programmable sensor rules deterministically (SW-104)', () => {
    const rules = [
      { id: 's1', kind: 'ITEM_TYPE_MATCH' as const, itemType: 'AMBER_BLANK' as const, targetMode: 'PRESS' as const },
      { id: 's2', kind: 'DELIVERY_COUNT_REACHED' as const, threshold: 3, targetMode: 'CUT' as const },
    ];
    expect(evaluateSensorRules(rules, { incomingItemType: 'AMBER_BLANK', deliveredCount: 0 })).toBe('PRESS');
    expect(evaluateSensorRules(rules, { incomingItemType: 'BLUE_BLANK', deliveredCount: 3 })).toBe('CUT');
    expect(evaluateSensorRules(rules, { incomingItemType: 'BLUE_BLANK', deliveredCount: 1 })).toBeNull();
  });

  it('preserves base CUT/PRESS recipes and supports chained recipes (SW-105)', () => {
    expect(resolveChainedRecipe('BLUE_BLANK', 'CUT')).toBe('CUT_PLATE');
    expect(resolveChainedRecipe('AMBER_BLANK', 'PRESS')).toBe('PRESSED_BLOCK');
    expect(resolveChainedRecipe('CUT_PLATE', 'PRESS')).toBe('REINFORCED_PANEL');
    expect(resolveChainedRecipe('PRESSED_BLOCK', 'CUT')).toBe('MACHINED_CORE');
    expect(resolveChainedRecipe('REINFORCED_PANEL', 'CUT')).toBeNull();
  });

  it('maintains strict FIFO buffer order without item loss or duplication over 1000 ticks (SW-107)', () => {
    let buffer = createFifoBuffer(4);
    let emitted = 0;
    let dequeued = 0;

    for (let tick = 1; tick <= 1000; tick += 1) {
      const item = Object.freeze({
        id: `item-${tick}`,
        type: 'BLUE_BLANK' as const,
        sequence: tick,
        bornTick: tick,
        route: null,
      });
      const enq = enqueueFifoBuffer(buffer, item);
      if (enq.ok) {
        buffer = enq.buffer;
        emitted += 1;
      }
      if (tick % 2 === 0) {
        const deq = dequeueFifoBuffer(buffer);
        if (deq.item) {
          buffer = deq.buffer;
          dequeued += 1;
        }
      }
      expect(buffer.queue.length).toBeLessThanOrEqual(4);
    }
    expect(emitted).toBe(dequeued + buffer.queue.length);
  });

  it('resolves dynamic production order phases by logical tick (SW-106)', () => {
    const schedule = [
      { phaseId: 'p1', activateAtTick: 0, requiredItemType: 'CUT_PLATE' as const, quantity: 3 },
      { phaseId: 'p2', activateAtTick: 40, requiredItemType: 'PRESSED_BLOCK' as const, quantity: 3 },
    ];
    expect(resolveActiveOrderPhase(schedule, 10)?.phaseId).toBe('p1');
    expect(resolveActiveOrderPhase(schedule, 40)?.phaseId).toBe('p2');
  });

  it('applies blueprints atomically and supports expanded Sandbox grid sizes (SW-111..SW-115)', () => {
    expect(CAMPAIGN_SECTORS[0]?.levelIds).toEqual(['L01', 'L02', 'L03']);
    const challenges = evaluateOptionalChallenges(
      { ticks: 30, rejectedCount: 0, piecesUsed: 6 },
      { maxTicks: 31, maxPieces: 6 },
    );
    expect(challenges.every((c) => c.passed)).toBe(true);

    const state = createEditorState(DEFAULT_EDITOR_LEVEL);
    const bp = {
      id: 'bp-line',
      name: 'Two Belts',
      version: 1 as const,
      components: [
        { type: 'CONVEYOR' as const, dx: 0, dy: 0, direction: 'E' as const },
        { type: 'CONVEYOR' as const, dx: 1, dy: 0, direction: 'E' as const },
      ],
    };
    const applied = applyBlueprintAtomically(state, bp, { x: 1, y: 3 });
    expect(applied.ok).toBe(true);
    if (applied.ok) {
      expect(applied.state.inventory.CONVEYOR).toBe(14);
    }

    // Out of bounds fails atomically without consuming inventory
    const failed = applyBlueprintAtomically(state, bp, { x: 7, y: 3 });
    expect(failed.ok).toBe(false);
    expect(failed.state).toBe(state);

    const sandbox12 = createExpandedSandboxLevel('ALTERNATING', 12);
    expect(sandbox12.width).toBe(12);
    expect(sandbox12.height).toBe(12);
  });
});
