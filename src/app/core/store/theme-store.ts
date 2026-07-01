import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { DEFAULT_APP_THEME, THEMES, ThemeName } from '../../constants/theme.constants';

type ThemeState = {
  theme: ThemeName;
};

const initialState: ThemeState = {
  theme: THEMES.LIGHT,
};

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ theme }) => ({
    isLightTheme: computed(() => theme() === THEMES.LIGHT),
  })),
  withMethods((store) => ({
    setTheme(light: boolean) {
      const value: ThemeName = light ? THEMES.LIGHT : DEFAULT_APP_THEME;
      patchState(store, { theme: value });
      document.documentElement.setAttribute('data-theme', value);
      window.electronAPI.saveTheme(value);
    },
    async init() {
      const savedTheme = await window.electronAPI.getTheme();
      this.setTheme(savedTheme ? savedTheme === THEMES.LIGHT : true);
    },
  })),
);
