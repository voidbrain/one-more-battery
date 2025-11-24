import { Component, inject } from '@angular/core';
import { Theme } from '@services/ui/theme';
import { StyleType } from '@interfaces/index';
import {
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';


@Component({
  selector: 'app-style-picker',
  imports: [IonButton, IonIcon, IonPopover, IonList, IonItem, IonLabel],
  templateUrl: './style-picker.html',
  styleUrl: './style-picker.scss',
})
export class StylePicker {
  private themeService = inject(Theme);

  protected isOpen = false;
  protected currentStyle = this.themeService.styleThemeValue;

  protected styleOptions: { value: StyleType; label: string; icon: string }[] = [
    { value: 'default', label: 'Default', icon: 'square' },
    { value: 'liquid-glass', label: 'Liquid Glass', icon: 'diamond' },
  ];

  protected setStyle(style: StyleType) {
    this.themeService.setStyleTheme(style);
    this.currentStyle = style;
    this.isOpen = false;
  }

  protected togglePopover() {
    this.isOpen = !this.isOpen;
  }

  protected getCurrentIcon(): string {
    return this.styleOptions.find((s) => s.value === this.currentStyle)?.icon || 'square';
  }
}
