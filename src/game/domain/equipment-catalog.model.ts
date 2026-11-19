import type { ComponentType } from './component.model';
import type { EquipmentCatalogEntry } from './expansion-contracts.model';

export const EQUIPMENT_CATALOG: readonly EquipmentCatalogEntry[] = Object.freeze([
  Object.freeze({
    id: 'SOURCE',
    editable: false,
    nameKey: 'components.SOURCE',
    summaryKey: 'catalog.SOURCE.summary',
    usageKey: 'catalog.SOURCE.usage',
    portsSummaryKey: 'catalog.SOURCE.ports',
    unlockLevelId: null,
    previewScenario: 'SOURCE_EMIT',
  }),
  Object.freeze({
    id: 'CONVEYOR',
    editable: true,
    nameKey: 'components.CONVEYOR',
    summaryKey: 'catalog.CONVEYOR.summary',
    usageKey: 'catalog.CONVEYOR.usage',
    portsSummaryKey: 'catalog.CONVEYOR.ports',
    unlockLevelId: 'L01',
    previewScenario: 'CONVEYOR_FLOW',
  }),
  Object.freeze({
    id: 'PROCESSOR',
    editable: true,
    nameKey: 'components.PROCESSOR',
    summaryKey: 'catalog.PROCESSOR.summary',
    usageKey: 'catalog.PROCESSOR.usage',
    portsSummaryKey: 'catalog.PROCESSOR.ports',
    unlockLevelId: 'L02',
    previewScenario: 'PROCESSOR_SHIFT',
  }),
  Object.freeze({
    id: 'DIVERTER',
    editable: true,
    nameKey: 'components.DIVERTER',
    summaryKey: 'catalog.DIVERTER.summary',
    usageKey: 'catalog.DIVERTER.usage',
    portsSummaryKey: 'catalog.DIVERTER.ports',
    unlockLevelId: 'L03',
    previewScenario: 'DIVERTER_SPLIT',
  }),
  Object.freeze({
    id: 'OUTPUT',
    editable: false,
    nameKey: 'components.OUTPUT',
    summaryKey: 'catalog.OUTPUT.summary',
    usageKey: 'catalog.OUTPUT.usage',
    portsSummaryKey: 'catalog.OUTPUT.ports',
    unlockLevelId: null,
    previewScenario: 'OUTPUT_DOCK',
  }),
]);

export function getEquipmentCatalogEntry(
  id: ComponentType,
): EquipmentCatalogEntry | undefined {
  return EQUIPMENT_CATALOG.find((entry) => entry.id === id);
}
