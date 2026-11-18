import type { Component, LevelDefinition } from './component.model';
import { SimulationSetupError, validateSimulationLayout } from './layout-validator';
import type { SessionResult, SimulationState } from './simulation.model';
import { emptySimulationMetrics, snapshotLevel } from './simulation.model';

function resetRuntime(state: SimulationState, mode: SimulationState['mode']): SimulationState {
  const components = state.layout.components;
  return Object.freeze({
    tick: 0,
    mode,
    layout: state.layout,
    slots: Object.freeze(components.filter((component) => component.type === 'CONVEYOR' || component.type === 'PROCESSOR' || component.type === 'DIVERTER').map((component) => Object.freeze({ componentId: component.id, item: null }))),
    processors: Object.freeze(components.filter((component) => component.type === 'PROCESSOR').map((component) => Object.freeze({ componentId: component.id, mode: component.defaultMode, phase: 'IDLE' as const, ticksRemaining: 0, targetMode: null, itemId: null }))),
    sources: Object.freeze(components.filter((component) => component.type === 'SOURCE').map((component) => Object.freeze({ componentId: component.id, emissionOrdinal: 0, nextDueTick: component.intervalTicks, pending: false }))),
    diverters: Object.freeze(components.filter((component) => component.type === 'DIVERTER').map((component) => Object.freeze({ componentId: component.id, itemId: null, route: null }))),
    goals: Object.freeze(state.layout.goals.map((goal) => Object.freeze({ goal, delivered: 0 }))),
    diagnostics: Object.freeze([]),
    metrics: Object.freeze({ ...emptySimulationMetrics(), piecesUsed: components.filter((component) => !component.isFixed).length }),
  });
}

export function createSimulationState(level: LevelDefinition, components: readonly Component[] = level.fixedComponents): SimulationState {
  const layout = snapshotLevel(level, components);
  const errors = validateSimulationLayout(layout);
  if (errors.length > 0) throw new SimulationSetupError(errors);
  return resetRuntime(Object.freeze({
    tick: 0,
    mode: 'EDITING',
    layout,
    slots: Object.freeze([]),
    processors: Object.freeze([]),
    sources: Object.freeze([]),
    diverters: Object.freeze([]),
    goals: Object.freeze([]),
    diagnostics: Object.freeze([]),
    metrics: emptySimulationMetrics(),
  }), 'EDITING');
}

export function startSession(state: SimulationState): SessionResult {
  if (state.mode !== 'EDITING' && state.mode !== 'RESULT') return { ok: false, state, error: 'INVALID_TRANSITION' };
  return { ok: true, state: resetRuntime(state, 'RUNNING') };
}

export function pauseSession(state: SimulationState): SessionResult {
  return state.mode === 'RUNNING'
    ? { ok: true, state: Object.freeze({ ...state, mode: 'PAUSED' }) }
    : { ok: false, state, error: 'INVALID_TRANSITION' };
}

export function resumeSession(state: SimulationState): SessionResult {
  return state.mode === 'PAUSED'
    ? { ok: true, state: Object.freeze({ ...state, mode: 'RUNNING' }) }
    : { ok: false, state, error: 'INVALID_TRANSITION' };
}

export function editSession(state: SimulationState): SessionResult {
  return state.mode === 'EDITING'
    ? { ok: false, state, error: 'INVALID_TRANSITION' }
    : { ok: true, state: resetRuntime(state, 'EDITING') };
}

export function resetSession(state: SimulationState): SimulationState {
  return resetRuntime(state, 'EDITING');
}

export { resetRuntime };
