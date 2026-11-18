import { getCellKey, isEditableType, type Component, type Direction, type DiverterRule, type EditableComponent, type EditableComponentType } from '../domain/component.model';
import type { EditorCommand, EditorErrorCode, EditorResult, EditorState } from '../domain/editor.model';

const DIRECTIONS: readonly Direction[] = ['N', 'E', 'S', 'W'];

export function validatePlacement(state: EditorState, type: EditableComponentType, position: { x: number; y: number }): EditorErrorCode | null {
  if (state.mode !== 'EDITING') return 'NOT_EDITING';
  if (position.x < 0 || position.y < 0 || position.x >= state.width || position.y >= state.height) return 'OUT_OF_BOUNDS';
  if (state.components.some((component) => getCellKey(component.position) === getCellKey(position))) return 'CELL_OCCUPIED';
  if (!state.unlimitedInventory && state.inventory[type] <= 0) return 'INVENTORY_EXCEEDED';
  return null;
}

export function validateComponentCommand(state: EditorState, componentId: string): EditorErrorCode | null {
  if (state.mode !== 'EDITING') return 'NOT_EDITING';
  const component = state.components.find((item) => item.id === componentId);
  if (!component) return 'UNKNOWN_COMPONENT';
  return component.isFixed ? 'FIXED_COMPONENT' : null;
}

export function reduceEditor(state: EditorState, command: EditorCommand): EditorResult {
  if (command.kind === 'SET_MODE') return { ok: true, state: Object.freeze({ ...state, mode: command.mode }) };
  if (command.kind === 'PLACE') {
    const error = validatePlacement(state, command.componentType, command.position);
    if (error) return { ok: false, state, error: { code: error } };
    const id = `piece-${state.nextComponentOrdinal}`;
    const base = { id, type: command.componentType, position: Object.freeze({ ...command.position }), direction: command.direction, isFixed: false as const };
    const component: EditableComponent = command.componentType === 'PROCESSOR'
      ? { ...base, type: 'PROCESSOR', defaultMode: 'CUT', rules: Object.freeze([{ when: 'BLUE_BLANK', then: 'CUT' }, { when: 'AMBER_BLANK', then: 'PRESS' }]) }
      : command.componentType === 'DIVERTER' ? { ...base, type: 'DIVERTER', rules: Object.freeze([{ when: 'CUT_PLATE', then: 'A' }, { when: 'PRESSED_BLOCK', then: 'B' }]) } : { ...base, type: 'CONVEYOR' };
    const inventory = state.unlimitedInventory ? state.inventory : Object.freeze({ ...state.inventory, [command.componentType]: state.inventory[command.componentType] - 1 });
    return { ok: true, state: Object.freeze({ ...state, components: Object.freeze([...state.components, Object.freeze(component)]), inventory, nextComponentOrdinal: state.nextComponentOrdinal + 1 }) };
  }
  const error = validateComponentCommand(state, command.componentId);
  if (error) return { ok: false, state, error: { code: error, componentId: command.componentId } };
  const target = state.components.find((item) => item.id === command.componentId)!;
  if (command.kind === 'SET_PROCESSOR_RULES') {
    if (target.type !== 'PROCESSOR') return { ok: false, state, error: { code: 'UNSUPPORTED_RULE', componentId: target.id } };
    if (command.rules.length > 2) return { ok: false, state, error: { code: 'TOO_MANY_RULES', componentId: target.id } };
    const conditions = command.rules.map((rule) => rule.when);
    if (new Set(conditions).size !== conditions.length) return { ok: false, state, error: { code: 'DUPLICATE_RULE', componentId: target.id } };
    if (command.rules.some((rule) => !['BLUE_BLANK', 'AMBER_BLANK'].includes(rule.when) || !['CUT', 'PRESS'].includes(rule.then))) {
      return { ok: false, state, error: { code: 'UNSUPPORTED_RULE', componentId: target.id } };
    }
    const rules = Object.freeze(command.rules.map((rule) => Object.freeze({ ...rule })));
    return { ok: true, state: Object.freeze({ ...state, components: Object.freeze(state.components.map((item) => item.id === target.id ? Object.freeze({ ...target, rules }) : item)) }) };
  }
  if (command.kind === 'SET_DIVERTER_RULES') {
    if (target.type !== 'DIVERTER') return { ok: false, state, error: { code: 'UNSUPPORTED_RULE', componentId: target.id } };
    if (command.rules.length > 2) return { ok: false, state, error: { code: 'TOO_MANY_RULES', componentId: target.id } };
    const conditions = command.rules.map((rule) => rule.when);
    if (new Set(conditions).size !== conditions.length) return { ok: false, state, error: { code: 'DUPLICATE_RULE', componentId: target.id } };
    if (command.rules.some((rule) => !['CUT_PLATE', 'PRESSED_BLOCK'].includes(rule.when) || !['A', 'B'].includes(rule.then))) {
      return { ok: false, state, error: { code: 'UNSUPPORTED_RULE', componentId: target.id } };
    }
    const rules: readonly DiverterRule[] = Object.freeze(command.rules.map((rule) => Object.freeze({ ...rule })));
    return { ok: true, state: Object.freeze({ ...state, components: Object.freeze(state.components.map((item) => item.id === target.id ? Object.freeze({ ...target, rules }) : item)) }) };
  }
  if (command.kind === 'ROTATE') {
    const direction = DIRECTIONS[(DIRECTIONS.indexOf(target.direction) + 1) % DIRECTIONS.length]!;
    return { ok: true, state: Object.freeze({ ...state, components: Object.freeze(state.components.map((item) => item.id === target.id ? Object.freeze({ ...item, direction }) as Component : item)) }) };
  }
  if (!isEditableType(target.type)) return { ok: false, state, error: { code: 'FIXED_COMPONENT', componentId: target.id } };
  const inventory = state.unlimitedInventory ? state.inventory : Object.freeze({ ...state.inventory, [target.type]: state.inventory[target.type] + 1 });
  return { ok: true, state: Object.freeze({ ...state, components: Object.freeze(state.components.filter((item) => item.id !== target.id)), inventory }) };
}
