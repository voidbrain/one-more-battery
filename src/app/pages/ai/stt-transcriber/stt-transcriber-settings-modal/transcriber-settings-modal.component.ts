import { Component, inject, HostListener } from '@angular/core';
import { TranscriberConfigStorage } from '@services/ai/stt-transcriber.config.service';
import { LLMConfigService } from '@services/ai/centralized-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { KeyValuePipe, TitleCasePipe, CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transcriber-settings-modal',
  templateUrl: './transcriber-settings-modal.component.html',
  styleUrls: ['./transcriber-settings-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TitleCasePipe, KeyValuePipe, TranslocoModule, FormsModule],
})
export class TranscriberSettingsModalComponent {
  languages = TranscriberConfigStorage.SUPPORTED_LANGUAGES;
  models: { name: string; size: number }[] = [];
  selectedModel = '';
  selectedLanguage = 'english';
  selectedIsMultilingual = true;
  initialModel = '';
  initialLanguage = 'english';
  initialIsMultilingual = true;
  hasChanges = false;

  private modalController = inject(ModalController);
  public transcriberConfigStorage = inject(TranscriberConfigStorage);
  private llmConfig = inject(LLMConfigService);

  constructor() {
    // Initialize with current values
    this.selectedModel = this.transcriberConfigStorage.model;
    this.selectedLanguage = this.transcriberConfigStorage.language;
    this.selectedIsMultilingual = this.transcriberConfigStorage.isMultilingual;

    // Store initial values for comparison
    this.initialModel = this.selectedModel;
    this.initialLanguage = this.selectedLanguage;
    this.initialIsMultilingual = this.selectedIsMultilingual;

    this.filterModels();
  }

  filterModels(): void {
    const transcriberModels = this.llmConfig.getModelsByType('transcriber');
    this.models = transcriberModels
      .filter(model => !this.selectedIsMultilingual || !model.id.startsWith('/distil-'))
      .map(model => ({
        name: `${model.id}${this.selectedIsMultilingual || model.id.includes('/distil-') ? '' : '.en'}`,
        size: model.size,
      }));
  }

  private saveSettings(): void {
    // Apply changes to storage without closing modal
    this.transcriberConfigStorage.setModelWithFallback(this.selectedModel);
    this.transcriberConfigStorage.language = this.selectedLanguage;
    this.transcriberConfigStorage.isMultilingual = this.selectedIsMultilingual;
  }

  applySettings(): void {
    // Apply changes to storage
    this.saveSettings();

    this.modalController.dismiss({
      hasChanges: this.hasChanges
    });
  }

  toggleIsMultilingual(): void {
    this.selectedIsMultilingual = !this.selectedIsMultilingual;
    this.checkForChanges();
    this.filterModels();
    // Immediately save settings when multilingual changes
    this.saveSettings();
  }

  onModelChange(): void {
    this.checkForChanges();
    // Immediately save settings when model changes
    this.saveSettings();
  }

  onLanguageChange(): void {
    this.checkForChanges();
    // Immediately save settings when language changes
    this.saveSettings();
  }

  private checkForChanges(): void {
    this.hasChanges = (
      this.selectedModel !== this.initialModel ||
      this.selectedLanguage !== this.initialLanguage ||
      this.selectedIsMultilingual !== this.initialIsMultilingual
    );
  }

  async cancel(): Promise<void> {
    // Reset to initial values before dismissing
    this.selectedModel = this.initialModel;
    this.selectedLanguage = this.initialLanguage;
    this.selectedIsMultilingual = this.initialIsMultilingual;

    await this.modalController.dismiss({
      hasChanges: false
    });
  }
}
