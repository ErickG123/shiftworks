# AUDIT-i18n-baseline — Internationalization (pt-BR / en)

> Date: 2026-11-18  
> Scope: Inventory of UI/game strings, persistence, and i18n architecture plan.

## 1. Existing State
- **i18n Service**: None (`src/i18n` does not exist).
- **Persistence**: `GameStorageAdapter` (`src/game/persistence/storage-adapter.ts`, key `shiftworks.game-state.v1`) stores `completedLevelIds` and `preferences` (`gameMode`, `levelId`, `sourceSequenceMode`) with in-memory fallback when `localStorage` is unavailable.
- **Visible Strings**: Hardcoded in English across `index.html`, `src/game/ui/navigation-controller.ts`, `src/game/editor/editor-controller.ts`, `src/game/editor/tool-availability.ts`, `src/game/simulation/simulation-controller.ts`, `src/status.ts`, and `LEVEL_CATALOG` (`title`, `tutorial`).

## 2. Target Architecture
- `src/i18n/i18n.model.ts`: `SupportedLocale = 'pt-BR' | 'en'`, `DEFAULT_LOCALE = 'pt-BR'`, `TranslationDictionary`, `TranslationKey`, `I18nService` interface.
- `src/i18n/locales/pt-BR.ts` & `src/i18n/locales/en.ts`: Full parity dictionaries grouped by domain (`common`, `mainMenu`, `levelSelect`, `tools`, `inspector`, `simulation`, `tutorial`, `levels`, `errors`, `settings`).
- `src/i18n/formatters.ts`: `formatNumber(value, locale)`, `pluralizeTick(count, locale)`, `pluralizeItem(count, locale)`.
- `src/i18n/i18n.service.ts`: Singleton/class with `pt-BR` default (ignoring `navigator.language`), `localStorage` persistence (`shiftworks.locale.v1` with in-memory fallback), `document.documentElement.lang` sync, `subscribe()`, and safe interpolation (`{param}`).
