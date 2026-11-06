import { Platform } from "react-native";

export const Colors = {
  // Primary palette
  PRIMARY: '#5B4DFF',
  PRIMARY_DARK: '#412CE7',
  PRIMARY_FIXED: '#E3DFFF',
  PRIMARY_FIXED_DIM: '#C4C0FF',

  // Secondary / success
  SECONDARY: '#006E2D',
  SECONDARY_CONTAINER: '#7CF994',
  ON_SECONDARY_CONTAINER: '#007230',

  // Surface hierarchy
  SURFACE: '#F8F9FF',
  SURFACE_LOWEST: '#FFFFFF',
  SURFACE_LOW: '#EFF4FF',
  SURFACE_CONTAINER: '#E5EEFF',
  SURFACE_HIGH: '#DCE9FF',
  SURFACE_HIGHEST: '#D3E4FE',

  // On-surface
  ON_SURFACE: '#0B1C30',
  ON_SURFACE_VARIANT: '#464556',

  // Outline
  OUTLINE: '#777588',
  OUTLINE_VARIANT: '#C7C4D9',

  // State / utility
  ERROR: '#BA1A1A',
  ON_PRIMARY: '#FFFFFF',

  // Legacy light/dark theme (kept for backward compat with old components) ──
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

/** @deprecated Use specific Color keys from Colors instead */
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

//  Typography
export const Typography = {
  displayLg: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  headlineLg: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  headlineMd: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  headlineSm: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  labelLg: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  labelMd: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  labelSm: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
} as const;

//  Spacing
/** NeoFin spacing scale (xs/sm/md/lg/xl) */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  // Legacy numeric aliases kept for backward compat
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Border Radius
export const Radius = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Legacy exports (backward compat)

/** @deprecated Use Typography from NeoFin design tokens */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** @deprecated Not needed in new screens */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** @deprecated Not needed in new screens */
export const MaxContentWidth = 800;
