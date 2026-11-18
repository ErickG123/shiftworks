import { describe, expect, it, vi } from 'vitest';
import { formatNumber, pluralize } from './formatters';
import { I18nServiceImpl, LOCALE_STORAGE_KEY } from './i18n.service';
import { en } from './locales/en';
import { ptBR } from './locales/pt-BR';

describe('I18nServiceImpl', () => {
  it('defaults to pt-BR on first launch', () => {
    const service = new I18nServiceImpl(() => null);
    expect(service.getLocale()).toBe('pt-BR');
    expect(service.t('mainMenu.continue')).toBe('Continuar Campanha');
  });

  it('restores saved en locale and falls back to pt-BR on invalid values', () => {
    const store = new Map<string, string>([[LOCALE_STORAGE_KEY, 'en']]);
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
    };
    const service = new I18nServiceImpl(() => storage);
    expect(service.getLocale()).toBe('en');
    expect(service.t('mainMenu.continue')).toBe('Continue Campaign');

    store.set(LOCALE_STORAGE_KEY, 'fr-FR');
    const fallback = new I18nServiceImpl(() => storage);
    expect(fallback.getLocale()).toBe('pt-BR');
  });

  it('handles storage errors gracefully without crashing', () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    const service = new I18nServiceImpl(() => throwingStorage);
    expect(service.getLocale()).toBe('pt-BR');
    service.setLocale('en');
    expect(service.getLocale()).toBe('en');
  });

  it('has full key parity between pt-BR and en with no empty values', () => {
    const ptKeys = Object.keys(ptBR).sort();
    const enKeys = Object.keys(en).sort();
    expect(enKeys).toEqual(ptKeys);
    for (const key of ptKeys) {
      expect((ptBR as Record<string, string>)[key]!.trim().length).toBeGreaterThan(0);
      expect((en as Record<string, string>)[key]!.trim().length).toBeGreaterThan(0);
    }
  });

  it('interpolates parameters and pluralizes in both locales', () => {
    const service = new I18nServiceImpl(() => null);
    expect(service.t('common.selectedCell', { x: 2, y: 5 })).toBe('Célula selecionada: 2, 5');
    expect(pluralize(1, 'tick', 'ticks', 'pt-BR')).toBe('1 tick');
    expect(pluralize(3, 'item', 'itens', 'pt-BR')).toBe('3 itens');
    expect(formatNumber(1000, 'en')).toBe('1,000');
  });

  it('notifies subscribers on locale change and supports unsubscribe', () => {
    const service = new I18nServiceImpl(() => null);
    const listener = vi.fn();
    const unsub = service.subscribe(listener);
    service.setLocale('en');
    expect(listener).toHaveBeenCalledWith('en');
    unsub();
    service.setLocale('pt-BR');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
