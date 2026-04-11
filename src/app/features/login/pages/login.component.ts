import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { LoginData } from '../../../shared/interfaces/Auth.interface';
import { AuthStore } from '../../../core/store/auth-store';

@Component({
  selector: 'app-login.component',
  imports: [FormField],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  authStore = inject(AuthStore);

  loading = signal<boolean>(false);
  incorrectLogin = signal<boolean>(false);
  error = signal<string>('');

  loginModel = signal<LoginData>({
    document: '123456789',
    password: '123456789',
  });
  loginForm = form(this.loginModel, (schemePath) => {
    required(schemePath.document, { message: 'El documento es obligatorio' });
    required(schemePath.password, { message: 'La contraseña es obligatoria' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    this.loginModel().document.trim();
    this.loginModel().password.trim();
    this.authStore.login(this.loginModel());
  }
}
