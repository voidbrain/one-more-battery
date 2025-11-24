import { Component, inject } from '@angular/core';
import { DetectorConfigStorage } from '@services/ai/image-object-detector/detector.config.service';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';

import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-object-detector-settings-modal',
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoModule, FormsModule],
})
export class DetectorSettingsModalComponent {
  models: { name: string; size: number }[] = [];
  selectedModel = '';
  selectedConfidence = 0.5;
  initialModel = '';
  initialConfidence = 0.5;
  hasChanges = false;

  private modalController = inject(ModalController);
  public detectorConfigStorage = inject(DetectorConfigStorage);
  private llmConfig = inject(LLMConfigService);

  constructor() {
    // Initialize with current values
    this.selectedModel = this.detectorConfigStorage.model;
    this.selectedConfidence = this.detectorConfigStorage.confidence;

    // Store initial values for comparison
    this.initialModel = this.selectedModel;
    this.initialConfidence = this.selectedConfidence;

    this.filterModels();
  }

  filterModels(): void {
    const detectorModels = this.llmConfig.getModelsByType('imageObjectDetector');
    this.models = detectorModels.map((model) => ({
      name: model.id,
      size: model.size,
    }));
  }

  onModelChange(): void {
    this.checkForChanges();
    // Immediately save settings when model changes
    this.saveSettings();
  }

  onConfidenceChange(): void {
    this.checkForChanges();
    // Immediately save settings when confidence changes
    this.saveSettings();
  }

  private saveSettings(): void {
    // Apply changes to storage without closing modal
    this.detectorConfigStorage.setModelWithFallback(this.selectedModel);
    this.detectorConfigStorage.confidence = this.selectedConfidence;
  }

  private checkForChanges(): void {
    this.hasChanges =
      this.selectedModel !== this.initialModel ||
      this.selectedConfidence !== this.initialConfidence;
  }

  applySettings(): void {
    // Apply changes to storage
    this.saveSettings();

    this.modalController.dismiss({
      hasChanges: this.hasChanges,
    });
  }

  async cancel(): Promise<void> {
    // Reset to initial values before dismissing
    this.selectedModel = this.initialModel;
    this.selectedConfidence = this.initialConfidence;

    await this.modalController.dismiss({
      hasChanges: false,
    });
  }
}
