/**
 * BetterSpeak design tokens.
 * Single source of truth for colour, spacing, radius, type scale and elevation.
 * Import from here instead of hardcoding values in screens.
 */

export const Colors = {
  primary: '#2563EB',
  /** Tinted primary used for selected states (active tab, chips). */
  primarySoft: '#E8EEFE',
  grammar: '#7C4DFF',
  lesson: '#FFAA00',
  pronunciation: '#16B364',
  vocabulary: '#2563EB',
  text: '#111111',
  textSecondary: '#777777',
  border: '#E5E5E5',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  /** Neutral fill for avatars and empty media wells. */
  neutral: '#F1F3F6',
  display: '#3A3A3A',
  white: '#FFFFFF',
  overlay: 'rgba(17, 17, 17, 0.45)',
} as const;

/** Lesson/practice categories that drive per-card theming. */
export type CategoryKey = 'grammar' | 'lesson' | 'pronunciation' | 'vocabulary';

export const CategoryColors: Record<CategoryKey, string> = {
  grammar: Colors.grammar,
  lesson: Colors.lesson,
  pronunciation: Colors.pronunciation,
  vocabulary: Colors.vocabulary,
};

/** 4pt base scale. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

export const FontSize = {
  caption: 12,
  label: 13,
  body: 15,
  bodyLarge: 17,
  title: 22,
  pageTitle: 28,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Soft card elevation, tuned to read the same on iOS and Android. */
export const Shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

export const Layout = {
  screenPadding: Spacing.xl,
  maxContentWidth: 520,
  bottomNavHeight: 56,
} as const;
