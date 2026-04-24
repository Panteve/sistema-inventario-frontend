import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  CreateInventoryMovementRequest,
  InventoryMovementResponse,
  ParamsGetInventoryMovements,
} from '../../../shared/interfaces/inventoryMovement.interface';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  http = inject(HttpClient);

  createMovementInventory(movementData: CreateInventoryMovementRequest) {
    const payload = {
      ...movementData,
      products: movementData.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      })),
    };
    console.log('Payload for creating inventory movement:', payload);
    return this.http.post(`${environment.apiUrl}/inventory-movement`, payload);
  }
  getInventoryMovements(params: ParamsGetInventoryMovements) {
    const queryParams: any = {
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      limit: params.limit,
    };
    if (params.type) {
      queryParams.type = params.type;
    }
    if (params.fromOfficeId) {
      queryParams.fromOfficeId = params.fromOfficeId;
    }
    if (params.toOfficeId) {
      queryParams.toOfficeId = params.toOfficeId;
    }
    if (params.employeeId) {
      queryParams.employeeId = params.employeeId;
    }
    return this.http.get<InventoryMovementResponse>(`${environment.apiUrl}/inventory-movement`, {
      params: queryParams,
    });
  }
}
