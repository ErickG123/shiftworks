import type { PlayableLevel } from '../domain/level-catalog.model';
import { createSimulationState, startSession } from '../domain/session.model';
import type { SimulationState } from '../domain/simulation.model';
import { step } from './simulation-engine';

export function runLevelReference(level: PlayableLevel): SimulationState {
  const started = startSession(createSimulationState(level, level.referenceComponents));
  if (!started.ok) throw new Error(`Expected ${level.id} reference to start.`);
  let state = started.state;
  for (let tick = 0; tick < 300 && state.mode === 'RUNNING'; tick += 1) state = step(state).state;
  return state;
}
