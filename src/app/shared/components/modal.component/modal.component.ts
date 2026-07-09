import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'handleEscape()',
    '(keydown)': 'trapFocus($event)',
  },
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

  private dialogEl = viewChild<ElementRef<HTMLElement>>('dialogContainer');
  private previousActiveElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
        this.previousActiveElement = document.activeElement as HTMLElement;
        requestAnimationFrame(() => {
          this.#focusFirstElement();
        });
      } else {
        document.body.style.overflow = '';
        if (this.previousActiveElement) {
          this.previousActiveElement.focus();
          this.previousActiveElement = null;
        }
      }
    });
  }

  handleEscape() {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  trapFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const el = this.dialogEl()?.nativeElement;
    if (!el) return;
    const focusable = this.#getFocusableElements(el);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  #focusFirstElement() {
    const el = this.dialogEl()?.nativeElement;
    if (!el) return;

    const preferred = el.querySelector<HTMLElement>('[data-autofocus]:not([disabled])');
    if (preferred) {
      preferred.focus();
      return;
    }

    const focusable = this.#getFocusableElements(el);
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  #getFocusableElements(el: HTMLElement): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return Array.from(el.querySelectorAll<HTMLElement>(selectors.join(',')));
  }
}
