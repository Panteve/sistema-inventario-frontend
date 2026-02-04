import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, } from '@angular/forms/signals';
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

  loading = signal<boolean>(false);
  incorrectLogin = signal<boolean>(false);
  error = signal<string>('');
  



  loginModel = signal<LoginData>({
    document: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemePath) => {
    required(schemePath.document,{message: 'El documento es obligatorio'});
    required(schemePath.password,{message: 'La contraseña es obligatoria'});
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    const loginData = this.loginModel();

    loginData.document = loginData.document.trim();
    loginData.password = loginData.password.trim();

    this.authService.login(loginData.document, loginData.password).then(res => {
      this.loading.set(false);
      this.router.navigate(['/dashboard']);
    }).catch((err) => {
      console.error('Login failed', err);
      if(err.status === 401 || err.status === 404) {
        this.error.set('Documento o contraseña incorrectos.');
        this.incorrectLogin.set(true);
      }else{
        this.error.set('Error de conexión con el servidor. Por favor, inténtelo de nuevo más tarde.');
        this.incorrectLogin.set(true);
      }
      this.loading.set(false);
    })
  }
  onInputChange() {
    if(this.incorrectLogin()) {
      this.incorrectLogin.set(false);
      this.error.set('');
    }
  }
}
