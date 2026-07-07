import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ElectronApiService {
  private get isAvailable(): boolean {
    return typeof window !== 'undefined' && 'electronAPI' in window;
  }

  async saveToken(token: string): Promise<void> {
    if (this.isAvailable) await window.electronAPI.saveToken(token);
  }

  async getToken(): Promise<string | null> {
    if (this.isAvailable) return window.electronAPI.getToken();
    return null;
  }

  async deleteToken(): Promise<void> {
    if (this.isAvailable) await window.electronAPI.deleteToken();
  }

  async saveTheme(theme: string): Promise<void> {
    if (this.isAvailable) await window.electronAPI.saveTheme(theme);
  }

  async getTheme(): Promise<string> {
    if (this.isAvailable) return window.electronAPI.getTheme();
    return '';
  }
}
