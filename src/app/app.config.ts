import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/interceptors/auth.interceptor';
import { AuthStore } from './store/auth-store';
import { errorInterceptor } from './services/interceptors/error.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: DEFAULT_CURRENCY_CODE, useValue: '$' },
    provideAppInitializer(async () => {
      const authStore = inject(AuthStore);
      return authStore.checkSession();
    }),
  ],
};
