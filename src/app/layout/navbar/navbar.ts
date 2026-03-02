import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthStore } from '../../store/auth-store';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  authStore = inject(AuthStore);
  theme = inject(ThemeService);
  router = inject(Router);


  logout() {
    this.authStore.logout();
  }

  changeTheme(event: Event) {
    const isChecked = (event.target as HTMLInputElement);
    if (isChecked.checked) {
      this.theme.setTheme(true);
    } else {
      this.theme.setTheme(false);
    }
  }

  ngOnInit() {
    this.theme.init();
  }


}
