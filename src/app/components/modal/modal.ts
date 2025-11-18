import {
  Component,
  input,
  output,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal implements AfterViewInit, OnChanges {
  isOpen = input(false);
  title = input('');
  closeModal = output<void>();

  @ViewChild('modalBackdrop', { static: false }) modalBackdrop!: ElementRef;

  ngAfterViewInit() {
    if (this.isOpen()) {
      this.focusBackdrop();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      // Use setTimeout to ensure the view is rendered
      setTimeout(() => this.focusBackdrop(), 0);
    }
  }

  private focusBackdrop() {
    if (this.modalBackdrop) {
      this.modalBackdrop.nativeElement.focus();
    }
  }

  protected handleClose() {
    this.closeModal.emit();
  }

  protected onBackdropClick(event: Event) {
    // Close modal when clicking on backdrop (outside modal content)
    const target = event.target as HTMLElement;

    // Check if the click was on the backdrop itself, not on the modal content
    if (target === event.currentTarget) {
      this.handleClose();
    }
  }

  protected onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleClose();
    }
  }
}
