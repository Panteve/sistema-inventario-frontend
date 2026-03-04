import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

// notification.store.ts
export const ErrorStore = signalStore(
  { providedIn: 'root' },
  withState({
    message: null as string | null,
  }),
  withMethods((store) => ({
    showError(message: string) {
      patchState(store, { message });
      setTimeout(() => {
        patchState(store, { message: null });
      }, 5000);
    },
    clearError() {
      patchState(store, { message: null });
    },
  })),
);
