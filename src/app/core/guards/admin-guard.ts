import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthStore } from '../store/auth-store';

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);

  return authStore.isAdmin();
};
