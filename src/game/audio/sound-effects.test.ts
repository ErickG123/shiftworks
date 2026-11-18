import { describe, expect, it } from 'vitest';
import type { SimulationEvent } from '../domain/simulation.model';
import { soundCueForEvent } from './sound-effects';

const event = (kind: SimulationEvent['kind'], extra: Record<string, unknown> = {}) => ({ kind, tick: 1, sequence: 0, ...extra }) as SimulationEvent;

describe('simulation sound cues', () => {
  it('maps significant simulation events to short original tones', () => {
    expect(soundCueForEvent(event('MODE_SHIFT_STARTED', { componentId: 'processor', itemId: 'item-1', mode: 'PRESS' }))).toMatchObject({ waveform: 'triangle' });
    expect(soundCueForEvent(event('PROCESS_COMPLETED', { componentId: 'processor', itemId: 'item-1', itemType: 'PRESSED_BLOCK' }))).toMatchObject({ frequency: 520 });
    expect(soundCueForEvent(event('ITEM_DELIVERED', { componentId: 'out', itemId: 'item-1', itemType: 'CUT_PLATE', goalOutputId: 'out' }))).toMatchObject({ frequency: 660 });
    expect(soundCueForEvent(event('ITEM_REJECTED', { componentId: 'out', itemId: 'item-1', itemType: 'BLUE_BLANK', reason: 'WRONG_TYPE' }))).toMatchObject({ frequency: 170 });
  });

  it('keeps routine movement silent', () => {
    expect(soundCueForEvent(event('ITEM_MOVED', { componentId: 'belt-a', destinationId: 'belt-b', itemId: 'item-1' }))).toBeNull();
  });
});
