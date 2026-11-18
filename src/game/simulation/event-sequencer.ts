import type { SimulationEvent, SimulationEventPayload } from '../domain/simulation.model';

export class EventSequencer {
  private readonly collected: SimulationEvent[] = [];

  constructor(private readonly tick: number) {}

  push(payload: SimulationEventPayload): SimulationEvent {
    const event = Object.freeze({ ...payload, tick: this.tick, sequence: this.collected.length });
    this.collected.push(event);
    return event;
  }

  snapshot(): readonly SimulationEvent[] {
    return Object.freeze([...this.collected]);
  }
}
