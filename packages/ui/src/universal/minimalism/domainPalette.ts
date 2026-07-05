// Domain (semantic) colours for the main app's finance area. Finance category
// hues are a global design decision, so they live in the theme palette once and
// are spread into both glassmorphism palettes (light + dark) — a theme-provider
// swap stays the entire re-skin (the mui two-case model). The hues are brand
// colours intentionally identical across modes; only mode-dependent surfaces
// (chart tooltip/borders) are derived from the theme's mode at the point of use.

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

export { financePalette };
export type { FinancePalette };
