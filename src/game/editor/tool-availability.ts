import {
  getInventoryCount,
  type ComponentInventory,
  type EditableComponentType,
} from '../domain/component.model';
import type { EditorMode } from '../domain/editor.model';

export type EditorTool = 'SELECT' | EditableComponentType | 'REMOVE';

export type ToolAvailabilityReasonKey =
  | 'tools.finishRunToEdit'
  | 'tools.notAvailable'
  | 'tools.noRemaining';

export type ToolAvailability = Readonly<{
  enabled: boolean;
  reason: string | null;
  reasonKey: ToolAvailabilityReasonKey | null;
  remaining: number | null;
}>;

export function getToolAvailability(params: {
  tool: EditorTool;
  editorMode: EditorMode;
  unlimitedInventory: boolean;
  inventory: ComponentInventory;
  levelBudget: ComponentInventory;
}): ToolAvailability {
  const { tool, editorMode, unlimitedInventory, inventory, levelBudget } = params;

  if (tool === 'SELECT') {
    return { enabled: true, reason: null, reasonKey: null, remaining: null };
  }

  if (editorMode !== 'EDITING') {
    return {
      enabled: false,
      reason: 'Finish or exit the current run to edit',
      reasonKey: 'tools.finishRunToEdit',
      remaining:
        tool === 'REMOVE'
          ? null
          : unlimitedInventory
            ? null
            : getInventoryCount(inventory, tool),
    };
  }

  if (tool === 'REMOVE') {
    return { enabled: true, reason: null, reasonKey: null, remaining: null };
  }

  if (unlimitedInventory) {
    return { enabled: true, reason: null, reasonKey: null, remaining: null };
  }

  if (getInventoryCount(levelBudget, tool) <= 0) {
    return {
      enabled: false,
      reason: 'Not available in this level',
      reasonKey: 'tools.notAvailable',
      remaining: 0,
    };
  }

  const remaining = getInventoryCount(inventory, tool);
  if (remaining <= 0) {
    return {
      enabled: false,
      reason: 'No pieces remaining',
      reasonKey: 'tools.noRemaining',
      remaining: 0,
    };
  }

  return { enabled: true, reason: null, reasonKey: null, remaining };
}
