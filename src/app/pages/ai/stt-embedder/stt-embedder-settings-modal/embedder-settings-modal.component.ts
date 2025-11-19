import { Component, inject } from '@angular/core';
import { LLMConfigService } from '@services/ai/centralized-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-embedder-settings-modal',
  templateUrl: './embedder-settings-modal.component.html',
  styleUrls: ['./embedder-settings-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoModule, FormsModule],
})
export class EmbedderSettingsModalComponent {
  models: { name: string; size: number }[] = [];
  selectedModel = '';
  initialModel = '';
  hasChanges = false;


  private modalController = inject(ModalController);
  private llmConfig = inject(LLMConfigService);

  constructor() {
    this.filterModels();
    // Get current embedder model from LLM config
    const currentEmbedder = this.llmConfig.getRecommendedModelForBrowser('embedder');
    this.selectedModel = currentEmbedder?.id || '';
    this.initialModel = this.selectedModel;
  }

  filterModels(): void {
    const embedderModels = this.llmConfig.getModelsByType('embedder');
    this.models = embedderModels.map(model => ({
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
      selectedModel: this.selectedModel
    });
  }

  async cancel(): Promise<void> {
    // Reset to initial values before dismissing
    this.selectedModel = this.initialModel;

    await this.modalController.dismiss({
      hasChanges: false
    });
  }
}
