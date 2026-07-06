import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  changeStatusProductOnInventoryRequest,
  ProductOnInventoryResponse,
} from '../interfaces/product.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  #http = inject(HttpClient);

  loadInventory(officeId?: number) {
    return this.#http.get<ProductOnInventoryResponse[]>(`${environment.apiUrl}/office-inventory/`, {
      params: { officeId: officeId ? String(officeId) : 0, isActive: String(true) },
    });
  }

  disabledProductOnInventory(
    changeStatusProductOnInventoryRequest: changeStatusProductOnInventoryRequest,
  ) {
    return this.#http.patch(
      `${environment.apiUrl}/office-inventory/change-status`,
      changeStatusProductOnInventoryRequest,
    );
  }
}
