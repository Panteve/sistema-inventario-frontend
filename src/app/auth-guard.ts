import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject, TRANSLATIONS } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  

  if (!authService.getIsLoggedIn()) {
    router.navigate(['']);
    return false;
  }
  return true;
};
