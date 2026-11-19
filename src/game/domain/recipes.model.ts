import type { AssemblerRecipeId, ItemType, MachineMode } from './component.model';

export type ProcessorRecipe = Readonly<{
  input: 'BLUE_BLANK' | 'AMBER_BLANK' | 'COPPER_BLANK';
  mode: MachineMode;
  output: ItemType;
  processTicks: number;
}>;

export type AssemblerRecipe = Readonly<{
  id: AssemblerRecipeId;
  inputA: ItemType;
  inputB: ItemType;
  output: ItemType;
  processTicks: number;
}>;

export const PROCESSOR_RECIPES: readonly ProcessorRecipe[] = Object.freeze([
  Object.freeze({ input: 'BLUE_BLANK', mode: 'CUT', output: 'CUT_PLATE', processTicks: 3 }),
  Object.freeze({ input: 'AMBER_BLANK', mode: 'PRESS', output: 'PRESSED_BLOCK', processTicks: 3 }),
  Object.freeze({ input: 'COPPER_BLANK', mode: 'CUT', output: 'COPPER_STRIP', processTicks: 3 }),
]);

export const ASSEMBLER_RECIPES: readonly AssemblerRecipe[] = Object.freeze([
  Object.freeze({
    id: 'CIRCUIT',
    inputA: 'COPPER_STRIP',
    inputB: 'INSULATOR',
    output: 'CIRCUIT',
    processTicks: 3,
  }),
  Object.freeze({
    id: 'FRAME',
    inputA: 'CUT_PLATE',
    inputB: 'PRESSED_BLOCK',
    output: 'FRAME',
    processTicks: 3,
  }),
  Object.freeze({
    id: 'CONTROL_MODULE',
    inputA: 'FRAME',
    inputB: 'CIRCUIT',
    output: 'CONTROL_MODULE',
    processTicks: 3,
  }),
  Object.freeze({
    id: 'AUTOMATION_UNIT',
    inputA: 'CONTROL_MODULE',
    inputB: 'PRESSED_BLOCK',
    output: 'AUTOMATION_UNIT',
    processTicks: 3,
  }),
]);

export function resolveProcessorOutput(input: ItemType, mode: MachineMode): ItemType {
  const match = PROCESSOR_RECIPES.find(
    (recipe) => recipe.input === input && recipe.mode === mode,
  );
  return match ? match.output : input;
}

export function getAssemblerRecipe(recipeId: AssemblerRecipeId): AssemblerRecipe {
  return ASSEMBLER_RECIPES.find((recipe) => recipe.id === recipeId) ?? ASSEMBLER_RECIPES[0]!;
}
