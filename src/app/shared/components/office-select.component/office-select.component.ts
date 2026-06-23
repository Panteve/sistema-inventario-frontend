import { Component, inject, input, output } from '@angular/core';
import { OfficeStore } from '../../store/office-store';

@Component({
  selector: 'app-office-select',
  imports: [],
  templateUrl: './office-select.component.html',
})
export class OfficeSelectComponent {
  value = input<number>();
  size = input<string>();
  allOffices = input<boolean>(true);
  idOffice = output<number>();
  nameOffice = output<string>();
  officeStore = inject(OfficeStore);

  changeOffice(event: Event) {
    const officeValue = Number((event.target as HTMLSelectElement).value);
    this.idOffice.emit(officeValue);
    this.nameOffice.emit(this.officeStore.offices().find((o) => o.id === officeValue)?.name ?? '');
  }
}
