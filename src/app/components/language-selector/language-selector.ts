import { Component, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-language-selector',
  imports: [FormsModule],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.scss',
})
export class LanguageSelector {
  private translocoService = inject(TranslocoService);

  protected readonly languages = [
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' },
  ];

  protected readonly selectedLanguage = signal(this.translocoService.getActiveLang());

  protected onLanguageChange(langCode: string) {
    this.translocoService.setActiveLang(langCode);
    this.selectedLanguage.set(langCode);
  }
}
