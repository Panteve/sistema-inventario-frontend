import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CreateInventoryMovementRequest, InventoryMovementResponse, ParamsGetInventoryMovements } from '../../../shared/interfaces/inventoryMovement.interface';


@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  http = inject(HttpClient);

  createMovementInventory(movementData: CreateInventoryMovementRequest) {
    return this.http.post(`${environment.apiUrl}/inventory-movement`, movementData);
  }
  getInventoryMovements(params: ParamsGetInventoryMovements) {
    return this.http.get<InventoryMovementResponse>(`${environment.apiUrl}/inventory-movement`,{
      params: { ...params }
    });
  }
}
