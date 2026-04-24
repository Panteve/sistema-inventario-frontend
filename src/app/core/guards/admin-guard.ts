import { CanActivateChildFn } from '@angular/router';
import { AuthStore } from '../store/auth-store';
import { inject } from '@angular/core';

export const adminChildGuard: CanActivateChildFn = () => {
  const authStore = inject(AuthStore);

  return authStore.isAdmin();
};
