import { Injectable, signal } from '@angular/core';

@Injectable({ 
    providedIn: 'root' 
})
export class ThemeService {
  theme = signal<string>('');

  async init() {
    const savedTheme = await window.electronAPI.getTheme();
    if (!savedTheme) {
      this.setTheme(true);
    }else {
      this.theme.set(savedTheme);
      document.documentElement.setAttribute('data-theme', this.theme());
    }
  }

  setTheme(light:boolean) {
    if (light) {
      this.theme.set('light');
    } else {
      this.theme.set('sunset');
    }
    document.documentElement.setAttribute('data-theme', this.theme());
    window.electronAPI.saveTheme(this.theme());
  }
}
