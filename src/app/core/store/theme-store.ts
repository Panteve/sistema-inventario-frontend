import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { DEFAULT_APP_THEME, THEMES, ThemeName } from '../../constants/theme.constants';
import { ElectronApiService } from '../services/electron-api.service';

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
  withProps(() => ({
    electronApi: inject(ElectronApiService),
  })),
  withMethods(({ electronApi, ...store }) => ({
    setTheme(light: boolean) {
      const value: ThemeName = light ? THEMES.LIGHT : DEFAULT_APP_THEME;
      patchState(store, { theme: value });
      document.documentElement.setAttribute('data-theme', value);
      electronApi.saveTheme(value);
    },
    async init() {
      const savedTheme = await electronApi.getTheme();
      this.setTheme(savedTheme ? savedTheme === THEMES.LIGHT : true);
    },
  })),
);
