# HTML-TEMPLATE-ORGANIZATION

> Date: 2026-11-18  
> Convention: Vite `?raw` HTML templates + TypeScript behavior + modular CSS.

## Pattern
- **Static/semi-static views** (`main-menu.html`, `level-select.html`, `tutorial-banner.html`) are stored as `.html` files alongside their `.ts` controller and imported via Vite `?raw`.
- **Mounting**: `mountTemplate(container, htmlRaw)` parses/inserts the template once per view switch; dynamic values are updated via `textContent` and `dataset` attributes—never by string-interpolating untrusted/dynamic data into `innerHTML`.
- **Dynamic lists** (`#level-select`, `#inventory`, `.level-grid`) use `document.createElement` + `textContent` + `replaceChildren(...)`.
