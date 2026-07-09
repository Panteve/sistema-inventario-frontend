import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { OfficeStore } from '../../store/office-store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  selectRef = viewChild<ElementRef<HTMLSelectElement>>('officeSelect');
  officeStore = inject(OfficeStore);

  changeOffice(event: Event) {
    const officeValue = Number((event.target as HTMLSelectElement).value);
    this.idOffice.emit(officeValue);
    this.nameOffice.emit(this.officeStore.officesEntityMap()[officeValue]?.name ?? '');
  }
}
