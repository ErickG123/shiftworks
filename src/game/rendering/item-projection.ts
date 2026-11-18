import type { SimulationState } from '../domain/simulation.model';
import type { ItemProjection } from './item-view';

export function projectItems(state: SimulationState): readonly ItemProjection[] {
  const positions = new Map(state.layout.components.map((component) => [component.id, component.position]));
  return Object.freeze(state.slots.flatMap((slot) => {
    const position = positions.get(slot.componentId);
    return slot.item && position ? [Object.freeze({ item: slot.item, position })] : [];
  }));
}
