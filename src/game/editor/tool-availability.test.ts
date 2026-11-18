import { describe, expect, it } from 'vitest';
import { getToolAvailability } from './tool-availability';

describe('getToolAvailability', () => {
  const l01Budget = { CONVEYOR: 12, PROCESSOR: 0, DIVERTER: 0 } as const;

  it('marks Processor and Diverter as not available in L01', () => {
    const processor = getToolAvailability({
      tool: 'PROCESSOR',
      editorMode: 'EDITING',
      unlimitedInventory: false,
      inventory: l01Budget,
      levelBudget: l01Budget,
    });
    expect(processor.enabled).toBe(false);
    expect(processor.reason).toBe('Not available in this level');
    expect(processor.remaining).toBe(0);
  });

  it('marks Conveyor as no pieces remaining when stock is exhausted', () => {
    const conveyor = getToolAvailability({
      tool: 'CONVEYOR',
      editorMode: 'EDITING',
      unlimitedInventory: false,
      inventory: { CONVEYOR: 0, PROCESSOR: 0, DIVERTER: 0 },
      levelBudget: l01Budget,
    });
    expect(conveyor.enabled).toBe(false);
    expect(conveyor.reason).toBe('No pieces remaining');
  });

  it('blocks editing tools while simulation is RUNNING', () => {
    const conveyor = getToolAvailability({
      tool: 'CONVEYOR',
      editorMode: 'RUNNING',
      unlimitedInventory: false,
      inventory: l01Budget,
      levelBudget: l01Budget,
    });
    expect(conveyor.enabled).toBe(false);
    expect(conveyor.reason).toBe('Finish or exit the current run to edit');
  });

  it('allows all tools in Sandbox with unlimited inventory', () => {
    const processor = getToolAvailability({
      tool: 'PROCESSOR',
      editorMode: 'EDITING',
      unlimitedInventory: true,
      inventory: l01Budget,
      levelBudget: l01Budget,
    });
    expect(processor.enabled).toBe(true);
    expect(processor.reason).toBeNull();
  });
});
