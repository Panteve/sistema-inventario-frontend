export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  DRACULA: 'dracula',
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export const DEFAULT_APP_THEME: ThemeName = THEMES.DRACULA;
export const FIXED_LAYOUT_THEME: ThemeName = THEMES.DRACULA;
