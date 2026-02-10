import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  router = inject(Router);

  loading = signal<boolean>(false);

  logout() {
    this.loading.set(true);
    this.auth.logout().then(() => {
      this.loading.set(false);
      this.router.navigate(['']);
    });
  }
  changeTheme(event: Event) {
    const isChecked = (event.target as HTMLInputElement);
    if (isChecked.checked) {
      this.theme.setTheme(true);
    } else {
      this.theme.setTheme(false);
    }
  }

  goDashboard() {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit() {
    this.theme.init();
  }


}
