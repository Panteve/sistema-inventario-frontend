import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface LoginData {
  document: string;
  password: string;
}

@Component({
  selector: 'app-login.component',
  imports: [FormField],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  private login = signal<boolean>(false);

  isLoggedIn = computed<boolean>(() => this.login());


  loginModel = signal<LoginData>({
    document: '',
    password: '',
  });

  loginForm = form(this.loginModel);

  onSubmit(event: Event) {
    event.preventDefault();
    const loginData = this.loginModel();

    loginData.document = loginData.document.trim();
    loginData.password = loginData.password.trim();
    if(this.authService.login(loginData.document, loginData.password)){
      this.login.set(true);
    }
    this.authService.getAuthToken().then(token => {
      console.log('Auth Token:', token);
    })
    if (this.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }else{
      alert('Login failed. Please check your credentials.');
    }
  }
}
