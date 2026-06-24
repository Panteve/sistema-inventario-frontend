export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  business: 'business',
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export const DEFAULT_APP_THEME: ThemeName = THEMES.business;
export const FIXED_LAYOUT_THEME: ThemeName = THEMES.business;
