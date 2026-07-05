// Domain (semantic) colours for the main app's finance area. Finance category
// hues are a global design decision, so they live in the theme palette once and
// are spread into both glassmorphism palettes (light + dark) — a theme-provider
// swap stays the entire re-skin (the mui two-case model). The hues are brand
// colours intentionally identical across modes; only mode-dependent surfaces
// (chart tooltip/borders) are derived from the theme's mode at the point of use.

import type { Theme } from '@mui/material/styles';
import type { CategoryType } from 'core/finance';

interface FinancePalette {
  must: string;
  nice: string;
  waste: string;
  total: string;
  default: string;
}

const financePalette: FinancePalette = {
  must: '#ef4444', // red-500
  nice: '#3b82f6', // blue-500
  waste: '#f59e0b', // amber-500
  total: '#8b5cf6', // violet-500
  default: '#6b7280', // gray-500
};

// Augment MUI's palette so `theme.palette.finance` is typed everywhere.
declare module '@mui/material/styles' {
  interface Palette {
    finance: FinancePalette;
  }
  interface PaletteOptions {
    finance?: FinancePalette;
  }
}

// Single lookup for a finance category's colour, derived from the theme. The
// `?? default` guards call sites that cast an arbitrary string to CategoryType.
const getFinanceColor = (theme: Theme, category: CategoryType): string =>
  theme.palette.finance[category] ?? theme.palette.finance.default;

export { financePalette, getFinanceColor };
export type { FinancePalette };
