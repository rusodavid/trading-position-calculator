# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200
npm run build      # production build → dist/trading-position-calculator/
```

No test runner or linter is configured.

## Architecture

Single-page Angular 16 app with **one standalone component** (`AppComponent`) that owns all state and calculation logic. There are no services, no routing, and no additional components.

The component uses `[(ngModel)]` (via `FormsModule`) for two-way binding on inputs, and calls `calcularTodo()` on every input event to recompute all three position-size results reactively.

### Calculation formulas

| Section | Formula |
|---|---|
| Riesgo (Risk) | `(patrimonio × riesgoPorcentaje) / (precioCompra − stop)` |
| Volatilidad (ATR) | `(patrimonio × volatilidadPorcentaje) / atr` |
| Capital | `(patrimonio × capitalPorcentaje) / precioCompra` |

Each section has three preset percentage radio buttons (beginner / intermediate / expert) that update the corresponding percentage field and trigger recalculation.

### Deployment note

`src/index.html` sets `<base href="/trading-position-calculator/">`, which is required for hosting on a subdirectory (e.g. GitHub Pages). The `angular.json` build output goes to `dist/trading-position-calculator/`.
