import {
  ALL_EDITABLE_TYPES,
  type EditableComponentType,
  type ItemType,
  getInventoryCount,
} from './component.model';
import { LEVEL_CATALOG } from './level-catalog.model';
import { isLevelUnlocked } from './level-progression.model';
import { ASSEMBLER_RECIPES, PROCESSOR_RECIPES } from './recipes.model';

export type CatalogCategory = 'MACHINES' | 'RESOURCES';
export type CatalogItemStatus = 'LOCKED' | 'UNLOCKED' | 'DISCOVERED';
export type CatalogSortBy = 'CAMPAIGN' | 'NAME' | 'PROGRESS';

export const ALL_RESOURCE_TYPES: readonly ItemType[] = Object.freeze([
  'BLUE_BLANK',
  'AMBER_BLANK',
  'COPPER_BLANK',
  'INSULATOR',
  'CUT_PLATE',
  'PRESSED_BLOCK',
  'COPPER_STRIP',
  'CIRCUIT',
  'FRAME',
  'CONTROL_MODULE',
  'AUTOMATION_UNIT',
]);

export const RAW_RESOURCE_TYPES: ReadonlySet<ItemType> = new Set<ItemType>([
  'BLUE_BLANK',
  'AMBER_BLANK',
  'COPPER_BLANK',
  'INSULATOR',
]);

export interface CatalogEntry {
  readonly id: EditableComponentType | ItemType;
  readonly category: CatalogCategory;
  readonly subCategory: 'MACHINE' | 'RAW' | 'PROCESSED';
  readonly status: CatalogItemStatus;
  readonly unlockLevelId: string;
  readonly unlockOrder: number;
  readonly has3DPreview: boolean;
  readonly accentColor: string;
  readonly collectedCount: number;
  readonly recipeSummary: string | null;
}

export interface CatalogFilterOptions {
  readonly category: CatalogCategory;
  readonly query: string;
  readonly status: 'ALL' | CatalogItemStatus;
  readonly sortBy: CatalogSortBy;
  readonly getLabel: (entry: CatalogEntry) => string;
}

const MACHINE_COLORS: Record<EditableComponentType, string> = {
  CONVEYOR: '#38bdf8',
  PROCESSOR: '#f59e0b',
  DIVERTER: '#a855f7',
  BUFFER: '#0ea5e9',
  SENSOR: '#14b8a6',
  SPLITTER: '#ec4899',
  MERGER: '#f97316',
  ASSEMBLER: '#22c55e',
};

const RESOURCE_COLORS: Record<ItemType, string> = {
  BLUE_BLANK: '#38bdf8',
  AMBER_BLANK: '#f59e0b',
  COPPER_BLANK: '#fb923c',
  INSULATOR: '#94a3b8',
  CUT_PLATE: '#0ea5e9',
  PRESSED_BLOCK: '#d97706',
  COPPER_STRIP: '#ea580c',
  CIRCUIT: '#10b981',
  FRAME: '#6366f1',
  CONTROL_MODULE: '#8b5cf6',
  AUTOMATION_UNIT: '#f43f5e',
};

const PREVIEW_3D_SUPPORTED: ReadonlySet<EditableComponentType> = new Set([
  'CONVEYOR',
  'PROCESSOR',
  'DIVERTER',
]);

function findMachineIntroLevel(type: EditableComponentType): { levelId: string; index: number } {
  for (let i = 0; i < LEVEL_CATALOG.length; i += 1) {
    const level = LEVEL_CATALOG[i]!;
    if (getInventoryCount(level.inventory, type) > 0) {
      return { levelId: level.id, index: i };
    }
  }
  return { levelId: 'L01', index: 0 };
}

function findResourceIntroLevel(item: ItemType): { levelId: string; index: number } {
  for (let i = 0; i < LEVEL_CATALOG.length; i += 1) {
    const level = LEVEL_CATALOG[i]!;
    const inGoals = level.goals.some((goal) => goal.itemType === item);
    const inSources = level.fixedComponents.some(
      (comp) => comp.type === 'SOURCE' && comp.sequence.includes(item),
    );
    if (inGoals || inSources) {
      return { levelId: level.id, index: i };
    }
  }
  return { levelId: 'L01', index: 0 };
}

