import { Component, inject, computed } from '@angular/core';
import { DetectorService } from '@services/ai/image-object-detector/detector.service';
import { DetectorConfigStorage } from '@services/ai/image-object-detector/detector.config.service';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { DetectorSettingsModalComponent } from '@pages/ai/image-parser/object-detector/modal/modal';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-image-object-detector-control-panel',
  templateUrl: './control-panel.html',
  styleUrl: './control-panel.scss',
  standalone: true,
  imports: [IonicModule, TranslocoModule],
})
export class ImageObjectDetectorPanel {
  // Detection state
  isDetectorLoaded = computed(() => this.detectorService.isModelLoaded);
  isDetectorLoading = computed(() => this.detectorService.isModelLoading);

  private detectorService = inject(DetectorService);
  private detectorConfigStorage = inject(DetectorConfigStorage);
  private llmConfig = inject(LLMConfigService);
  private modalController = inject(ModalController);

  async loadDetector() {
    if (this.isDetectorLoaded()) return;

    try {
      await this.detectorService.load();
    } catch (error) {
      console.error('Failed to load detector:', error);
    }
  }

  async unloadDetector() {
    try {
      await this.detectorService.unload();
    } catch (error) {
      console.error('Failed to unload detector:', error);
    }
  }

  async openDetectorSettings(): Promise<void> {
    const initialModel = this.detectorConfigStorage.model;

    const modal = await this.modalController.create({
      component: DetectorSettingsModalComponent,
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: true, // Allow closing with ESC or clickout
    });

    await modal.present();

    const result = await modal.onWillDismiss();
    // Check if model changed (either from explicit apply or immediate save on change)
    if (result.data?.hasChanges || this.detectorConfigStorage.model !== initialModel) {
      // Reset detector loaded state if settings changed
      if (this.isDetectorLoaded()) {
        await this.unloadDetector();
      }
    }
  }

  getCurrentModelName(): string {
    const model = this.detectorConfigStorage.model;
    const modelInfo = this.llmConfig.getModelById(model);
    return modelInfo?.name || model;
  }

  getCurrentModelSize(): number {
    const model = this.detectorConfigStorage.model;
    const modelInfo = this.llmConfig.getModelById(model);
    return modelInfo?.size || 0;
  }
}
