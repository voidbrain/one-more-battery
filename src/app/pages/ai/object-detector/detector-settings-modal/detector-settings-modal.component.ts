import { Component, inject } from '@angular/core';
import { DetectorConfigStorage } from '@services/ai/object-detector/detector.config.service';
import { LLMConfigService } from '@services/ai/centralized-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-object-detector-settings-modal',
  templateUrl: './detector-settings-modal.component.html',
  styleUrls: ['./detector-settings-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule, FormsModule],
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
    const detectorModels = this.llmConfig.getModelsByType('detector');
    this.models = detectorModels.map(model => ({
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
    this.hasChanges = (
      this.selectedModel !== this.initialModel ||
      this.selectedConfidence !== this.initialConfidence
    );
  }

  applySettings(): void {
    // Apply changes to storage
    this.saveSettings();

    this.modalController.dismiss({
      hasChanges: this.hasChanges
    });
  }

  async cancel(): Promise<void> {
    // Reset to initial values before dismissing
    this.selectedModel = this.initialModel;
    this.selectedConfidence = this.initialConfidence;

    await this.modalController.dismiss({
      hasChanges: false
    });
  }
}
