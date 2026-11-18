import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type I18nService,
  type SupportedLocale,
} from './i18n.model';
import { en } from './locales/en';
import { ptBR, type TranslationKey } from './locales/pt-BR';

export const LOCALE_STORAGE_KEY = 'shiftworks.locale.v1';

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

const DICTIONARIES: Record<SupportedLocale, Record<TranslationKey, string>> = {
  'pt-BR': ptBR,
  en,
};

export class I18nServiceImpl implements I18nService {
  private locale: SupportedLocale;
  private readonly listeners = new Set<(locale: SupportedLocale) => void>();

  constructor(
    private readonly getStorage: () => StoragePort | null = () =>
      typeof globalThis !== 'undefined' && 'localStorage' in globalThis
        ? globalThis.localStorage
        : null,
  ) {
    this.locale = this.loadLocale();
    this.syncDocumentLang();
  }

  getLocale(): SupportedLocale {
    return this.locale;
  }

  setLocale(locale: SupportedLocale): void {
    const next = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
    if (this.locale === next) {
      this.saveLocale(next);
      return;
    }
    this.locale = next;
    this.saveLocale(next);
    this.syncDocumentLang();
    this.listeners.forEach((listener) => listener(next));
  }

  t(key: TranslationKey | string, params?: Record<string, string | number>): string {
    const dict = DICTIONARIES[this.locale];
    const template =
      (dict as Record<string, string>)[key] ??
      (ptBR as Record<string, string>)[key] ??
      key;

    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (_, name: string) =>
      name in params ? String(params[name]) : `{${name}}`,
    );
  }

  subscribe(listener: (locale: SupportedLocale) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private loadLocale(): SupportedLocale {
    try {
      const raw = this.getStorage()?.getItem(LOCALE_STORAGE_KEY);
      return isSupportedLocale(raw) ? raw : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  }

  private saveLocale(locale: SupportedLocale): void {
    try {
      this.getStorage()?.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage unavailable; keep in-memory locale.
    }
  }

  private syncDocumentLang(): void {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = this.locale;
    }
  }
}

export const i18n = new I18nServiceImpl();
