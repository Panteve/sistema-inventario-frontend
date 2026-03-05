import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeStore } from '../../store/theme-store';
import { AuthStore } from '../../store/auth-store';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authStore = inject(AuthStore);
  theme = inject(ThemeStore);
  router = inject(Router);

  logout() {
    this.authStore.logout();
  }

  changeTheme(event: Event) {
    this.theme.setTheme((event.target as HTMLInputElement).checked);
  }
}
