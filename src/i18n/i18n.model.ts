export type SupportedLocale = 'pt-BR' | 'en';

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['pt-BR', 'en'];

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === 'pt-BR' || value === 'en';
}

export interface I18nService {
  getLocale(): SupportedLocale;
  setLocale(locale: SupportedLocale): void;
  t(key: string, params?: Record<string, string | number>): string;
  subscribe(listener: (locale: SupportedLocale) => void): () => void;
}
