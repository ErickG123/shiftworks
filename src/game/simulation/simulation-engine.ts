import type { Component, DiverterComponent, OutputComponent, ProcessorComponent, SourceComponent } from '../domain/component.model';
import { findPortConnections, turnRight } from '../domain/ports.model';
import type { ComponentSlot, SimulationDiagnostic, SimulationState, SourceRuntime, StepResult } from '../domain/simulation.model';
import { EventSequencer } from './event-sequencer';
import { resolveTransferReservations, type TransferProposal } from './transfer-resolver';

function componentOrder(a: Component, b: Component): number {
  return a.position.y - b.position.y || a.position.x - b.position.x || compareId(a.id, b.id);
}
function compareId(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function itemBlockKey(diagnostic: Pick<SimulationDiagnostic, 'componentId' | 'itemId'>): string {
  return `${diagnostic.componentId}:${diagnostic.itemId ?? ''}`;
}

/** Advances one deterministic snapshot tick. All machine timing lives in logical ticks. */
export function step(state: SimulationState): StepResult {
  if (state.mode !== 'RUNNING') return Object.freeze({ state, events: Object.freeze([]) });

  const tick = state.tick + 1;
  const eventLog = new EventSequencer(tick);
  const componentById = new Map(state.layout.components.map((component) => [component.id, component]));
  const slotByComponent = new Map(state.slots.map((slot) => [slot.componentId, slot]));
  const connections = findPortConnections(state.layout.components);
  const previousDiagnostics = new Map(state.diagnostics.map((diagnostic) => [itemBlockKey(diagnostic), diagnostic]));
  const diagnostics = new Map<string, SimulationDiagnostic>();
  for (const diagnostic of state.diagnostics) if (diagnostic.reason === 'RULE_MISSING') diagnostics.set(itemBlockKey(diagnostic), diagnostic);
  const workingSlots = new Map(state.slots.map((slot) => [slot.componentId, slot.item]));
  const processors = new Map(state.processors.map((runtime) => [runtime.componentId, runtime]));
  const diverters = new Map(state.diverters.map((runtime) => [runtime.componentId, runtime]));
  const goalProgress = state.goals.map((progress) => ({ ...progress }));
  const deliveredByOutput = { ...state.metrics.itemsDeliveredByOutput };
  let rejectedCount = 0;
  const pendingBlocked: SimulationDiagnostic[] = [];

  const setDiagnostic = (diagnostic: SimulationDiagnostic): void => {
    const key = itemBlockKey(diagnostic);
    diagnostics.set(key, Object.freeze(diagnostic));
    const previous = previousDiagnostics.get(key);
    if (!previous || previous.reason !== diagnostic.reason) {
      eventLog.push({ kind: 'BLOCKED', componentId: diagnostic.componentId, ...(diagnostic.itemId ? { itemId: diagnostic.itemId } : {}), reason: diagnostic.reason });
    }
  };

  const consumeOutput = (output: OutputComponent, item: NonNullable<ComponentSlot['item']>): void => {
    const goal = goalProgress.find((progress) => progress.goal.outputId === output.id && progress.goal.itemType === item.type && progress.delivered < progress.goal.quantity);
    if (!output.acceptedTypes.includes(item.type)) {
      rejectedCount += 1;
      eventLog.push({ kind: 'ITEM_REJECTED', componentId: output.id, itemId: item.id, itemType: item.type, reason: 'WRONG_TYPE' });
    } else if (goalProgress.length === 0) {
      deliveredByOutput[output.id] = (deliveredByOutput[output.id] ?? 0) + 1;
      eventLog.push({ kind: 'ITEM_DELIVERED', componentId: output.id, itemId: item.id, itemType: item.type, goalOutputId: output.id });
    } else if (!goal) {
      rejectedCount += 1;
      eventLog.push({ kind: 'ITEM_REJECTED', componentId: output.id, itemId: item.id, itemType: item.type, reason: 'NO_GOAL' });
    } else {
      goal.delivered += 1;
      deliveredByOutput[output.id] = (deliveredByOutput[output.id] ?? 0) + 1;
      eventLog.push({ kind: 'ITEM_DELIVERED', componentId: output.id, itemId: item.id, itemType: item.type, goalOutputId: goal.goal.outputId });
      if (goal.delivered === goal.goal.quantity) eventLog.push({ kind: 'GOAL_COMPLETED', outputId: output.id, itemType: item.type });
    }
  };

  // Advance only timers that existed before this tick. New admissions below keep their full duration.
  for (const runtime of state.processors) {
    if ((runtime.phase !== 'SHIFTING' && runtime.phase !== 'PROCESSING') || runtime.ticksRemaining < 1) continue;
    const remaining = runtime.ticksRemaining - 1;
    if (remaining > 0) {
      processors.set(runtime.componentId, Object.freeze({ ...runtime, ticksRemaining: remaining }));
      continue;
    }
    const item = workingSlots.get(runtime.componentId);
    if (runtime.phase === 'SHIFTING' && runtime.targetMode) {
      const shifted = Object.freeze({ ...runtime, mode: runtime.targetMode, targetMode: null, phase: 'PROCESSING' as const, ticksRemaining: 3 });
      processors.set(runtime.componentId, shifted);
      eventLog.push({ kind: 'MODE_SHIFT_COMPLETED', componentId: runtime.componentId, itemId: runtime.itemId ?? '', mode: shifted.mode });
      eventLog.push({ kind: 'PROCESS_STARTED', componentId: runtime.componentId, itemId: runtime.itemId ?? '' });
    } else if (runtime.phase === 'PROCESSING' && item && runtime.itemId) {
      const product = item.type === 'BLUE_BLANK' ? 'CUT_PLATE' : item.type === 'AMBER_BLANK' ? 'PRESSED_BLOCK' : item.type;
      workingSlots.set(runtime.componentId, Object.freeze({ ...item, type: product }));
      processors.set(runtime.componentId, Object.freeze({ ...runtime, phase: 'READY', ticksRemaining: 0, targetMode: null }));
      eventLog.push({ kind: 'PROCESS_COMPLETED', componentId: runtime.componentId, itemId: runtime.itemId, itemType: product });
    }
  }

  const snapshotOccupied = new Set(state.slots.filter((slot) => slot.item !== null).map((slot) => slot.componentId));
  const proposals: TransferProposal[] = [];
  const transportComponents = state.layout.components
    .filter((component) => component.type === 'CONVEYOR' || (component.type === 'PROCESSOR' && processors.get(component.id)?.phase === 'READY') || (component.type === 'DIVERTER' && diverters.get(component.id)?.route !== null && Boolean(diverters.get(component.id)?.itemId)))
    .sort(componentOrder);
  for (const component of transportComponents) {
    const item = workingSlots.get(component.id);
    if (!item) continue;
    const componentOutputConnections = connections.filter((connection) => connection.from.componentId === component.id && connection.from.kind === 'OUTPUT');
    const diverterRuntime = diverters.get(component.id);
    const output = component.type === 'DIVERTER' && diverterRuntime?.route
      ? componentOutputConnections.find((connection) => connection.from.direction === (diverterRuntime.route === 'A' ? component.direction : turnRight(component.direction)))
      : componentOutputConnections[0];
    if (!output) {
      pendingBlocked.push({ componentId: component.id, itemId: item.id, reason: 'NO_PORT' });
      continue;
    }
    const destination = componentById.get(output.to.componentId);
    if (!destination || (!slotByComponent.has(destination.id) && destination.type !== 'OUTPUT')) {
      pendingBlocked.push({ componentId: component.id, itemId: item.id, reason: 'NO_PORT' });
      continue;
    }
    proposals.push({ sourceId: component.id, destinationId: destination.id, source: component.position, destination: destination.position, item });
  }

  const resolution = resolveTransferReservations(proposals, snapshotOccupied);
  for (const proposal of resolution.accepted) {
    workingSlots.set(proposal.sourceId, null);
    eventLog.push({ kind: 'ITEM_MOVED', componentId: proposal.sourceId, destinationId: proposal.destinationId, itemId: proposal.item.id });
    const destination = componentById.get(proposal.destinationId);
    if (destination?.type === 'OUTPUT') {
      consumeOutput(destination, proposal.item);
    } else {
      workingSlots.set(proposal.destinationId, proposal.item);
    }
    const sourceProcessor = processors.get(proposal.sourceId);
    if (sourceProcessor) processors.set(proposal.sourceId, Object.freeze({ ...sourceProcessor, phase: 'IDLE', ticksRemaining: 0, targetMode: null, itemId: null }));
    if (diverters.has(proposal.sourceId)) diverters.set(proposal.sourceId, Object.freeze({ componentId: proposal.sourceId, itemId: null, route: null }));
  }
  for (const rejection of resolution.rejected) pendingBlocked.push({ componentId: rejection.proposal.sourceId, itemId: rejection.proposal.item.id, reason: rejection.reason });

  const startProcessing = (component: ProcessorComponent, itemId: string): void => {
    const runtime = processors.get(component.id);
    if (!runtime || runtime.phase !== 'IDLE') return;
    const item = workingSlots.get(component.id);
    if (!item) return;
    const matching = component.rules.filter((rule) => rule.when === item.type);
    if (matching.length !== 1) {
      processors.set(component.id, Object.freeze({ ...runtime, phase: 'RULE_MISSING', itemId, ticksRemaining: 0, targetMode: null }));
      diagnostics.set(itemBlockKey({ componentId: component.id, itemId }), Object.freeze({ componentId: component.id, itemId, reason: 'RULE_MISSING' }));
      eventLog.push({ kind: 'RULE_MISSING', componentId: component.id, itemId, itemType: item.type });
      return;
    }
    const desiredMode = matching[0]!.then;
    if (desiredMode !== runtime.mode) {
      processors.set(component.id, Object.freeze({ ...runtime, phase: 'SHIFTING', ticksRemaining: 2, targetMode: desiredMode, itemId }));
      eventLog.push({ kind: 'MODE_SHIFT_STARTED', componentId: component.id, itemId, mode: desiredMode });
    } else {
      processors.set(component.id, Object.freeze({ ...runtime, phase: 'PROCESSING', ticksRemaining: 3, targetMode: null, itemId }));
      eventLog.push({ kind: 'PROCESS_STARTED', componentId: component.id, itemId });
    }
  };

  // New conveyor arrivals are admitted after the simultaneous transfer commit.
  const processorComponents = state.layout.components.filter((component): component is ProcessorComponent => component.type === 'PROCESSOR').sort(componentOrder);
  const diverterComponents = state.layout.components.filter((component): component is DiverterComponent => component.type === 'DIVERTER').sort(componentOrder);
  for (const component of processorComponents) startProcessing(component, workingSlots.get(component.id)?.id ?? '');

  const chooseDiverterRoute = (component: DiverterComponent): void => {
    const runtime = diverters.get(component.id);
    const item = workingSlots.get(component.id);
    if (!runtime || runtime.itemId || !item) return;
    const matches = component.rules.filter((rule) => rule.when === item.type);
    if (matches.length !== 1) {
      diverters.set(component.id, Object.freeze({ componentId: component.id, itemId: item.id, route: null }));
      diagnostics.set(itemBlockKey({ componentId: component.id, itemId: item.id }), Object.freeze({ componentId: component.id, itemId: item.id, reason: 'RULE_MISSING' }));
      eventLog.push({ kind: 'RULE_MISSING', componentId: component.id, itemId: item.id, itemType: item.type });
      return;
    }
    const route = matches[0]!.then;
    workingSlots.set(component.id, Object.freeze({ ...item, route }));
    diverters.set(component.id, Object.freeze({ componentId: component.id, itemId: item.id, route }));
    eventLog.push({ kind: 'ROUTE_CHOSEN', componentId: component.id, itemId: item.id, route });
  };
  for (const component of diverterComponents) chooseDiverterRoute(component);

  const sourceRuntimes = new Map(state.sources.map((source) => [source.componentId, source]));
  const updatedSources: SourceRuntime[] = [];
  const sources = state.layout.components.filter((component): component is SourceComponent => component.type === 'SOURCE').sort(componentOrder);
  let emittedCount = 0;
  for (const source of sources) {
    const runtime = sourceRuntimes.get(source.id);
    if (!runtime) continue;
    if (goalProgress.length > 0 && goalProgress.every((progress) => progress.delivered >= progress.goal.quantity)) {
      updatedSources.push(runtime);
      continue;
    }
    if (tick < runtime.nextDueTick) { updatedSources.push(runtime); continue; }
    const output = connections.find((connection) => connection.from.componentId === source.id && connection.from.kind === 'OUTPUT');
    const destination = output ? componentById.get(output.to.componentId) : undefined;
    const destinationSlot = destination && destination.type !== 'OUTPUT' ? slotByComponent.get(destination.id) : undefined;
    const nextItemId = `${source.id}:${runtime.emissionOrdinal}`;
    if (!output || !destination || (destination.type !== 'OUTPUT' && !destinationSlot)) {
      setDiagnostic({ componentId: source.id, itemId: nextItemId, reason: destination?.type === 'OUTPUT' ? 'DESTINATION_NO_STORAGE' : 'NO_PORT' });
      updatedSources.push(Object.freeze({ ...runtime, pending: true }));
      continue;
    }
    if (destination.type !== 'OUTPUT' && workingSlots.get(destination.id) !== null) {
      setDiagnostic({ componentId: source.id, itemId: nextItemId, reason: 'SOURCE_BLOCKED' });
      updatedSources.push(Object.freeze({ ...runtime, pending: true }));
      continue;
    }
    const item = Object.freeze({ id: nextItemId, type: source.sequence[runtime.emissionOrdinal % source.sequence.length]!, sequence: runtime.emissionOrdinal, bornTick: tick, route: null });
    if (destination.type !== 'OUTPUT') workingSlots.set(destination.id, item);
    emittedCount += 1;
    eventLog.push({ kind: 'ITEM_EMITTED', componentId: source.id, item });
    if (destination.type === 'OUTPUT') consumeOutput(destination, item);
    updatedSources.push(Object.freeze({ componentId: source.id, emissionOrdinal: runtime.emissionOrdinal + 1, nextDueTick: tick + source.intervalTicks, pending: false }));
  }

  // Source-to-Processor arrivals follow the same rules but start their timer on this admission tick.
  for (const component of processorComponents) startProcessing(component, workingSlots.get(component.id)?.id ?? '');
  for (const component of diverterComponents) chooseDiverterRoute(component);
  for (const blocked of pendingBlocked) setDiagnostic(blocked);

  const slots: readonly ComponentSlot[] = Object.freeze(state.slots.map((slot) => Object.freeze({ ...slot, item: workingSlots.get(slot.componentId) ?? null })));
  const emittedEvents = eventLog.snapshot();
  const producedMetrics = { ...state.metrics.itemsProducedByType };
  let shiftCount = 0;
  for (const event of emittedEvents) {
    if (event.kind === 'PROCESS_COMPLETED' && event.itemType) producedMetrics[event.itemType] += 1;
    if (event.kind === 'MODE_SHIFT_STARTED') shiftCount += 1;
  }
  const nextState: SimulationState = Object.freeze({
    ...state,
    tick,
    mode: goalProgress.length > 0 && goalProgress.every((progress) => progress.delivered >= progress.goal.quantity) ? 'RESULT' : state.mode,
    slots,
    processors: Object.freeze(state.processors.map((runtime) => processors.get(runtime.componentId) ?? runtime)),
    diverters: Object.freeze(state.diverters.map((runtime) => diverters.get(runtime.componentId) ?? runtime)),
    sources: Object.freeze(updatedSources),
    goals: Object.freeze(goalProgress.map((progress) => Object.freeze(progress))),
    diagnostics: Object.freeze([...diagnostics.values()].sort((a, b) => compareId(a.componentId, b.componentId) || compareId(a.itemId ?? '', b.itemId ?? ''))),
    metrics: Object.freeze({ ...state.metrics, itemsEmitted: state.metrics.itemsEmitted + emittedCount, itemsMoved: state.metrics.itemsMoved + resolution.accepted.length,
      modeShiftCount: state.metrics.modeShiftCount + shiftCount, itemsProducedByType: Object.freeze(producedMetrics),
      itemsDeliveredByOutput: Object.freeze(deliveredByOutput), rejectedCount: state.metrics.rejectedCount + rejectedCount }),
  });

  const itemIds = slots.flatMap((slot) => slot.item ? [slot.item.id] : []);
  if (new Set(itemIds).size !== itemIds.length) throw new Error('Simulation invariant violated: an item occupies multiple component slots.');
  return Object.freeze({ state: nextState, events: emittedEvents });
}
