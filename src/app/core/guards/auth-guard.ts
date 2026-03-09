import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth-store';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if (!authStore.isAuthenticated()) {
    router.navigate(['']);
    return false;
  }
  return true;
};
