import { Component, inject } from '@angular/core';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-classifier-settings-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoModule, FormsModule],
})
export class ColorClassifierSettingsModalComponent {
  models: { name: string; size: number }[] = [];
  selectedModel = '';
  initialModel = '';
  hasChanges = false;

  private modalController = inject(ModalController);
  private llmConfig = inject(LLMConfigService);

  constructor() {
    this.filterModels();
    // Get current text-classifier model from LLM config
    const currentColorClassifier = this.llmConfig.getRecommendedModelForBrowser('colorClassifier');
    this.selectedModel = currentColorClassifier?.id || '';
    this.initialModel = this.selectedModel;
  }

  filterModels(): void {
    const colorClassifierModels = this.llmConfig.getModelsByType('colorClassifier');
    this.models = colorClassifierModels.map((model) => ({
      name: model.id,
      size: model.size,
    }));
  }

  onModelChange(): void {
    this.hasChanges = this.selectedModel !== this.initialModel;
    // Immediately apply settings when model changes
    if (this.hasChanges) {
      this.applySettings();
    }
  }

  private checkForChanges(): void {
    this.hasChanges = this.selectedModel !== this.initialModel;
  }

  applySettings(): void {
    this.modalController.dismiss({
      hasChanges: this.hasChanges,
      selectedModel: this.selectedModel,
    });
  }

  async cancel(): Promise<void> {
    // Reset to initial values before dismissing
    this.selectedModel = this.initialModel;

    await this.modalController.dismiss({
      hasChanges: false,
    });
  }
}
