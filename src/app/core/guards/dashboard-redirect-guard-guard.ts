import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth-store';

export const dashboardRedirectGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const route = authStore.isAdmin() ? '/dashboard/admin' : '/dashboard/cashier';
  return router.navigate([route]);
};
