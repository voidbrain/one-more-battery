import { Component, inject } from '@angular/core';

import { Theme, ThemeType } from '@services/ui/theme';

@Component({
  selector: 'app-theme-switcher',
  imports: [],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.scss',
})
export class ThemeSwitcher {
  private themeService = inject(Theme);

  protected currentTheme = this.themeService.currentThemeSignal;
  protected isDark = this.themeService.isDark.bind(this.themeService);

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected setTheme(theme: ThemeType): void {
    this.themeService.setTheme(theme);
  }
}
