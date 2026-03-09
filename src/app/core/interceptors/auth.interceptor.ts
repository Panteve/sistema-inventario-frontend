import { inject } from '@angular/core';
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthStore } from '../store/auth-store';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authStore = inject(AuthStore);

  return from(authStore.getToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const newReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });

      return next(newReq);
    }),
  );
}
