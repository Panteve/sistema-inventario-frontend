import { Component, input, output, HostListener } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  ariaLabel = input.required<string>();
  showCloseButton = input(true);
  close = output<void>();

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.isOpen()) {
      this.close.emit();
    }
  }
}
