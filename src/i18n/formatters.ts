import type { SupportedLocale } from './i18n.model';

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
