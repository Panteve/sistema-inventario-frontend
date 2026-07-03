import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { InventoryMovement } from '../../../../shared/interfaces/inventoryMovement.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-view-movement',
  imports: [DatePipe],
  templateUrl: './view-movement.component.html',
})
export class ViewMovementComponent{
  movementSelected = input<InventoryMovement | null>(null);

  readonly typeLabel = computed(() => {
    const movement = this.movementSelected();
    if (!movement) {
      return '';
    }
    if (movement.type === 'IN') {
      return 'Entrada';
    }
    if (movement.type === 'OUT') {
      return 'Salida';
    }
    return 'Transferencia';
  });

  readonly totalDistinctProducts = computed(() => {
    return this.movementSelected()?.productsOnInventoryMovements.length ?? 0;
  });

  readonly totalUnits = computed(() => {
    return (
      this.movementSelected()?.productsOnInventoryMovements.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0) ?? 0
    );
  });
}
