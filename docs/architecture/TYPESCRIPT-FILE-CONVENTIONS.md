# TYPESCRIPT-FILE-CONVENTIONS

- `*.model.ts`: Domain interfaces, discriminated unions, and pure invariants.
- `*.types.ts`: Shared type aliases and unions when not tied to a single implementation file.
- `*.constants.ts` / `*.config.ts`: Immutable configuration and gameplay constants.
- `*.html` (`?raw`) + `*.css`: Presentation markup and styles, separated from `.ts` controllers.
- Local, single-file types (e.g., `ScreenState` in `navigation-controller.ts`) remain co-located with their consumer.
