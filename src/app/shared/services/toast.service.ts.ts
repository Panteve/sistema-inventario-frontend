import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  title?: string;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();

  show(notification: { message: string; type: ToastType; duration?: number; title?: string }) {
    const id = Date.now();
    const duration = notification.duration || 5000;

    this._toasts.update((t) => [...t, { id, ...notification, duration } as Toast]);

    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this._toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
