import type { ComponentType, Direction, ItemType, MachineMode } from '../game/domain/component.model';
import type { SupportedLocale } from './i18n.model';
import { i18n } from './i18n.service';

export function formatNumber(value: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: SupportedLocale,
): string {
  return `${formatNumber(count, locale)} ${count === 1 ? singular : plural}`;
}

export function formatItemType(itemType: ItemType): string {
  return i18n.t(`items.${itemType}`);
}

export function formatComponentType(componentType: ComponentType): string {
  return i18n.t(`components.${componentType}`);
}

export function formatDirection(direction: Direction): string {
  return i18n.t(`directions.${direction}`);
}

export function formatMachineMode(mode: MachineMode): string {
  return i18n.t(`modes.${mode}`);
}

export function formatOutputName(outputIdOrLabel: string): string {
  const key = `outputs.${outputIdOrLabel}`;
  const translated = i18n.t(key);
  return translated === key ? outputIdOrLabel : translated;
}

export function formatDiagnosticReason(reason: string): string {
  const key = `simulation.reason.${reason}`;
  const translated = i18n.t(key);
  return translated === key ? reason.toLowerCase().replaceAll('_', ' ') : translated;
}
