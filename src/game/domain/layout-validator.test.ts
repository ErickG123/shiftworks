import { describe, expect, it } from 'vitest';
import { DEFAULT_EDITOR_LEVEL } from './default-level.model';
import { validateLevelDefinition, SimulationSetupError } from './layout-validator';
import { createSimulationState } from './session.model';

describe('simulation layout validation', () => {
  it('rejects duplicate cell occupancy and invalid duplicate processor rules', () => {
    const processor = { id: 'processor', type: 'PROCESSOR' as const, isFixed: false as const, position: { x: 1, y: 1 }, direction: 'E' as const, defaultMode: 'CUT' as const, rules: [
      { when: 'BLUE_BLANK' as const, then: 'CUT' as const },
      { when: 'BLUE_BLANK' as const, then: 'PRESS' as const },
    ] };
    const overlappingBelt = { id: 'belt', type: 'CONVEYOR' as const, isFixed: false as const, position: { x: 1, y: 1 }, direction: 'E' as const };
    const errors = validateLevelDefinition(DEFAULT_EDITOR_LEVEL, [...DEFAULT_EDITOR_LEVEL.fixedComponents, processor, overlappingBelt]);
    expect(errors.map((error) => error.code)).toContain('CELL_OCCUPIED');
    expect(errors.map((error) => error.code)).toContain('DUPLICATE_RULE');
    expect(() => createSimulationState(DEFAULT_EDITOR_LEVEL, [...DEFAULT_EDITOR_LEVEL.fixedComponents, processor])).toThrow(SimulationSetupError);
  });

  it('requires goals to target an output that accepts the requested item', () => {
    const invalidLevel = { ...DEFAULT_EDITOR_LEVEL, goals: [{ outputId: 'out-a', itemType: 'PRESSED_BLOCK' as const, quantity: 1 }] };
    expect(validateLevelDefinition(invalidLevel).map((error) => error.code)).toContain('INVALID_GOAL');
    expect(() => createSimulationState(invalidLevel)).toThrow(SimulationSetupError);
  });

  it('snapshots the layout and nested rules immutably', () => {
    const processor = { id: 'processor', type: 'PROCESSOR' as const, isFixed: false as const, position: { x: 1, y: 1 }, direction: 'E' as const, defaultMode: 'CUT' as const, rules: [{ when: 'BLUE_BLANK' as const, then: 'CUT' as const }] };
    const state = createSimulationState(DEFAULT_EDITOR_LEVEL, [...DEFAULT_EDITOR_LEVEL.fixedComponents, processor]);
    const stored = state.layout.components.find((component) => component.id === 'processor');
    expect(stored?.type).toBe('PROCESSOR');
    if (stored?.type === 'PROCESSOR') {
      expect(Object.isFrozen(stored.rules)).toBe(true);
      expect(Object.isFrozen(stored.rules[0])).toBe(true);
    }
  });
});
