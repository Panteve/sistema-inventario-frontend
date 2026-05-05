import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import { ProductOnInventoryResponse } from '../interfaces/product.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  modalClose = signal<boolean>(false);

  loadInventory() {
    const officeId = this.authStore.employee()?.officeId;
    return this.http.get<ProductOnInventoryResponse[]>(`${environment.apiUrl}/office-inventory/`, {
      params: { officeId: officeId ? String(officeId) : 0 },
    });
  }
}
