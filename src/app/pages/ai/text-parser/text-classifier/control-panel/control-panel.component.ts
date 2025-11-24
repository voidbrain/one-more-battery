import { Component, inject, computed } from '@angular/core';
import { TextClassifierService } from '@services/ai/text-classifier/text-classifier.service';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { TextClassifierSettingsModalComponent } from '@pages/ai/text-parser/text-classifier/modal/modal.component';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-text-classifier-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoModule],
})
export class TextClassifierControlPanelComponent {
  // Model management
  isTextClassifierLoaded = computed(() => this.textClassifierService.isModelLoaded);
  isTextClassifierLoading = computed(() => this.textClassifierService.isModelLoading);

  private textClassifierService = inject(TextClassifierService);
  private llmConfig = inject(LLMConfigService);
  private modalController = inject(ModalController);

  async loadTextClassifier() {
    if (this.isTextClassifierLoaded()) return;

    try {
      await this.textClassifierService.load();
    } catch (error) {
      console.error('Failed to load text-classifier:', error);
    }
  }

  async unloadTextClassifier() {
    try {
      await this.textClassifierService.unload();
    } catch (error) {
      console.error('Failed to unload text-classifier:', error);
    }
  }

  async openTextClassifierSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: TextClassifierSettingsModalComponent,
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: true, // Allow closing with ESC or clickout
    });

    await modal.present();

    const result = await modal.onWillDismiss();
    if (result.data?.hasChanges) {
      // Reset text-classifier loaded state if settings changed
      if (this.isTextClassifierLoaded()) {
        await this.unloadTextClassifier();
      }
    }
  }

  getCurrentTextClassifierModelName(): string {
    const recommended = this.llmConfig.getRecommendedModelForBrowser('textClassifier');
    return recommended.name;
  }

  getCurrentTextClassifierModelSize(): number {
    const recommended = this.llmConfig.getRecommendedModelForBrowser('textClassifier');
    return recommended.size;
  }
}