function getResourceRecipeSummary(item: ItemType): string | null {
  const proc = PROCESSOR_RECIPES.find((r) => r.output === item);
  if (proc) {
    return `${proc.input} -> ${proc.output} (${proc.mode})`;
  }
  const asm = ASSEMBLER_RECIPES.find((r) => r.output === item);
  if (asm) {
    return `${asm.inputA} + ${asm.inputB} -> ${asm.output}`;
  }
  return null;
}

export function buildCatalogEntries(
  completedLevelIds: readonly string[],
  collectedItemsByType: Readonly<Record<string, number>> = {},
): readonly CatalogEntry[] {
  const completedSet = new Set(completedLevelIds);
  const entries: CatalogEntry[] = [];

  for (const type of ALL_EDITABLE_TYPES) {
    const intro = findMachineIntroLevel(type);
    const unlocked = isLevelUnlocked(intro.levelId, completedLevelIds);
    const usedInCompleted = LEVEL_CATALOG.some(
      (level) => completedSet.has(level.id) && getInventoryCount(level.inventory, type) > 0,
    );
    const status: CatalogItemStatus = usedInCompleted
      ? 'DISCOVERED'
      : unlocked
        ? 'UNLOCKED'
        : 'LOCKED';

    entries.push(
      Object.freeze({
        id: type,
        category: 'MACHINES',
        subCategory: 'MACHINE',
        status,
        unlockLevelId: intro.levelId,
        unlockOrder: intro.index,
        has3DPreview: PREVIEW_3D_SUPPORTED.has(type),
        accentColor: MACHINE_COLORS[type],
        collectedCount: 0,
        recipeSummary: null,
      }),
    );
  }

  for (const item of ALL_RESOURCE_TYPES) {
    const intro = findResourceIntroLevel(item);
    const unlocked = isLevelUnlocked(intro.levelId, completedLevelIds);
    const collectedCount = Math.max(0, Math.floor(collectedItemsByType[item] ?? 0));
    const seenInCompleted = LEVEL_CATALOG.some(
      (level) =>
        completedSet.has(level.id) &&
        (level.goals.some((g) => g.itemType === item) ||
          level.fixedComponents.some(
            (c) => c.type === 'SOURCE' && c.sequence.includes(item),
          )),
    );
    const status: CatalogItemStatus =
      collectedCount > 0 || seenInCompleted
        ? 'DISCOVERED'
        : unlocked
          ? 'UNLOCKED'
          : 'LOCKED';

    entries.push(
      Object.freeze({
        id: item,
        category: 'RESOURCES',
        subCategory: RAW_RESOURCE_TYPES.has(item) ? 'RAW' : 'PROCESSED',
        status,
        unlockLevelId: intro.levelId,
        unlockOrder: intro.index,
        has3DPreview: false,
        accentColor: RESOURCE_COLORS[item],
        collectedCount,
        recipeSummary: getResourceRecipeSummary(item),
      }),
    );
  }

  return Object.freeze(entries);
}

const STATUS_RANK: Record<CatalogItemStatus, number> = {
  DISCOVERED: 0,
  UNLOCKED: 1,
  LOCKED: 2,
};

export function filterAndSortCatalog(
  entries: readonly CatalogEntry[],
  options: CatalogFilterOptions,
): readonly CatalogEntry[] {
  const normalizedQuery = options.query.trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    if (entry.category !== options.category) return false;
    if (options.status !== 'ALL' && entry.status !== options.status) return false;
    if (normalizedQuery.length > 0) {
      const label = options.getLabel(entry).toLowerCase();
      return label.includes(normalizedQuery);
    }
    return true;
  });

  return Object.freeze(
    [...filtered].sort((a, b) => {
      if (options.sortBy === 'NAME') {
        return options.getLabel(a).localeCompare(options.getLabel(b));
      }
      if (options.sortBy === 'PROGRESS') {
        const rankDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (rankDiff !== 0) return rankDiff;
        if (b.collectedCount !== a.collectedCount) {
          return b.collectedCount - a.collectedCount;
        }
      }
      return a.unlockOrder - b.unlockOrder;
    }),
  );
}
