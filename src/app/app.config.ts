import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthStore } from './core/store/auth-store';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ThemeStore } from './core/store/theme-store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' }), withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-419' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'COP' },
    provideAppInitializer(async () => {
      const authStore = inject(AuthStore);
      const themeStore = inject(ThemeStore);
      await themeStore.init();
      return authStore.checkSession();
    }),
  ],
};
