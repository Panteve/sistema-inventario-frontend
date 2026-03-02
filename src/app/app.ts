import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { AuthStore } from './store/auth-store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorStore } from './store/errors-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  themeService = inject(ThemeService);
  errorStore = inject(ErrorStore);
  authStore = inject(AuthStore);
  router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationStart),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.errorStore.clearError());
  }

  protected readonly title = signal('Sistema POS');

  ngOnInit() {
    this.themeService.init();
  }
}
