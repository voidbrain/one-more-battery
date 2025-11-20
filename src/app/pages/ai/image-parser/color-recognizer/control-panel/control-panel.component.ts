import { Component, inject, computed } from '@angular/core';
import { ColorClassifierService } from '@services/ai/color-classifier/color-classifier.service';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { ColorClassifierSettingsModalComponent } from '@pages/ai/image-parser/color-recognizer/modal/modal.component';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-color-classifier-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule],
})
export class ColorClassifierControlPanelComponent {
  // Model management
  isColorClassifierLoaded = computed(() => this.colorClassifierService.isModelLoaded);
  isColorClassifierLoading = computed(() => this.colorClassifierService.isModelLoading);

  private colorClassifierService = inject(ColorClassifierService);
  private llmConfig = inject(LLMConfigService);
  private modalController = inject(ModalController);

  async loadColorClassifier() {
    if (this.isColorClassifierLoaded()) return;

    try {
      await this.colorClassifierService.load();
    } catch (error) {
      console.error('Failed to load color-classifier:', error);
    }
  }

  async unloadColorClassifier() {
    try {
      await this.colorClassifierService.unload();
    } catch (error) {
      console.error('Failed to unload color-classifier:', error);
    }
  }

  async openColorClassifierSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: ColorClassifierSettingsModalComponent,
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: true, // Allow closing with ESC or clickout
    });

    await modal.present();

    const result = await modal.onWillDismiss();
    if (result.data?.hasChanges) {
      // Reset color-classifier loaded state if settings changed
      if (this.isColorClassifierLoaded()) {
        await this.unloadColorClassifier();
      }
    }
  }

  getCurrentColorClassifierModelName(): string {
    try {
      const recommended = this.llmConfig.getRecommendedModelForBrowser('colorClassifier');
      return recommended?.name || 'Unknown Model';
    } catch (error) {
      console.error('Failed to get color classifier model name:', error);
      return 'Unknown Model';
    }
  }

  getCurrentColorClassifierModelSize(): number {
    try {
      const recommended = this.llmConfig.getRecommendedModelForBrowser('colorClassifier');
      return recommended?.size || 0;
    } catch (error) {
      console.error('Failed to get color classifier model size:', error);
      return 0;
    }
  }
}
