import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

type ThemeState = {
  theme: string;
};

const initialState: ThemeState = {
  theme: '',
};

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ theme }) => ({
    isLightTheme: computed(() => theme() === 'light'),
  })),
  withMethods((store) => ({
    setTheme(light: boolean) {
      const value = light ? 'light' : 'dracula';
      patchState(store, { theme: value });
      document.documentElement.setAttribute('data-theme', value);
      window.electronAPI.saveTheme(value);
    },

  })),
  withMethods((store) => ({
    async init() {
        const savedTheme = await window.electronAPI.getTheme();
        store.setTheme(savedTheme ? savedTheme === 'light' : true);
    }
  })),
);
