import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import { ProductOnInventoryResponse } from '../interfaces/product.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  #http = inject(HttpClient);


  loadInventory(isActive: boolean, officeId?: number) {
    return this.#http.get<ProductOnInventoryResponse[]>(`${environment.apiUrl}/office-inventory/`, {
      params: { officeId: officeId ? String(officeId) : 0, isActive: String(isActive) },
    });
  }
}
