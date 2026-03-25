import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  http = inject(HttpClient);

  createMovementInventory(movementData: any) {
    return this.http.post(`${environment.apiUrl}/inventory-movement`, movementData);
  }
}
