import { inject } from '@angular/core';
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);

  return from(authService.getAuthToken()).pipe(
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
