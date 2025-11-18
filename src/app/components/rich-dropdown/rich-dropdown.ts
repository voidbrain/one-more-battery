import {
  Component,
  input,
  output,
  signal,
  computed,
  HostListener,
  ElementRef,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { DropdownOption } from '@interfaces/index';

@Component({
  selector: 'app-rich-dropdown',
  imports: [CommonModule, IonIcon],
  templateUrl: './rich-dropdown.html',
  styleUrl: './rich-dropdown.scss',
})
export class RichDropdown {
  private elementRef = inject(ElementRef);

  // Input properties
  options = input.required<DropdownOption[]>();
  selectedValue = input.required<string>();
  triggerLabel = input<string>('Select option');

  // Output events
  selectionChange = output<string>();

  // Internal state
  protected isOpen = signal(false);
  protected dropdownStyle = signal({});

  // Computed properties
  protected selectedOption = computed(() =>
    this.options().find((option) => option.value === this.selectedValue()),
  );

  constructor() {
    // Update dropdown position when opened
    effect(() => {
      if (this.isOpen()) {
        this.updateDropdownPosition();
      }
    });
  }

  protected toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  protected selectOption(option: DropdownOption): void {
    this.selectionChange.emit(option.value);
    this.isOpen.set(false);
  }

  private updateDropdownPosition(): void {
    const triggerElement = this.elementRef.nativeElement.querySelector(
      '.dropdown-trigger',
    ) as HTMLElement;
    if (!triggerElement) return;

    // const triggerRect = triggerElement.getBoundingClientRect();
    // const dropdownWidth = Math.min(300, triggerRect.width); // Max width 300px, or trigger width if smaller

    // Check if this dropdown is inside an Ionic header/toolbar that might clip content
    // const isInHeader = !!(
    //   triggerElement.closest('ion-header') ||
    //   triggerElement.closest('ion-toolbar') ||
    //   triggerElement.closest('.toolbar-dropdowns')
    // );

    // if (isInHeader) {
    //   // Use fixed positioning relative to viewport for header dropdowns
    //   const dropdownTop = triggerRect.bottom + 4; // 4px margin below trigger

    //   this.dropdownStyle.set({
    //     position: 'fixed',
    //     top: `${dropdownTop}px`,
    //     left: `${triggerRect.left}px`,
    //     width: `${Math.max(200, triggerRect.width)}px`, // Ensure minimum width of 200px or match trigger
    //     zIndex: '100001',
    //   });
    // } else {
    //   // Standard relative positioning for regular dropdowns
    //   const top = triggerElement.offsetHeight + 4; // 4px margin below trigger
    //   const left = 0; // Align with trigger's left edge

    //   this.dropdownStyle.set({
    //     top: `${top}px`,
    //     left: `${left}px`,
    //     width: `${dropdownWidth}px`,
    //   });
    // }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const clickedDropdown = target.closest('.rich-dropdown');

    // Close if clicked outside any dropdown or on a different dropdown
    if (!clickedDropdown || !this.elementRef?.nativeElement.contains(clickedDropdown)) {
      this.isOpen.set(false);
    }
  }

  // Close dropdown on escape key
  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    this.isOpen.set(false);
  }

  // Update position on window resize
  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (this.isOpen()) {
      this.updateDropdownPosition();
    }
  }
}
