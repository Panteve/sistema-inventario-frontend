import { HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../auth.service";
import { inject } from "@angular/core";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  let authToken: string | null = null;

  authService.getAuthToken().then(token => {
    authToken = token;
  });
  

  if (!authToken) return next(req);


  const newReq = req.clone({
    headers: req.headers.append('X-Authentication-Token', `Bearer ${authToken}`),
  });
  return next(newReq);
}