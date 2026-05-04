import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth-store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);

  if (!authStore.isAuthenticated()) {
    authStore.logout();
    return false;
  }
  return true;
};
