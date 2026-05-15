# UI Coding Standards

## Component Library

**All UI must be built exclusively with [shadcn/ui](https://ui.shadcn.com/) components.**

- Do **not** create custom UI components. If a UI element is needed, find the appropriate shadcn/ui component and use it as-is or compose it from other shadcn/ui primitives.
- Do **not** build wrappers, abstractions, or re-exports around shadcn/ui components.
- shadcn/ui components live in `components/ui/`. Add new ones via the CLI: `npx shadcn@latest add <component>`.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/). No other date library or manual string manipulation is permitted.

### Required Format

Dates must be displayed using ordinal day, abbreviated month name, and 4-digit year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2025
4th Jun 2024
```

### Implementation

Use `format` from `date-fns` with the `do MMM yyyy` format string:

```ts
import { format } from 'date-fns';

format(new Date('2025-09-01'), 'do MMM yyyy'); // "1st Sep 2025"
format(new Date('2025-08-02'), 'do MMM yyyy'); // "2nd Aug 2025"
format(new Date('2025-01-03'), 'do MMM yyyy'); // "3rd Jan 2025"
format(new Date('2024-06-04'), 'do MMM yyyy'); // "4th Jun 2024"
```

This applies everywhere a date is rendered — cards, tables, labels, tooltips, and any other UI surface.
