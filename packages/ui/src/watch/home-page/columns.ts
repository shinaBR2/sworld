// Single source of truth for the watch home-page grid responsive layout.
// GRID_COLUMN_PROPS feeds the MUI <Grid> `size` prop; COLUMNS_PER_ROW is
// the matching number of cards that fit one row at each breakpoint — used to
// slice the "Continue watching" row so it never wraps. Keep the two in sync.
const GRID_COLUMN_PROPS = { xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 } as const;
const COLUMNS_PER_ROW = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 } as const;

export { COLUMNS_PER_ROW, GRID_COLUMN_PROPS };
