import { Component, signal } from '@angular/core';
import {form, FormField} from '@angular/forms/signals';

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
  loginModel = signal<LoginData>({
    document: '',
    password: ''
  });

  loginForm = form(this.loginModel);

  async onSubmit() {
    const loginData = this.loginModel();
    console.log(loginData.document, loginData.password);
  }
}
