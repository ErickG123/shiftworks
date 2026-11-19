import type { BottleneckEntry, EfficiencySnapshot } from './expansion-contracts.model';
import type { SimulationState } from './simulation.model';

/**
 * Computes reproducible efficiency metrics from a pure SimulationState snapshot.
 * Guards all divisions against zero.
 */
export function computeEfficiencySnapshot(state: SimulationState): EfficiencySnapshot {
  const delivered = Object.values(state.metrics.itemsDeliveredByOutput).reduce(
    (sum, count) => sum + count,
    0,
  );
  const rejected = state.metrics.rejectedCount;
  const totalProcessed = delivered + rejected;
  const ticksElapsed = state.tick;

  const throughputPer10Ticks =
    ticksElapsed > 0 ? Number(((delivered / ticksElapsed) * 10).toFixed(2)) : 0;
  const rejectionRatePercent =
    totalProcessed > 0 ? Number(((rejected / totalProcessed) * 100).toFixed(1)) : 0;

  const activeSlots = state.slots.filter((slot) => slot.item !== null).length;
  const utilizationPercent =
    state.slots.length > 0
      ? Math.round((activeSlots / state.slots.length) * 100)
      : 0;

  return Object.freeze({
    ticksElapsed,
    itemsDelivered: delivered,
    itemsRejected: rejected,
    throughputPer10Ticks,
    rejectionRatePercent,
    modeShiftCount: state.metrics.modeShiftCount,
    piecesUsed: state.metrics.piecesUsed,
    utilizationPercent,
  });
}

/**
 * Extracts deterministic bottleneck diagnostics from the current simulation state.
 */
export function detectBottlenecks(state: SimulationState): readonly BottleneckEntry[] {
  const byId = new Map(state.layout.components.map((c) => [c.id, c]));
  const entries: BottleneckEntry[] = [];

  for (const diag of state.diagnostics) {
    const component = byId.get(diag.componentId);
    if (!component) continue;
    const severity =
      diag.reason === 'RULE_MISSING' || diag.reason === 'NO_PORT'
        ? 'CRITICAL'
        : diag.reason === 'SOURCE_BLOCKED' || diag.reason === 'DESTINATION_OCCUPIED'
          ? 'WARNING'
          : 'INFO';
    entries.push(
      Object.freeze({
        componentId: diag.componentId,
        position: component.position,
        reason: diag.reason,
        severity,
        stalledTicks: 1,
      }),
    );
  }

  return Object.freeze(entries);
}
