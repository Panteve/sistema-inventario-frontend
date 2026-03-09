import { Component, inject } from '@angular/core';
import { ErrorStore } from '../../../core/store/errors-store';

@Component({
  selector: 'app-dashboard.component',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  errorStore = inject(ErrorStore);
}
