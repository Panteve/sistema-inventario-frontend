import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  router = inject(Router);

  protected readonly title = signal('Sistema POS');

  ngOnInit() {
    this.themeService.init();
  }
}
