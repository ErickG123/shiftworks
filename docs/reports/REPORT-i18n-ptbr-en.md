# REPORT-i18n-ptbr-en — Internationalization (pt-BR / en)

> Date: 2026-11-18  
> Default Locale: `pt-BR` (`Português (Brasil)`)  
> Supported Locales: `pt-BR`, `en`

## 1. Architecture
- **Models**: [src/i18n/i18n.model.ts](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/src/i18n/i18n.model.ts) (`SupportedLocale = 'pt-BR' | 'en'`, `DEFAULT_LOCALE = 'pt-BR'`, `I18nService` interface).
- **Dictionaries**: [src/i18n/locales/pt-BR.ts](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/src/i18n/locales/pt-BR.ts) & [src/i18n/locales/en.ts](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/src/i18n/locales/en.ts) with TypeScript-enforced key parity.
- **Formatters**: [src/i18n/formatters.ts](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/src/i18n/formatters.ts) (`formatNumber`, `pluralize`).
- **Service**: [src/i18n/i18n.service.ts](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/src/i18n/i18n.service.ts) (`I18nServiceImpl` with `pt-BR` default, `shiftworks.locale.v1` `localStorage` persistence + in-memory fallback, `document.documentElement.lang` sync, `subscribe()`, and safe `{param}` interpolation).
- **UI Integration**: [src/game/ui/navigation-controller.ts](file:///C:/Users/erick.alves/Documents/GitHub/shiftworks/src/game/ui/navigation-controller.ts) provides language selectors in both the Main Menu (`#menu-language-select`) and the Gameplay Header (`#hud-language-select`), updating Main Menu, Level Select, Tutorial T00, Tools, Inspector, and Simulation Bar immediately without reloading or resetting the Three.js scene.

## 2. Validation Results
| Check | Command | Result |
|---|---|---|
| ESLint | `npm run lint` | PASS |
| Typecheck | `npm run typecheck` | PASS |
| Unit/Integration | `npm test` | PASS (23 files, 96 tests) |
| Production Build | `npm run build` | PASS (`dist/assets/index-D28RsHFv.js` 622.71 kB) |
