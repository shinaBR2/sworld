// How many photo tiles fit one timeline row at each breakpoint. Denser than
// the watch grid — photos read well small and the point is to see many at once.
const COLUMNS_BY_BREAKPOINT = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 5,
  xl: 6,
} as const;

export { COLUMNS_BY_BREAKPOINT };
