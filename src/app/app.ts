import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Navbar } from "./layout/navbar/navbar";
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  auth = inject(AuthService)
  themeService = inject(ThemeService);
  protected readonly title = signal('sistema-inventario-frontend');

  ngOnInit() {
    this.themeService.init();
  }
  
  

}
